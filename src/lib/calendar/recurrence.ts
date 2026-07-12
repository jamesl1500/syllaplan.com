import { parseISODate, isSameDay } from "./date-utils";

export type ClassSchedule = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string | null;
  starts_on: string;
  ends_on: string;
};

export type ScheduleOccurrence = {
  scheduleId: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string | null;
};

/** Expands recurring weekly class_schedules rows into individual dated occurrences within [rangeStart, rangeEnd]. */
export function expandClassSchedules(
  schedules: ClassSchedule[],
  rangeStart: Date,
  rangeEnd: Date,
): ScheduleOccurrence[] {
  const occurrences: ScheduleOccurrence[] = [];

  for (const schedule of schedules) {
    const startsOn = parseISODate(schedule.starts_on);
    const endsOn = parseISODate(schedule.ends_on);
    const windowStart = startsOn > rangeStart ? startsOn : rangeStart;
    const windowEnd = endsOn < rangeEnd ? endsOn : rangeEnd;

    for (
      let date = new Date(windowStart);
      date <= windowEnd;
      date.setDate(date.getDate() + 1)
    ) {
      if (date.getDay() === schedule.day_of_week) {
        occurrences.push({
          scheduleId: schedule.id,
          date: new Date(date),
          startTime: schedule.start_time,
          endTime: schedule.end_time,
          location: schedule.location,
        });
      }
    }
  }

  return occurrences;
}

export function occurrencesOnDate(occurrences: ScheduleOccurrence[], date: Date): ScheduleOccurrence[] {
  return occurrences.filter((o) => isSameDay(o.date, date));
}
