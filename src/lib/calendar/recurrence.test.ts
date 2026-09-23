import { describe, expect, test } from "vitest";
import { expandClassSchedules, occurrencesOnDate, type ClassSchedule } from "./recurrence";

function schedule(overrides: Partial<ClassSchedule> = {}): ClassSchedule {
  return {
    id: "sched-1",
    day_of_week: 1, // Monday
    start_time: "09:00",
    end_time: "09:50",
    location: "Room 101",
    starts_on: "2026-01-01",
    ends_on: "2026-12-31",
    ...overrides,
  };
}

describe("expandClassSchedules", () => {
  test("generates one occurrence per matching weekday in range", () => {
    // Jan 2026: Mondays fall on 5, 12, 19, 26
    const occurrences = expandClassSchedules(
      [schedule()],
      new Date(2026, 0, 1),
      new Date(2026, 0, 31),
    );
    expect(occurrences).toHaveLength(4);
    expect(occurrences.every((o) => o.date.getDay() === 1)).toBe(true);
  });

  test("clamps to the schedule's starts_on/ends_on window", () => {
    const occurrences = expandClassSchedules(
      [schedule({ starts_on: "2026-01-10", ends_on: "2026-01-20" })],
      new Date(2026, 0, 1),
      new Date(2026, 0, 31),
    );
    // Only the Mondays inside [Jan 10, Jan 20] should appear: Jan 12 and Jan 19
    expect(occurrences.map((o) => o.date.getDate())).toEqual([12, 19]);
  });

  test("returns nothing when the schedule window is outside the query range", () => {
    const occurrences = expandClassSchedules(
      [schedule({ starts_on: "2025-01-01", ends_on: "2025-12-31" })],
      new Date(2026, 0, 1),
      new Date(2026, 0, 31),
    );
    expect(occurrences).toHaveLength(0);
  });

  test("carries through each occurrence's schedule details", () => {
    const occurrences = expandClassSchedules(
      [schedule({ id: "abc", start_time: "10:00", end_time: "10:50", location: "Hall B" })],
      new Date(2026, 0, 5),
      new Date(2026, 0, 5),
    );
    expect(occurrences).toEqual([
      {
        scheduleId: "abc",
        date: new Date(2026, 0, 5),
        startTime: "10:00",
        endTime: "10:50",
        location: "Hall B",
      },
    ]);
  });

  test("combines occurrences across multiple schedules", () => {
    const occurrences = expandClassSchedules(
      [schedule({ id: "mon", day_of_week: 1 }), schedule({ id: "wed", day_of_week: 3 })],
      new Date(2026, 0, 1),
      new Date(2026, 0, 7),
    );
    expect(occurrences.map((o) => o.scheduleId).sort()).toEqual(["mon", "wed"]);
  });
});

describe("occurrencesOnDate", () => {
  test("filters occurrences to the given calendar day", () => {
    const occurrences = expandClassSchedules(
      [schedule()],
      new Date(2026, 0, 1),
      new Date(2026, 0, 31),
    );
    const onJan12 = occurrencesOnDate(occurrences, new Date(2026, 0, 12));
    expect(onJan12).toHaveLength(1);
    expect(onJan12[0].date.getDate()).toBe(12);
  });

  test("returns an empty array when nothing matches", () => {
    const occurrences = expandClassSchedules(
      [schedule()],
      new Date(2026, 0, 1),
      new Date(2026, 0, 31),
    );
    expect(occurrencesOnDate(occurrences, new Date(2026, 0, 6))).toEqual([]);
  });
});
