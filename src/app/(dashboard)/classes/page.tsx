import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { getClasses } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { UpcomingOverview } from "@/components/dashboard/UpcomingOverview";

export default async function ClassesPage() {
  const classes = await getClasses();

  const draftSyllabi = classes.filter((c) => c.status === "draft");
  const activeClasses = classes.filter((c) => c.status !== "draft");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium text-stone-900">Your classes</h1>
        <Link href="/classes/upload">
          <Button>
            <Plus className="h-4 w-4" />
            Upload syllabus
          </Button>
        </Link>
      </div>

      {classes.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-white/50 py-16 text-center">
          <FileText className="h-8 w-8 text-stone-400" />
          <p className="text-stone-600">
            No classes yet. Upload a syllabus to get started.
          </p>
          <Link href="/classes/upload">
            <Button>Upload your first syllabus</Button>
          </Link>
        </div>
      )}

      {activeClasses.length > 0 && <UpcomingOverview />}

      {draftSyllabi.length > 0 && (
        <DraftList classIds={draftSyllabi.map((c) => c.id)} names={draftSyllabi.map((c) => c.name)} />
      )}

      {activeClasses.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeClasses.map((klass) => (
            <Link
              key={klass.id}
              href={`/classes/${klass.id}/calendar`}
              className="rounded-2xl border border-stone-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-stone-900/5"
            >
              <div className="mb-3 h-1.5 w-10 rounded-full" style={{ backgroundColor: klass.color }} />
              <h2 className="font-serif text-lg font-medium text-stone-900">{klass.name}</h2>
              {klass.course_code && (
                <p className="text-sm text-stone-500">{klass.course_code}</p>
              )}
              {klass.term && <p className="text-sm text-stone-500">{klass.term}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

async function DraftList({ classIds, names }: { classIds: string[]; names: string[] }) {
  const supabase = await createClient();
  const { data: syllabi } = await supabase
    .from("syllabi")
    .select("id, class_id, parse_status")
    .in("class_id", classIds);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-stone-500">Awaiting review</h2>
      {classIds.map((classId, i) => {
        const syllabus = syllabi?.find((s) => s.class_id === classId);
        if (!syllabus) return null;
        const isParsed = syllabus.parse_status === "parsed";
        return (
          <Link
            key={classId}
            href={
              isParsed
                ? `/classes/${classId}/review/${syllabus.id}`
                : `/classes/upload?retry=${syllabus.id}`
            }
            className="flex items-center justify-between rounded-xl border border-clay-200 bg-clay-50 px-4 py-3 text-sm"
          >
            <span className="text-stone-800">{names[i]}</span>
            <span className="font-medium text-clay-700">
              {isParsed
                ? "Review extracted schedule ->"
                : syllabus.parse_status === "failed"
                  ? "Parsing failed — retry"
                  : "Processing..."}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
