"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Choose a PDF file first.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/syllabi/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        setSubmitting(false);
        return;
      }

      if (data.parseFailed) {
        router.push(`/classes?parseFailed=${data.syllabusId}`);
        return;
      }

      router.push(`/classes/${data.classId}/review/${data.syllabusId}`);
    } catch {
      setError("Upload failed. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label
        htmlFor="syllabus-file"
        className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-stone-300 bg-white px-6 py-12 text-center transition-colors hover:border-clay-400"
      >
        <UploadCloud className="h-8 w-8 text-stone-400" />
        <span className="text-sm text-stone-600">
          {fileName ?? "Click to choose a syllabus PDF"}
        </span>
        <input
          ref={inputRef}
          id="syllabus-file"
          name="file"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting || !fileName}>
        {submitting ? "Uploading and analyzing..." : "Upload and analyze"}
      </Button>
      {submitting && (
        <p className="text-sm text-stone-500">
          Claude is reading your syllabus — this can take up to a minute.
        </p>
      )}
    </form>
  );
}
