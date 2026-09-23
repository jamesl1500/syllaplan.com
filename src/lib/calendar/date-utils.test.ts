import { describe, expect, test } from "vitest";
import {
  toISODate,
  parseISODate,
  addMonths,
  addDays,
  isSameDay,
  getMonthGrid,
  formatTime,
  addMinutesToTime,
} from "./date-utils";

describe("toISODate", () => {
  test("pads single-digit month and day", () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  test("formats double-digit month and day", () => {
    expect(toISODate(new Date(2026, 10, 23))).toBe("2026-11-23");
  });
});

describe("parseISODate", () => {
  test("round-trips with toISODate", () => {
    const iso = "2026-03-17";
    expect(toISODate(parseISODate(iso))).toBe(iso);
  });

  test("parses using local time, not UTC", () => {
    const date = parseISODate("2026-01-01");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(1);
  });
});

describe("addMonths", () => {
  test("advances the month", () => {
    const result = addMonths(new Date(2026, 0, 15), 2);
    expect(result.getMonth()).toBe(2);
    expect(result.getFullYear()).toBe(2026);
  });

  test("rolls over into the next year", () => {
    const result = addMonths(new Date(2026, 11, 1), 1);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(0);
  });

  test("does not mutate the input date", () => {
    const input = new Date(2026, 0, 15);
    addMonths(input, 3);
    expect(input.getMonth()).toBe(0);
  });
});

describe("addDays", () => {
  test("advances the day", () => {
    const result = addDays(new Date(2026, 0, 30), 3);
    expect(toISODate(result)).toBe("2026-02-02");
  });

  test("does not mutate the input date", () => {
    const input = new Date(2026, 0, 30);
    addDays(input, 3);
    expect(toISODate(input)).toBe("2026-01-30");
  });
});

describe("isSameDay", () => {
  test("true for identical calendar days", () => {
    expect(isSameDay(new Date(2026, 5, 1, 8), new Date(2026, 5, 1, 23))).toBe(true);
  });

  test("false for different days", () => {
    expect(isSameDay(new Date(2026, 5, 1), new Date(2026, 5, 2))).toBe(false);
  });

  test("false for same day/month but different year", () => {
    expect(isSameDay(new Date(2025, 5, 1), new Date(2026, 5, 1))).toBe(false);
  });
});

describe("getMonthGrid", () => {
  test("always returns 42 days", () => {
    expect(getMonthGrid(2026, 1).length).toBe(42);
  });

  test("starts on a Sunday", () => {
    const grid = getMonthGrid(2026, 1);
    expect(grid[0].date.getDay()).toBe(0);
  });

  test("marks days outside the target month as not current", () => {
    const grid = getMonthGrid(2026, 1); // February 2026
    const outside = grid.filter((d) => !d.isCurrentMonth);
    const inside = grid.filter((d) => d.isCurrentMonth);
    expect(inside.length).toBe(28);
    expect(outside.length).toBe(14);
    for (const day of inside) {
      expect(day.date.getMonth()).toBe(1);
    }
  });
});

describe("formatTime", () => {
  test("formats midnight as 12:00 AM", () => {
    expect(formatTime("00:00")).toBe("12:00 AM");
  });

  test("formats noon as 12:00 PM", () => {
    expect(formatTime("12:00")).toBe("12:00 PM");
  });

  test("formats an afternoon time", () => {
    expect(formatTime("14:05")).toBe("2:05 PM");
  });

  test("handles seconds in a Postgres time string", () => {
    expect(formatTime("09:30:00")).toBe("9:30 AM");
  });

  test("returns the input unchanged when unparseable", () => {
    expect(formatTime("not-a-time")).toBe("not-a-time");
  });
});

describe("addMinutesToTime", () => {
  test("adds minutes within the same hour", () => {
    expect(addMinutesToTime("09:00", 30)).toBe("09:30");
  });

  test("rolls over into the next hour", () => {
    expect(addMinutesToTime("09:45", 30)).toBe("10:15");
  });

  test("wraps past midnight", () => {
    expect(addMinutesToTime("23:45", 30)).toBe("00:15");
  });

  test("supports negative offsets, wrapping before midnight", () => {
    expect(addMinutesToTime("00:15", -30)).toBe("23:45");
  });
});
