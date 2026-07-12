"use client";

import { useMemo, useState } from "react";
import { getMonthGrid, toISODate, formatTime, isSameDay } from "@/lib/calendar/date-utils";
import { expandClassSchedules, type ClassSchedule } from "@/lib/calendar/recurrence";
import { MonthNav } from "./MonthNav";
import { MonthGrid } from "./MonthGrid";
import { AgendaList } from "./AgendaList";
import type { DayItem } from "./MonthGridDay";

export type CalendarEventRecord = {
  id: string;
  event_type: "exam" | "holiday" | "no_class" | "other";
  title: string;
  event_date: string;
};

export function CalendarView({
  schedules,
  events,
  classColor,
}: {
  schedules: ClassSchedule[];
  events: CalendarEventRecord[];
  classColor: string;
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [viewMode, setViewMode] = useState<"month" | "agenda">("month");

  const gridDays = useMemo(
    () => getMonthGrid(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth],
  );

  const occurrences = useMemo(() => {
    const rangeStart = gridDays[0].date;
    const rangeEnd = gridDays[gridDays.length - 1].date;
    return expandClassSchedules(schedules, rangeStart, rangeEnd);
  }, [schedules, gridDays]);

  function itemsForDate(date: Date): DayItem[] {
    const dateISO = toISODate(date);
    const dayEvents = events.filter((e) => e.event_date === dateISO);
    const suppressesSessions = dayEvents.some(
      (e) => e.event_type === "holiday" || e.event_type === "no_class",
    );

    const sessionItems: DayItem[] = suppressesSessions
      ? []
      : occurrences
          .filter((o) => isSameDay(o.date, date))
          .map((o) => ({
            key: `session-${o.scheduleId}-${dateISO}`,
            kind: "session" as const,
            label: `${formatTime(o.startTime)}${o.location ? ` · ${o.location}` : ""}`,
          }));

    const eventItems: DayItem[] = dayEvents.map((e) => ({
      key: e.id,
      kind: e.event_type,
      label: e.title,
    }));

    return [...sessionItems, ...eventItems];
  }

  const agendaDays = useMemo(
    () => gridDays.filter((d) => d.isCurrentMonth).map((d) => ({ date: d.date, items: itemsForDate(d.date) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gridDays, occurrences, events],
  );

  return (
    <div className="flex flex-col gap-4">
      <MonthNav
        currentMonth={currentMonth}
        onPrev={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
        onNext={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
        onToday={() => {
          const now = new Date();
          setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {viewMode === "month" ? (
        <MonthGrid currentMonth={currentMonth} itemsForDate={itemsForDate} classColor={classColor} />
      ) : (
        <AgendaList days={agendaDays} classColor={classColor} />
      )}
    </div>
  );
}
