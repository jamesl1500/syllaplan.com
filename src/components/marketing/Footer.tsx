import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-stone-200">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-8 text-sm text-stone-500 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-clay-500" />
          <span>&copy; {new Date().getFullYear()} {siteConfig.name}</span>
        </div>
        <nav className="flex items-center gap-5">
          <Link href="/privacy" className="hover:text-stone-800">Privacy</Link>
          <Link href="/terms" className="hover:text-stone-800">Terms</Link>
          <Link href="/signup" className="hover:text-stone-800">Get started</Link>
        </nav>
      </div>
    </footer>
  );
}
