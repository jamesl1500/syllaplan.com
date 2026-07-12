"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ClassTabNav({ classId }: { classId: string }) {
  const pathname = usePathname();

  const tabs = [
    { href: `/classes/${classId}/calendar`, label: "Calendar" },
    { href: `/classes/${classId}/tasks`, label: "Tasks" },
  ];

  return (
    <nav className="flex gap-1 border-b border-stone-200">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-clay-500 text-clay-600"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
