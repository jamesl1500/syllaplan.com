import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UploadForm } from "@/components/syllabus/UploadForm";

export default function UploadPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Link href="/classes" className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700">
        <ArrowLeft className="h-4 w-4" />
        Back to classes
      </Link>
      <div>
        <h1 className="font-serif text-2xl font-medium text-stone-900">Upload a syllabus</h1>
        <p className="mt-1 text-sm text-stone-600">
          PDF only. Claude will read it and extract the class schedule, exam dates, and assignments —
          you&apos;ll review everything before it&apos;s saved.
        </p>
      </div>
      <UploadForm />
    </div>
  );
}
