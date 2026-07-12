import Link from "next/link";
import { CalendarDays } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-cream px-4 py-16">
      <Link href="/" className="flex items-center gap-2 text-stone-900">
        <CalendarDays className="h-5 w-5 text-clay-500" />
        <span className="font-serif text-lg font-medium">Syllaplan</span>
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 shadow-sm shadow-stone-900/5">
        {children}
      </div>
    </div>
  );
}
