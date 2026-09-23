import { toISODate, parseISODate, addDays, addMinutesToTime } from "./date-utils";
import type { ClassSchedule } from "./recurrence";

const WEEKDAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export type FeedClass = {
  id: string;
  name: string;
  course_code: string | null;
};

export type FeedSchedule = ClassSchedule & { class_id: string };

export type FeedEvent = {
  id: string;
  class_id: string;
  event_type: "exam" | "holiday" | "no_class" | "other";
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  all_day: boolean;
};

export type FeedTask = {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  due_date: string;
  due_time: string | null;
};

/** Escapes TEXT values per RFC 5545 §3.3.11. */
export function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/** Folds a content line to 75 octets per RFC 5545 §3.1, continuation lines prefixed with a space. */
export function foldLine(line: string): string {
  const bytes = Buffer.from(line, "utf-8");
  if (bytes.length <= 75) return line;

  const chunks: string[] = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Don't split a multi-byte UTF-8 sequence: back off while `end` lands on a continuation byte.
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    chunks.push(bytes.subarray(start, end).toString("utf-8"));
    start = end;
    limit = 74; // continuation lines: 1 octet for the leading space + 74 of content = 75 total
  }
  return chunks.join("\r\n ");
}

function icsDate(iso: string): string {
  return iso.replaceAll("-", "");
}

function icsDateTime(iso: string, time: string): string {
  const [h = "00", m = "00", s = "00"] = time.split(":");
  return `${icsDate(iso)}T${h.padStart(2, "0")}${m.padStart(2, "0")}${s.padStart(2, "0")}`;
}

function icsUTCDateTime(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function firstOccurrenceOnOrAfter(startsOn: Date, dayOfWeek: number): Date {
  const diff = (dayOfWeek - startsOn.getDay() + 7) % 7;
  return addDays(startsOn, diff);
}

function classLabel(klass: FeedClass): string {
  return klass.course_code || klass.name;
}

function buildEvent(lines: (string | null | false)[]): string {
  return ["BEGIN:VEVENT", ...lines.filter((l): l is string => Boolean(l)), "END:VEVENT"].join(
    "\r\n",
  );
}

export function buildScheduleEvent(schedule: FeedSchedule, klass: FeedClass, now: Date): string {
  const startsOn = parseISODate(schedule.starts_on);
  const firstDateISO = toISODate(firstOccurrenceOnOrAfter(startsOn, schedule.day_of_week));

  return buildEvent([
    `UID:schedule-${schedule.id}@syllaplan.com`,
    `DTSTAMP:${icsUTCDateTime(now)}`,
    `DTSTART:${icsDateTime(firstDateISO, schedule.start_time)}`,
    `DTEND:${icsDateTime(firstDateISO, schedule.end_time)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${WEEKDAY_CODES[schedule.day_of_week]};UNTIL=${icsDateTime(schedule.ends_on, "23:59:59")}`,
    `SUMMARY:${escapeICSText(classLabel(klass))}`,
    schedule.location && `LOCATION:${escapeICSText(schedule.location)}`,
    "CATEGORIES:CLASS",
  ]);
}

export function buildDatedEvent(event: FeedEvent, klass: FeedClass, now: Date): string {
  const summary = `${classLabel(klass)}: ${event.title}`;
  const timed = !event.all_day && event.start_time;

  return buildEvent([
    `UID:event-${event.id}@syllaplan.com`,
    `DTSTAMP:${icsUTCDateTime(now)}`,
    timed
      ? `DTSTART:${icsDateTime(event.event_date, event.start_time!)}`
      : `DTSTART;VALUE=DATE:${icsDate(event.event_date)}`,
    timed
      ? `DTEND:${icsDateTime(event.event_date, event.end_time ?? addMinutesToTime(event.start_time!, 60))}`
      : `DTEND;VALUE=DATE:${icsDate(toISODate(addDays(parseISODate(event.event_date), 1)))}`,
    `SUMMARY:${escapeICSText(summary)}`,
    event.description && `DESCRIPTION:${escapeICSText(event.description)}`,
    `CATEGORIES:${event.event_type.toUpperCase()}`,
  ]);
}

export function buildTaskEvent(task: FeedTask, klass: FeedClass, now: Date): string {
  const summary = `Due: ${classLabel(klass)} — ${task.title}`;

  return buildEvent([
    `UID:task-${task.id}@syllaplan.com`,
    `DTSTAMP:${icsUTCDateTime(now)}`,
    task.due_time
      ? `DTSTART:${icsDateTime(task.due_date, task.due_time)}`
      : `DTSTART;VALUE=DATE:${icsDate(task.due_date)}`,
    task.due_time
      ? `DTEND:${icsDateTime(task.due_date, addMinutesToTime(task.due_time, 30))}`
      : `DTEND;VALUE=DATE:${icsDate(toISODate(addDays(parseISODate(task.due_date), 1)))}`,
    `SUMMARY:${escapeICSText(summary)}`,
    task.description && `DESCRIPTION:${escapeICSText(task.description)}`,
    "CATEGORIES:TASK",
  ]);
}

export function buildICSFeed(
  data: {
    classes: FeedClass[];
    schedules: FeedSchedule[];
    events: FeedEvent[];
    tasks: FeedTask[];
  },
  now: Date = new Date(),
): string {
  const classById = new Map(data.classes.map((c) => [c.id, c]));

  const vevents: string[] = [];
  for (const schedule of data.schedules) {
    const klass = classById.get(schedule.class_id);
    if (klass) vevents.push(buildScheduleEvent(schedule, klass, now));
  }
  for (const event of data.events) {
    const klass = classById.get(event.class_id);
    if (klass) vevents.push(buildDatedEvent(event, klass, now));
  }
  for (const task of data.tasks) {
    const klass = classById.get(task.class_id);
    if (klass) vevents.push(buildTaskEvent(task, klass, now));
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Syllaplan//Calendar Feed//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Syllaplan",
    ...vevents,
    "END:VCALENDAR",
  ];

  return lines.flatMap((line) => line.split("\r\n")).map(foldLine).join("\r\n") + "\r\n";
}
