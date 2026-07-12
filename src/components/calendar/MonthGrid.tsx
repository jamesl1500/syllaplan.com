import { getMonthGrid, WEEKDAY_LABELS } from "@/lib/calendar/date-utils";
import { MonthGridDay, type DayItem } from "./MonthGridDay";

export function MonthGrid({
  currentMonth,
  itemsForDate,
  classColor,
}: {
  currentMonth: Date;
  itemsForDate: (date: Date) => DayItem[];
  classColor: string;
}) {
  const days = getMonthGrid(currentMonth.getFullYear(), currentMonth.getMonth());

  return (
    <div className="overflow-hidden rounded-2xl border-l border-t border-stone-200">
      <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="border-r border-stone-200 px-2 py-1.5 text-center text-xs font-medium text-stone-500">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => (
          <MonthGridDay
            key={day.date.toISOString()}
            date={day.date}
            isCurrentMonth={day.isCurrentMonth}
            isToday={day.isToday}
            items={itemsForDate(day.date)}
            classColor={classColor}
          />
        ))}
      </div>
    </div>
  );
}
