import { AgendaListItem } from "./AgendaListItem";
import type { DayItem } from "./MonthGridDay";

export function AgendaList({
  days,
  classColor,
}: {
  days: { date: Date; items: DayItem[] }[];
  classColor: string;
}) {
  const daysWithItems = days.filter((d) => d.items.length > 0);

  if (daysWithItems.length === 0) {
    return <p className="py-8 text-center text-sm text-stone-500">Nothing scheduled this month.</p>;
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-4">
      {daysWithItems.map(({ date, items }) => (
        <AgendaListItem key={date.toISOString()} date={date} items={items} classColor={classColor} />
      ))}
    </div>
  );
}
