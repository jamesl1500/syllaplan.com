import Link from "next/link";
import { getUpcomingAgenda, type OverviewItem } from "@/lib/overview/get-upcoming-agenda";

const KIND_STYLES: Record<OverviewItem["kind"], string> = {
  exam: "bg-red-100 text-red-800",
  holiday: "bg-stone-100 text-stone-600",
  no_class: "bg-stone-100 text-stone-600",
  other: "bg-amber-100 text-amber-800",
  task: "bg-emerald-100 text-emerald-800",
  session: "bg-stone-100 text-stone-600",
};

const KIND_LABELS: Record<OverviewItem["kind"], string> = {
  exam: "Exam",
  holiday: "Holiday",
  no_class: "No class",
  other: "Event",
  task: "Task",
  session: "Class",
};

export async function UpcomingOverview() {
  const { overdueTasks, days } = await getUpcomingAgenda();

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm shadow-stone-900/5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-500">Coming up</h2>

      {overdueTasks.length > 0 && (
        <div className="mb-5 flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
            Overdue ({overdueTasks.length})
          </p>
          {overdueTasks.map((task) => (
            <Link
              key={task.id}
              href={`/classes/${task.classId}/tasks`}
              className="flex items-center gap-2 text-sm text-stone-800 hover:text-stone-950"
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: task.classColor }} />
              <span className="shrink-0 font-medium text-red-700">{task.classLabel}</span>
              <span className="truncate">{task.title}</span>
            </Link>
          ))}
        </div>
      )}

      {days.length === 0 ? (
        <p className="text-sm text-stone-500">Nothing scheduled in the next two weeks.</p>
      ) : (
        <div className="flex flex-col divide-y divide-stone-100">
          {days.map(({ date, items }) => (
            <div key={date.toISOString()} className="flex gap-4 py-3 first:pt-0 last:pb-0">
              <div className="w-16 shrink-0 pt-0.5 text-xs font-medium text-stone-500">
                {date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                {items.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-1 hover:bg-stone-50"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-sm">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: item.classColor }}
                      />
                      <span className="shrink-0 font-medium text-stone-500">{item.classLabel}</span>
                      <span className="truncate text-stone-800">{item.title}</span>
                      {item.meta && (
                        <span className="hidden shrink-0 text-xs text-stone-400 sm:inline">{item.meta}</span>
                      )}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${KIND_STYLES[item.kind]}`}
                    >
                      {KIND_LABELS[item.kind]}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
