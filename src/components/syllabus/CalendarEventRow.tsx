import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { ConfirmedExtraction } from "@/lib/anthropic/schema";

type CalendarEvent = ConfirmedExtraction["events"][number];

export function CalendarEventRow({
  value,
  onChange,
  onRemove,
}: {
  value: CalendarEvent;
  onChange: (next: CalendarEvent) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl border border-stone-200 bg-white p-3 sm:grid-cols-6">
      <Select
        value={value.type}
        onChange={(e) => onChange({ ...value, type: e.target.value as CalendarEvent["type"] })}
      >
        <option value="exam">Exam</option>
        <option value="holiday">Holiday</option>
        <option value="no_class">No class</option>
        <option value="other">Other</option>
      </Select>
      <Input
        className="sm:col-span-2"
        placeholder="Title"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
      />
      <Input
        type="date"
        value={value.date}
        onChange={(e) => onChange({ ...value, date: e.target.value })}
      />
      <label className="flex items-center gap-2 text-sm text-stone-600">
        <input
          type="checkbox"
          checked={value.allDay}
          onChange={(e) => onChange({ ...value, allDay: e.target.checked })}
        />
        All day
      </label>
      <button
        type="button"
        onClick={onRemove}
        className="flex items-center justify-center rounded-full text-stone-400 hover:text-red-600"
        aria-label="Remove event"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {!value.allDay && (
        <>
          <Input
            type="time"
            value={value.startTime ?? ""}
            onChange={(e) => onChange({ ...value, startTime: e.target.value })}
          />
          <Input
            type="time"
            value={value.endTime ?? ""}
            onChange={(e) => onChange({ ...value, endTime: e.target.value })}
          />
        </>
      )}
      <Input
        className="col-span-2 sm:col-span-6"
        placeholder="Description (optional)"
        value={value.description ?? ""}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
      />
    </div>
  );
}
