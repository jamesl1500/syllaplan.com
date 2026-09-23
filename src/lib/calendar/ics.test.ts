import { describe, expect, test } from "vitest";
import {
  escapeICSText,
  foldLine,
  buildScheduleEvent,
  buildDatedEvent,
  buildTaskEvent,
  buildICSFeed,
  type FeedClass,
  type FeedSchedule,
  type FeedEvent,
  type FeedTask,
} from "./ics";

const NOW = new Date(2026, 0, 1, 12, 0, 0);
const CLASS: FeedClass = { id: "class-1", name: "Introduction to Psychology", course_code: "PSY 101" };

describe("escapeICSText", () => {
  test("escapes backslashes, semicolons, and commas", () => {
    expect(escapeICSText("a\\b;c,d")).toBe("a\\\\b\\;c\\,d");
  });

  test("escapes newlines as literal \\n", () => {
    expect(escapeICSText("line one\nline two")).toBe("line one\\nline two");
  });

  test("leaves plain text untouched", () => {
    expect(escapeICSText("Midterm exam")).toBe("Midterm exam");
  });
});

describe("foldLine", () => {
  test("leaves short lines unchanged", () => {
    expect(foldLine("SUMMARY:Short")).toBe("SUMMARY:Short");
  });

  test("folds lines over 75 octets with a leading-space continuation", () => {
    const longValue = "x".repeat(100);
    const folded = foldLine(`SUMMARY:${longValue}`);
    const parts = folded.split("\r\n");
    expect(parts.length).toBeGreaterThan(1);
    expect(parts[1].startsWith(" ")).toBe(true);
    // Reassembling (stripping each continuation's leading space) reconstructs the original content.
    const unfolded = parts.map((part, i) => (i === 0 ? part : part.slice(1))).join("");
    expect(unfolded).toBe(`SUMMARY:${longValue}`);
  });

  test("each folded chunk is at most 75 octets", () => {
    const folded = foldLine(`DESCRIPTION:${"y".repeat(200)}`);
    for (const part of folded.split("\r\n")) {
      expect(Buffer.byteLength(part, "utf-8")).toBeLessThanOrEqual(75);
    }
  });
});

describe("buildScheduleEvent", () => {
  const schedule: FeedSchedule = {
    id: "sched-1",
    class_id: "class-1",
    day_of_week: 1, // Monday
    start_time: "09:00",
    end_time: "09:50",
    location: "Hall A",
    starts_on: "2026-01-05", // a Monday
    ends_on: "2026-05-01",
  };

  test("starts on the first matching weekday on or after starts_on", () => {
    const vevent = buildScheduleEvent(schedule, CLASS, NOW);
    expect(vevent).toContain("DTSTART:20260105T090000");
    expect(vevent).toContain("DTEND:20260105T095000");
  });

  test("rolls DTSTART forward when starts_on isn't the target weekday", () => {
    const vevent = buildScheduleEvent({ ...schedule, starts_on: "2026-01-01" }, CLASS, NOW); // a Thursday
    expect(vevent).toContain("DTSTART:20260105T090000"); // next Monday
  });

  test("includes a weekly RRULE with the right BYDAY and UNTIL", () => {
    const vevent = buildScheduleEvent(schedule, CLASS, NOW);
    expect(vevent).toContain("RRULE:FREQ=WEEKLY;BYDAY=MO;UNTIL=20260501T235959");
  });

  test("prefers the course code as the summary", () => {
    const vevent = buildScheduleEvent(schedule, CLASS, NOW);
    expect(vevent).toContain("SUMMARY:PSY 101");
  });

  test("falls back to the class name when there's no course code", () => {
    const vevent = buildScheduleEvent(schedule, { ...CLASS, course_code: null }, NOW);
    expect(vevent).toContain("SUMMARY:Introduction to Psychology");
  });

  test("includes location when present, omits it otherwise", () => {
    expect(buildScheduleEvent(schedule, CLASS, NOW)).toContain("LOCATION:Hall A");
    expect(buildScheduleEvent({ ...schedule, location: null }, CLASS, NOW)).not.toContain("LOCATION:");
  });

  test("gives each schedule a stable, unique UID", () => {
    const vevent = buildScheduleEvent(schedule, CLASS, NOW);
    expect(vevent).toContain("UID:schedule-sched-1@syllaplan.com");
  });
});

describe("buildDatedEvent", () => {
  const baseEvent: FeedEvent = {
    id: "evt-1",
    class_id: "class-1",
    event_type: "exam",
    title: "Midterm",
    description: null,
    event_date: "2026-03-10",
    start_time: null,
    end_time: null,
    all_day: true,
  };

  test("renders an all-day event with an exclusive end date", () => {
    const vevent = buildDatedEvent(baseEvent, CLASS, NOW);
    expect(vevent).toContain("DTSTART;VALUE=DATE:20260310");
    expect(vevent).toContain("DTEND;VALUE=DATE:20260311");
  });

  test("renders a timed event using its start/end times", () => {
    const vevent = buildDatedEvent(
      { ...baseEvent, all_day: false, start_time: "09:00", end_time: "10:30" },
      CLASS,
      NOW,
    );
    expect(vevent).toContain("DTSTART:20260310T090000");
    expect(vevent).toContain("DTEND:20260310T103000");
  });

  test("defaults a timed event's end to one hour after start when missing", () => {
    const vevent = buildDatedEvent(
      { ...baseEvent, all_day: false, start_time: "09:00", end_time: null },
      CLASS,
      NOW,
    );
    expect(vevent).toContain("DTEND:20260310T100000");
  });

  test("prefixes the summary with the class label and uppercases the category", () => {
    const vevent = buildDatedEvent(baseEvent, CLASS, NOW);
    expect(vevent).toContain("SUMMARY:PSY 101: Midterm");
    expect(vevent).toContain("CATEGORIES:EXAM");
  });

  test("escapes a description containing special characters", () => {
    const vevent = buildDatedEvent({ ...baseEvent, description: "Bring a #2 pencil, and ID." }, CLASS, NOW);
    expect(vevent).toContain("DESCRIPTION:Bring a #2 pencil\\, and ID.");
  });
});

describe("buildTaskEvent", () => {
  const baseTask: FeedTask = {
    id: "task-1",
    class_id: "class-1",
    title: "Essay 1",
    description: null,
    due_date: "2026-02-20",
    due_time: null,
  };

  test("renders an all-day block when there's no due time", () => {
    const vevent = buildTaskEvent(baseTask, CLASS, NOW);
    expect(vevent).toContain("DTSTART;VALUE=DATE:20260220");
    expect(vevent).toContain("DTEND;VALUE=DATE:20260221");
  });

  test("renders a 30-minute block at the due time when given", () => {
    const vevent = buildTaskEvent({ ...baseTask, due_time: "23:00" }, CLASS, NOW);
    expect(vevent).toContain("DTSTART:20260220T230000");
    expect(vevent).toContain("DTEND:20260220T233000");
  });

  test("labels the summary as a due-date reminder", () => {
    const vevent = buildTaskEvent(baseTask, CLASS, NOW);
    expect(vevent).toContain("SUMMARY:Due: PSY 101 — Essay 1");
    expect(vevent).toContain("CATEGORIES:TASK");
  });
});

describe("buildICSFeed", () => {
  test("wraps events in a valid VCALENDAR envelope", () => {
    const ics = buildICSFeed({ classes: [CLASS], schedules: [], events: [], tasks: [] }, NOW);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("VERSION:2.0");
  });

  test("includes one VEVENT per schedule, event, and task", () => {
    const ics = buildICSFeed(
      {
        classes: [CLASS],
        schedules: [
          {
            id: "s1",
            class_id: "class-1",
            day_of_week: 1,
            start_time: "09:00",
            end_time: "09:50",
            location: null,
            starts_on: "2026-01-05",
            ends_on: "2026-05-01",
          },
        ],
        events: [
          {
            id: "e1",
            class_id: "class-1",
            event_type: "holiday",
            title: "Spring Break",
            description: null,
            event_date: "2026-03-16",
            start_time: null,
            end_time: null,
            all_day: true,
          },
        ],
        tasks: [
          { id: "t1", class_id: "class-1", title: "Essay 1", description: null, due_date: "2026-02-20", due_time: null },
        ],
      },
      NOW,
    );
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(3);
    expect(ics.match(/END:VEVENT/g)).toHaveLength(3);
  });

  test("silently skips rows whose class is missing (e.g. an orphaned/draft row)", () => {
    const ics = buildICSFeed(
      {
        classes: [],
        schedules: [
          {
            id: "s1",
            class_id: "missing-class",
            day_of_week: 1,
            start_time: "09:00",
            end_time: "09:50",
            location: null,
            starts_on: "2026-01-05",
            ends_on: "2026-05-01",
          },
        ],
        events: [],
        tasks: [],
      },
      NOW,
    );
    expect(ics).not.toContain("BEGIN:VEVENT");
  });

  test("every line in the output is CRLF-terminated and folded to 75 octets", () => {
    const ics = buildICSFeed(
      {
        classes: [CLASS],
        schedules: [],
        events: [
          {
            id: "e1",
            class_id: "class-1",
            event_type: "other",
            title: "A very long event title that will definitely need to be folded across multiple lines to stay valid",
            description: null,
            event_date: "2026-03-16",
            start_time: null,
            end_time: null,
            all_day: true,
          },
        ],
        tasks: [],
      },
      NOW,
    );
    for (const line of ics.split("\r\n").slice(0, -1)) {
      // Continuation lines (leading space) are part of a folded logical line already checked as a whole.
      expect(Buffer.byteLength(line, "utf-8")).toBeLessThanOrEqual(75);
    }
  });
});
