import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";

export function MarketingHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="flex items-center gap-2 text-stone-900">
        <CalendarDays className="h-5 w-5 text-clay-500" />
        <span className="font-serif text-lg font-medium">{siteConfig.name}</span>
      </Link>
      <div className="flex items-center gap-2">
        <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-stone-700 hover:text-stone-900">
          Log in
        </Link>
        <Link href="/signup">
          <Button className="text-sm">Get started</Button>
        </Link>
      </div>
    </header>
  );
}
