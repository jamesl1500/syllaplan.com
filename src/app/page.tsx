import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, UploadCloud, ListChecks, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/classes");
  }

  return (
    <div className="flex flex-1 flex-col bg-cream">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-stone-900">
          <CalendarDays className="h-5 w-5 text-clay-500" />
          <span className="font-serif text-lg font-medium">Syllaplan</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-stone-700 hover:text-stone-900">
            Log in
          </Link>
          <Link href="/signup">
            <Button className="text-sm">Get started</Button>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-6">
        <section className="flex max-w-3xl flex-col items-center gap-7 py-20 text-center sm:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/60 px-4 py-1.5 text-xs font-medium text-stone-600">
            <span className="h-1.5 w-1.5 rounded-full bg-clay-500" />
            Built for students, powered by Claude
          </div>
          <h1 className="text-5xl leading-[1.08] font-medium tracking-tight text-stone-900 sm:text-6xl">
            Turn your syllabus into
            <br />
            <span className="italic text-clay-600">a calendar</span> in seconds.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-stone-600">
            Upload a syllabus PDF for each class. Claude reads it and finds your schedule, exam
            dates, and assignments — you review everything, then it becomes a calendar and task
            list you can actually rely on.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup">
              <Button className="px-6 py-3 text-base">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="px-6 py-3 text-base">
                Log in
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid w-full max-w-5xl grid-cols-1 gap-5 pb-24 sm:grid-cols-3">
          <Feature
            step="01"
            icon={<UploadCloud className="h-5 w-5" />}
            title="Upload"
          >
            Drop in a syllabus PDF for each class — no formatting or cleanup needed.
          </Feature>
          <Feature
            step="02"
            icon={<CalendarDays className="h-5 w-5" />}
            title="Review"
          >
            Claude extracts your schedule, exams, and due dates. You confirm before anything saves.
          </Feature>
          <Feature
            step="03"
            icon={<ListChecks className="h-5 w-5" />}
            title="Track"
          >
            Get a live calendar and task list for every class, kept in one place automatically.
          </Feature>
        </section>
      </main>
    </div>
  );
}

function Feature({
  step,
  icon,
  title,
  children,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md hover:shadow-stone-900/5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-clay-50 text-clay-600">
          {icon}
        </div>
        <span className="font-serif text-sm text-stone-300">{step}</span>
      </div>
      <h3 className="font-serif text-lg font-medium text-stone-900">{title}</h3>
      <p className="text-sm leading-relaxed text-stone-600">{children}</p>
    </div>
  );
}
