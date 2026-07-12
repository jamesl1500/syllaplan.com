import { toISODate, addDays } from "@/lib/calendar/date-utils";
import { TaskListItem, type TaskRecord } from "./TaskListItem";

export function TaskList({ tasks, classId }: { tasks: TaskRecord[]; classId: string }) {
  const todayISO = toISODate(new Date());
  const weekAheadISO = toISODate(addDays(new Date(), 7));

  const completed = tasks.filter((t) => t.completed);
  const incomplete = tasks.filter((t) => !t.completed);

  const overdue = incomplete.filter((t) => t.due_date && t.due_date < todayISO);
  const thisWeek = incomplete.filter(
    (t) => t.due_date && t.due_date >= todayISO && t.due_date <= weekAheadISO,
  );
  const later = incomplete.filter((t) => !t.due_date || t.due_date > weekAheadISO);

  const groups: { label: string; items: TaskRecord[] }[] = [
    { label: "Overdue", items: overdue },
    { label: "This week", items: thisWeek },
    { label: "Later", items: later },
    { label: "Completed", items: completed },
  ].filter((g) => g.items.length > 0);

  if (groups.length === 0) {
    return <p className="py-8 text-center text-sm text-stone-500">No assignments yet.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label}>
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-stone-500">
            {group.label} ({group.items.length})
          </h2>
          <div className="rounded-2xl border border-stone-200 bg-white px-4">
            {group.items.map((task) => (
              <TaskListItem key={task.id} task={task} classId={classId} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
