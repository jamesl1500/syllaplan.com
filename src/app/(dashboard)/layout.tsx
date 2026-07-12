import Link from "next/link";
import { CalendarDays, LogOut, Settings } from "lucide-react";
import { verifySession } from "@/lib/dal";
import { signOut } from "@/app/(auth)/actions";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await verifySession();

  return (
    <div className="flex flex-1 flex-col bg-cream">
      <header className="border-b border-stone-200 bg-cream/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/classes" className="flex items-center gap-2 font-serif text-lg font-medium text-stone-900">
            <CalendarDays className="h-5 w-5 text-clay-500" />
            Syllaplan
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/account"
              className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900"
              aria-label="Account settings"
            >
              <Settings className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">{user.email}</span>
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
