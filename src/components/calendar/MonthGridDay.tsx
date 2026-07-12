import { EventBadge } from "./EventBadge";

export type DayItem = {
  key: string;
  kind: "session" | "exam" | "holiday" | "no_class" | "other";
  label: string;
};

export function MonthGridDay({
  date,
  isCurrentMonth,
  isToday,
  items,
  classColor,
}: {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  items: DayItem[];
  classColor: string;
}) {
  return (
    <div
      className={`flex min-h-24 flex-col gap-1 border-b border-r border-stone-200 p-1.5 ${
        isCurrentMonth ? "bg-white" : "bg-stone-50"
      }`}
    >
      <span
        className={`text-xs ${
          isToday
            ? "flex h-5 w-5 items-center justify-center rounded-full bg-clay-500 font-semibold text-white"
            : isCurrentMonth
              ? "text-stone-700"
              : "text-stone-400"
        }`}
      >
        {date.getDate()}
      </span>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <EventBadge key={item.key} kind={item.kind} label={item.label} color={item.kind === "session" ? classColor : undefined} />
        ))}
      </div>
    </div>
  );
}
