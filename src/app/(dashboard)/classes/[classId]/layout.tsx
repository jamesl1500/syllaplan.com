import Link from "next/link";
import { notFound } from "next/navigation";
import { getClassById } from "@/lib/dal";
import { ClassTabNav } from "@/components/classes/ClassTabNav";

export default async function ClassLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;

  let klass;
  try {
    klass = await getClassById(classId);
  } catch {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/classes" className="text-sm text-stone-500 hover:text-stone-700">
          &larr; All classes
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: klass.color }} />
          <h1 className="font-serif text-2xl font-medium text-stone-900">{klass.name}</h1>
        </div>
        {(klass.course_code || klass.term) && (
          <p className="mt-1 text-sm text-stone-500">
            {[klass.course_code, klass.term].filter(Boolean).join(" — ")}
          </p>
        )}
      </div>
      <ClassTabNav classId={classId} />
      {children}
    </div>
  );
}
