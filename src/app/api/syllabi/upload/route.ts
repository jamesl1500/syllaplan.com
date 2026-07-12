export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractSyllabus, SYLLABUS_MODEL } from "@/lib/anthropic/extract-syllabus";

const MAX_BYTES = 15 * 1024 * 1024;
const UPLOAD_ATTEMPTS = 3;

// Supabase Storage uploads occasionally hit transient socket resets
// (UND_ERR_SOCKET "other side closed") between Node's fetch and the storage
// API — retrying almost always succeeds on the 2nd or 3rd try.
async function uploadWithRetry(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string,
  bytes: Buffer,
) {
  let lastError: { message: string } | null = null;
  for (let attempt = 1; attempt <= UPLOAD_ATTEMPTS; attempt++) {
    const { error } = await supabase.storage
      .from("syllabi")
      .upload(path, bytes, { contentType: "application/pdf", upsert: true });
    if (!error) return null;
    lastError = error;
    console.error(`[upload] storage upload attempt ${attempt}/${UPLOAD_ATTEMPTS} failed:`, error);
    if (attempt < UPLOAD_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }
  return lastError;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("[upload] no authenticated user:", userError?.message);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File) || file.type !== "application/pdf") {
    console.error("[upload] rejected: not a PDF File", { type: (file as File | null)?.type });
    return NextResponse.json({ error: "Please upload a PDF file." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    console.error(`[upload] rejected: file too large (${file.size} bytes)`);
    return NextResponse.json({ error: "File too large (max 15MB)." }, { status: 400 });
  }

  console.log(`[upload] user=${user.id} file=${file.name} size=${file.size}`);

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") {
    console.error("[upload] rejected: missing %PDF- header");
    return NextResponse.json({ error: "File does not look like a valid PDF." }, { status: 400 });
  }

  const { data: klass, error: classError } = await supabase
    .from("classes")
    .insert({ user_id: user.id, name: file.name.replace(/\.pdf$/i, ""), status: "draft" })
    .select("id")
    .single();
  if (classError || !klass) {
    console.error("[upload] failed to insert class:", classError);
    return NextResponse.json({ error: classError?.message ?? "Failed to create class." }, { status: 500 });
  }
  console.log(`[upload] created class ${klass.id}`);

  const { data: syllabus, error: syllabusError } = await supabase
    .from("syllabi")
    .insert({
      class_id: klass.id,
      user_id: user.id,
      original_filename: file.name,
      file_size_bytes: file.size,
      parse_status: "processing",
    })
    .select("id")
    .single();
  if (syllabusError || !syllabus) {
    console.error("[upload] failed to insert syllabus row:", syllabusError);
    return NextResponse.json({ error: syllabusError?.message ?? "Failed to create syllabus record." }, { status: 500 });
  }
  console.log(`[upload] created syllabus ${syllabus.id}`);

  const storagePath = `${user.id}/${syllabus.id}.pdf`;
  const uploadError = await uploadWithRetry(supabase, storagePath, bytes);

  if (uploadError) {
    console.error(`[upload] storage upload failed after ${UPLOAD_ATTEMPTS} attempts:`, uploadError);
    await supabase
      .from("syllabi")
      .update({ parse_status: "failed", error_message: uploadError.message })
      .eq("id", syllabus.id);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }
  console.log(`[upload] stored PDF at ${storagePath}, starting extraction`);

  await supabase.from("syllabi").update({ storage_path: storagePath }).eq("id", syllabus.id);

  try {
    const extraction = await extractSyllabus(bytes.toString("base64"));
    await supabase
      .from("syllabi")
      .update({ parse_status: "parsed", raw_extraction: extraction, model_used: SYLLABUS_MODEL })
      .eq("id", syllabus.id);
    console.log(`[upload] parsed OK for syllabus ${syllabus.id}`);
    return NextResponse.json({ classId: klass.id, syllabusId: syllabus.id });
  } catch (err) {
    console.error(`[upload] extraction failed for syllabus ${syllabus.id}:`, err);
    await supabase
      .from("syllabi")
      .update({
        parse_status: "failed",
        error_message: err instanceof Error ? err.message : "Unknown error",
      })
      .eq("id", syllabus.id);
    // 200, not 500 — the class/syllabus rows exist; the client routes to a
    // "parsing failed, retry" state rather than a hard error page.
    return NextResponse.json({ classId: klass.id, syllabusId: syllabus.id, parseFailed: true });
  }
}
