import { z } from "zod";
import type { Tool } from "@anthropic-ai/sdk/resources/messages/messages";

export const SYLLABUS_EXTRACTION_TOOL: Tool = {
  name: "record_syllabus_extraction",
  description:
    "Record structured data extracted from a course syllabus PDF: course info, " +
    "the recurring weekly class schedule, one-off calendar dates (exams/holidays/no-class days), " +
    "and graded assignments/deliverables with due dates.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      course: {
        type: "object",
        properties: {
          name: { type: "string", description: "Course name, e.g. 'Introduction to Psychology'" },
          code: { type: "string", description: "Course code, e.g. 'PSY 101'" },
          term: { type: "string", description: "Term/semester, e.g. 'Fall 2026'" },
        },
        required: ["name", "code", "term"],
        additionalProperties: false,
      },
      schedule: {
        type: "array",
        description: "Recurring weekly meeting times. One entry per distinct day/time/location combination.",
        items: {
          type: "object",
          properties: {
            dayOfWeek: { type: "integer", enum: [0, 1, 2, 3, 4, 5, 6], description: "0=Sunday, 1=Monday, ... 6=Saturday" },
            startTime: { type: "string", description: "24h HH:MM, e.g. '14:00'" },
            endTime: { type: "string", description: "24h HH:MM, e.g. '15:15'" },
            location: { type: "string", description: "Room/building, empty string if unknown" },
          },
          required: ["dayOfWeek", "startTime", "endTime", "location"],
          additionalProperties: false,
        },
      },
      events: {
        type: "array",
        description: "One-off dated events only: exams, holidays, no-class days. Do NOT include the weekly recurring sessions here.",
        items: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["exam", "holiday", "no_class", "other"] },
            title: { type: "string" },
            description: { type: "string", description: "Empty string if none" },
            date: { type: "string", description: "YYYY-MM-DD" },
            startTime: { type: "string", description: "24h HH:MM, empty string if all-day" },
            endTime: { type: "string", description: "24h HH:MM, empty string if all-day" },
            allDay: { type: "boolean" },
          },
          required: ["type", "title", "description", "date", "startTime", "endTime", "allDay"],
          additionalProperties: false,
        },
      },
      tasks: {
        type: "array",
        description: "Graded assignments, papers, projects, or other deliverables with a due date.",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string", description: "Empty string if none" },
            dueDate: { type: "string", description: "YYYY-MM-DD" },
            dueTime: { type: "string", description: "24h HH:MM, empty string if unspecified" },
          },
          required: ["title", "description", "dueDate", "dueTime"],
          additionalProperties: false,
        },
      },
    },
    required: ["course", "schedule", "events", "tasks"],
    additionalProperties: false,
  },
};

export const syllabusExtractionSchema = z.object({
  course: z.object({
    name: z.string(),
    code: z.string().optional(),
    term: z.string().optional(),
  }),
  schedule: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string(),
      endTime: z.string(),
      location: z.string().optional(),
    }),
  ),
  events: z.array(
    z.object({
      type: z.enum(["exam", "holiday", "no_class", "other"]),
      title: z.string(),
      description: z.string().optional(),
      date: z.string(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      allDay: z.boolean(),
    }),
  ),
  tasks: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      dueDate: z.string(),
      dueTime: z.string().optional(),
    }),
  ),
});
export type SyllabusExtraction = z.infer<typeof syllabusExtractionSchema>;

// What the review UI sends back to confirmSyllabus() — adds the editable
// semester date range that Claude usually can't infer precisely.
export const confirmedExtractionSchema = z.object({
  course: z.object({
    name: z.string().min(1),
    code: z.string().optional(),
    term: z.string().optional(),
  }),
  schedule: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().min(1),
      endTime: z.string().min(1),
      location: z.string().optional(),
      startsOn: z.string().min(1),
      endsOn: z.string().min(1),
    }),
  ),
  events: z.array(
    z.object({
      type: z.enum(["exam", "holiday", "no_class", "other"]),
      title: z.string().min(1),
      description: z.string().optional(),
      date: z.string().min(1),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      allDay: z.boolean(),
    }),
  ),
  tasks: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      dueDate: z.string().min(1),
      dueTime: z.string().optional(),
    }),
  ),
});
export type ConfirmedExtraction = z.infer<typeof confirmedExtractionSchema>;
