"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScheduleSessionRow } from "./ScheduleSessionRow";
import { CalendarEventRow } from "./CalendarEventRow";
import { TaskRow } from "./TaskRow";
import { toISODate, addMonths } from "@/lib/calendar/date-utils";
import type { SyllabusExtraction, ConfirmedExtraction } from "@/lib/anthropic/schema";
import { confirmSyllabus } from "@/app/(dashboard)/classes/[classId]/review/[syllabusId]/actions";

function withDefaultRange(schedule: SyllabusExtraction["schedule"]): ConfirmedExtraction["schedule"] {
  const startsOn = toISODate(new Date());
  const endsOn = toISODate(addMonths(new Date(), 4));
  return schedule.map((s) => ({ ...s, startsOn, endsOn }));
}

export function ReviewEditor({
  classId,
  syllabusId,
  extraction,
}: {
  classId: string;
  syllabusId: string;
  extraction: SyllabusExtraction;
}) {
  const [course, setCourse] = useState(extraction.course);
  const [schedule, setSchedule] = useState<ConfirmedExtraction["schedule"]>(
    withDefaultRange(extraction.schedule),
  );
  const [events, setEvents] = useState<ConfirmedExtraction["events"]>(extraction.events);
  const [tasks, setTasks] = useState<ConfirmedExtraction["tasks"]>(extraction.tasks);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await confirmSyllabus(classId, syllabusId, { course, schedule, events, tasks });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Course</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            placeholder="Course name"
            value={course.name}
            onChange={(e) => setCourse({ ...course, name: e.target.value })}
          />
          <Input
            placeholder="Course code"
            value={course.code ?? ""}
            onChange={(e) => setCourse({ ...course, code: e.target.value })}
          />
          <Input
            placeholder="Term"
            value={course.term ?? ""}
            onChange={(e) => setCourse({ ...course, term: e.target.value })}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Weekly schedule</h2>
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-clay-600 hover:text-clay-700"
            onClick={() =>
              setSchedule([
                ...schedule,
                {
                  dayOfWeek: 1,
                  startTime: "09:00",
                  endTime: "10:00",
                  location: "",
                  startsOn: toISODate(new Date()),
                  endsOn: toISODate(addMonths(new Date(), 4)),
                },
              ])
            }
          >
            <Plus className="h-4 w-4" /> Add session
          </button>
        </div>
        {schedule.length === 0 && <p className="text-sm text-stone-500">No recurring sessions.</p>}
        {schedule.map((session, i) => (
          <ScheduleSessionRow
            key={i}
            value={session}
            onChange={(next) => setSchedule(schedule.map((s, j) => (j === i ? next : s)))}
            onRemove={() => setSchedule(schedule.filter((_, j) => j !== i))}
          />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Exams, holidays &amp; dates</h2>
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-clay-600 hover:text-clay-700"
            onClick={() =>
              setEvents([
                ...events,
                { type: "other", title: "", description: "", date: toISODate(new Date()), allDay: true },
              ])
            }
          >
            <Plus className="h-4 w-4" /> Add date
          </button>
        </div>
        {events.length === 0 && <p className="text-sm text-stone-500">No calendar dates.</p>}
        {events.map((event, i) => (
          <CalendarEventRow
            key={i}
            value={event}
            onChange={(next) => setEvents(events.map((e, j) => (j === i ? next : e)))}
            onRemove={() => setEvents(events.filter((_, j) => j !== i))}
          />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Assignments</h2>
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-clay-600 hover:text-clay-700"
            onClick={() =>
              setTasks([...tasks, { title: "", description: "", dueDate: toISODate(new Date()) }])
            }
          >
            <Plus className="h-4 w-4" /> Add assignment
          </button>
        </div>
        {tasks.length === 0 && <p className="text-sm text-stone-500">No assignments.</p>}
        {tasks.map((task, i) => (
          <TaskRow
            key={i}
            value={task}
            onChange={(next) => setTasks(tasks.map((t, j) => (j === i ? next : t)))}
            onRemove={() => setTasks(tasks.filter((_, j) => j !== i))}
          />
        ))}
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3 border-t border-stone-200 pt-6 ">
        <Button variant="secondary" type="button" disabled={pending} onClick={() => history.back()}>
          Cancel
        </Button>
        <Button type="button" disabled={pending || !course.name} onClick={handleConfirm}>
          {pending ? "Saving..." : "Confirm and create class"}
        </Button>
      </div>
    </div>
  );
}
