import "server-only";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";
import { toISODate, addDays, formatTime } from "@/lib/calendar/date-utils";
import { expandClassSchedules, type ClassSchedule } from "@/lib/calendar/recurrence";

const WINDOW_DAYS = 14;

type ClassRef = { name: string; course_code: string | null; color: string } | null;

export type OverviewItem = {
  key: string;
  kind: "session" | "exam" | "holiday" | "no_class" | "other" | "task";
  title: string;
  meta?: string;
  classId: string;
  classLabel: string;
  classColor: string;
  href: string;
};

export type OverdueTask = {
  id: string;
  title: string;
  classId: string;
  classLabel: string;
  classColor: string;
};

export type UpcomingAgenda = {
  overdueTasks: OverdueTask[];
  days: { date: Date; items: OverviewItem[] }[];
};

function classLabelOf(classes: ClassRef): string {
  return classes?.course_code || classes?.name || "Class";
}

export async function getUpcomingAgenda(): Promise<UpcomingAgenda> {
  await verifySession();
  const supabase = await createClient();

  const today = new Date();
  const todayISO = toISODate(today);
  const rangeEnd = addDays(today, WINDOW_DAYS - 1);
  const rangeEndISO = toISODate(rangeEnd);

  const [{ data: schedules }, { data: events }, { data: tasks }] = await Promise.all([
    supabase
      .from("class_schedules")
      .select(
        "id, class_id, day_of_week, start_time, end_time, location, starts_on, ends_on, classes(name, course_code, color)",
      )
      .lte("starts_on", rangeEndISO)
      .gte("ends_on", todayISO),
    supabase
      .from("calendar_events")
      .select("id, class_id, event_type, title, event_date, start_time, all_day, classes(name, course_code, color)")
      .gte("event_date", todayISO)
      .lte("event_date", rangeEndISO),
    supabase
      .from("tasks")
      .select("id, class_id, title, due_date, due_time, classes(name, course_code, color)")
      .eq("completed", false)
      .not("due_date", "is", null)
      .lte("due_date", rangeEndISO)
      .order("due_date", { ascending: true }),
  ]);

  // The untyped client (no generated Database types) infers embedded
  // relations as arrays by default; PostgREST actually returns a single
  // object here since each row is on the "many" side of a FK to classes.
  const scheduleRows = (schedules ?? []) as unknown as (ClassSchedule & {
    class_id: string;
    classes: ClassRef;
  })[];
  const scheduleById = new Map(scheduleRows.map((s) => [s.id, s]));
  const occurrences = expandClassSchedules(scheduleRows, today, rangeEnd);

  const dayMap = new Map<string, OverviewItem[]>();
  function addItem(dateISO: string, item: OverviewItem) {
    const existing = dayMap.get(dateISO);
    if (existing) existing.push(item);
    else dayMap.set(dateISO, [item]);
  }

  for (const occ of occurrences) {
    const schedule = scheduleById.get(occ.scheduleId);
    if (!schedule?.classes) continue;
    const dateISO = toISODate(occ.date);
    addItem(dateISO, {
      key: `session-${occ.scheduleId}-${dateISO}`,
      kind: "session",
      title: "Class session",
      meta: occ.location ? `${formatTime(occ.startTime)} · ${occ.location}` : formatTime(occ.startTime),
      classId: schedule.class_id,
      classLabel: classLabelOf(schedule.classes),
      classColor: schedule.classes.color,
      href: `/classes/${schedule.class_id}/calendar`,
    });
  }

  for (const event of (events ?? []) as unknown as {
    id: string;
    class_id: string;
    event_type: OverviewItem["kind"];
    title: string;
    event_date: string;
    start_time: string | null;
    all_day: boolean;
    classes: ClassRef;
  }[]) {
    if (!event.classes) continue;
    addItem(event.event_date, {
      key: event.id,
      kind: event.event_type,
      title: event.title,
      meta: !event.all_day && event.start_time ? formatTime(event.start_time) : undefined,
      classId: event.class_id,
      classLabel: classLabelOf(event.classes),
      classColor: event.classes.color,
      href: `/classes/${event.class_id}/calendar`,
    });
  }

  const overdueTasks: OverdueTask[] = [];
  for (const task of (tasks ?? []) as unknown as {
    id: string;
    class_id: string;
    title: string;
    due_date: string;
    due_time: string | null;
    classes: ClassRef;
  }[]) {
    if (!task.classes) continue;
    const classLabel = classLabelOf(task.classes);

    if (task.due_date < todayISO) {
      overdueTasks.push({
        id: task.id,
        title: task.title,
        classId: task.class_id,
        classLabel,
        classColor: task.classes.color,
      });
    } else {
      addItem(task.due_date, {
        key: `task-${task.id}`,
        kind: "task",
        title: task.title,
        meta: task.due_time ? formatTime(task.due_time) : undefined,
        classId: task.class_id,
        classLabel,
        classColor: task.classes.color,
        href: `/classes/${task.class_id}/tasks`,
      });
    }
  }

  const days: UpcomingAgenda["days"] = [];
  for (let i = 0; i < WINDOW_DAYS; i++) {
    const date = addDays(today, i);
    const items = dayMap.get(toISODate(date));
    if (items && items.length > 0) {
      days.push({ date, items });
    }
  }

  return { overdueTasks, days };
}
