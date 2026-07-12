import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";
import { syllabusExtractionSchema } from "@/lib/anthropic/schema";
import { ReviewEditor } from "@/components/syllabus/ReviewEditor";
import { Button } from "@/components/ui/Button";
import { reparseSyllabus } from "./actions";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ classId: string; syllabusId: string }>;
}) {
  const { classId, syllabusId } = await params;
  await verifySession();
  const supabase = await createClient();

  const { data: syllabus, error } = await supabase
    .from("syllabi")
    .select("id, class_id, parse_status, error_message, raw_extraction, original_filename")
    .eq("id", syllabusId)
    .single();

  if (error || !syllabus || syllabus.class_id !== classId) {
    return <p className="text-sm text-red-600">Syllabus not found.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/classes" className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700">
        <ArrowLeft className="h-4 w-4" />
        Back to classes
      </Link>

      <div>
        <h1 className="font-serif text-2xl font-medium text-stone-900">Review extracted schedule</h1>
        <p className="mt-1 text-sm text-stone-600">
          From {syllabus.original_filename}. Nothing is saved to your calendar until you confirm.
        </p>
      </div>

      {syllabus.parse_status === "failed" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">
            Parsing failed{syllabus.error_message ? `: ${syllabus.error_message}` : "."}
          </p>
          <form action={async () => { "use server"; await reparseSyllabus(syllabusId); }} className="mt-4">
            <Button type="submit">Retry parsing</Button>
          </form>
        </div>
      )}

      {(syllabus.parse_status === "processing" || syllabus.parse_status === "pending") && (
        <p className="text-sm text-stone-500">Still processing — check back in a moment.</p>
      )}

      {syllabus.parse_status === "confirmed" && (
        <p className="text-sm text-stone-500">This syllabus has already been confirmed.</p>
      )}

      {syllabus.parse_status === "parsed" &&
        (() => {
          const parsed = syllabusExtractionSchema.safeParse(syllabus.raw_extraction);
          if (!parsed.success) {
            return <p className="text-sm text-red-600">The extracted data looks malformed. Try re-parsing.</p>;
          }
          return (
            <ReviewEditor classId={classId} syllabusId={syllabusId} extraction={parsed.data} />
          );
        })()}
    </div>
  );
}
