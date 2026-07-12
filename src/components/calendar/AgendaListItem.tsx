import { EventBadge } from "./EventBadge";
import type { DayItem } from "./MonthGridDay";

export function AgendaListItem({
  date,
  items,
  classColor,
}: {
  date: Date;
  items: DayItem[];
  classColor: string;
}) {
  return (
    <div className="flex gap-4 border-b border-stone-200 py-3 last:border-0">
      <div className="w-20 shrink-0 text-sm text-stone-500">
        {date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        {items.map((item) => (
          <EventBadge key={item.key} kind={item.kind} label={item.label} color={item.kind === "session" ? classColor : undefined} />
        ))}
      </div>
    </div>
  );
}
