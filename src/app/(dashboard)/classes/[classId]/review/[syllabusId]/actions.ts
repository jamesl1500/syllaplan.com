"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";
import { confirmedExtractionSchema, type ConfirmedExtraction } from "@/lib/anthropic/schema";

export async function confirmSyllabus(
  classId: string,
  syllabusId: string,
  draft: ConfirmedExtraction,
) {
  await verifySession();
  const parsed = confirmedExtractionSchema.parse(draft);
  const supabase = await createClient();

  const { error } = await supabase.rpc("confirm_syllabus", {
    p_class_id: classId,
    p_syllabus_id: syllabusId,
    p_course: parsed.course,
    p_schedule: parsed.schedule,
    p_events: parsed.events,
    p_tasks: parsed.tasks,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/classes");
  revalidatePath(`/classes/${classId}`);
  redirect(`/classes/${classId}/calendar`);
}

export async function reparseSyllabus(syllabusId: string) {
  await verifySession();
  const supabase = await createClient();

  const { data: syllabus, error } = await supabase
    .from("syllabi")
    .select("id, class_id, storage_path")
    .eq("id", syllabusId)
    .single();

  if (error || !syllabus) {
    throw new Error(error?.message ?? "Syllabus not found.");
  }

  await supabase
    .from("syllabi")
    .update({ parse_status: "processing", error_message: null })
    .eq("id", syllabusId);

  const { data: file, error: downloadError } = await supabase.storage
    .from("syllabi")
    .download(syllabus.storage_path);

  if (downloadError || !file) {
    await supabase
      .from("syllabi")
      .update({ parse_status: "failed", error_message: downloadError?.message ?? "Could not re-download file." })
      .eq("id", syllabusId);
    throw new Error(downloadError?.message ?? "Could not re-download file.");
  }

  const { extractSyllabus, SYLLABUS_MODEL } = await import("@/lib/anthropic/extract-syllabus");
  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const extraction = await extractSyllabus(bytes.toString("base64"));
    await supabase
      .from("syllabi")
      .update({ parse_status: "parsed", raw_extraction: extraction, model_used: SYLLABUS_MODEL })
      .eq("id", syllabusId);
  } catch (err) {
    await supabase
      .from("syllabi")
      .update({
        parse_status: "failed",
        error_message: err instanceof Error ? err.message : "Unknown error",
      })
      .eq("id", syllabusId);
    throw err;
  }

  revalidatePath(`/classes/${syllabus.class_id}/review/${syllabusId}`);
  redirect(`/classes/${syllabus.class_id}/review/${syllabusId}`);
}
