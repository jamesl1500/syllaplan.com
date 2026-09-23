import { describe, expect, test } from "vitest";
import { syllabusExtractionSchema, confirmedExtractionSchema } from "./schema";

const validExtraction = {
  course: { name: "Intro to Psychology", code: "PSY 101", term: "Fall 2026" },
  schedule: [
    { dayOfWeek: 1, startTime: "09:00", endTime: "09:50", location: "Hall A" },
  ],
  events: [
    {
      type: "exam",
      title: "Midterm",
      description: "",
      date: "2026-10-15",
      startTime: "09:00",
      endTime: "10:30",
      allDay: false,
    },
  ],
  tasks: [
    { title: "Essay 1", description: "", dueDate: "2026-09-30", dueTime: "" },
  ],
};

describe("syllabusExtractionSchema", () => {
  test("accepts a well-formed extraction", () => {
    const result = syllabusExtractionSchema.safeParse(validExtraction);
    expect(result.success).toBe(true);
  });

  test("rejects a dayOfWeek outside 0-6", () => {
    const result = syllabusExtractionSchema.safeParse({
      ...validExtraction,
      schedule: [{ ...validExtraction.schedule[0], dayOfWeek: 7 }],
    });
    expect(result.success).toBe(false);
  });

  test("rejects an invalid event type", () => {
    const result = syllabusExtractionSchema.safeParse({
      ...validExtraction,
      events: [{ ...validExtraction.events[0], type: "party" }],
    });
    expect(result.success).toBe(false);
  });

  test("rejects a missing required course name", () => {
    const result = syllabusExtractionSchema.safeParse({
      ...validExtraction,
      course: { code: "PSY 101", term: "Fall 2026" },
    });
    expect(result.success).toBe(false);
  });

  test("allows empty schedule/events/tasks arrays", () => {
    const result = syllabusExtractionSchema.safeParse({
      course: { name: "Seminar" },
      schedule: [],
      events: [],
      tasks: [],
    });
    expect(result.success).toBe(true);
  });
});

describe("confirmedExtractionSchema", () => {
  test("requires startsOn/endsOn on each schedule entry", () => {
    const result = confirmedExtractionSchema.safeParse({
      ...validExtraction,
      schedule: [validExtraction.schedule[0]],
    });
    expect(result.success).toBe(false);
  });

  test("accepts a confirmed extraction with a semester date range", () => {
    const result = confirmedExtractionSchema.safeParse({
      ...validExtraction,
      schedule: [
        { ...validExtraction.schedule[0], startsOn: "2026-09-01", endsOn: "2026-12-15" },
      ],
    });
    expect(result.success).toBe(true);
  });

  test("rejects a blank required title", () => {
    const result = confirmedExtractionSchema.safeParse({
      ...validExtraction,
      schedule: [
        { ...validExtraction.schedule[0], startsOn: "2026-09-01", endsOn: "2026-12-15" },
      ],
      tasks: [{ title: "", description: "", dueDate: "2026-09-30", dueTime: "" }],
    });
    expect(result.success).toBe(false);
  });
});
