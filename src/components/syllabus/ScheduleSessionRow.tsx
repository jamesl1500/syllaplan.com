import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { ConfirmedExtraction } from "@/lib/anthropic/schema";

type ScheduleSession = ConfirmedExtraction["schedule"][number];

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function ScheduleSessionRow({
  value,
  onChange,
  onRemove,
}: {
  value: ScheduleSession;
  onChange: (next: ScheduleSession) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl border border-stone-200 bg-white p-3 sm:grid-cols-6">
      <Select
        className="sm:col-span-2"
        value={value.dayOfWeek}
        onChange={(e) => onChange({ ...value, dayOfWeek: Number(e.target.value) })}
      >
        {DAY_LABELS.map((label, i) => (
          <option key={label} value={i}>
            {label}
          </option>
        ))}
      </Select>
      <Input
        type="time"
        value={value.startTime}
        onChange={(e) => onChange({ ...value, startTime: e.target.value })}
      />
      <Input
        type="time"
        value={value.endTime}
        onChange={(e) => onChange({ ...value, endTime: e.target.value })}
      />
      <Input
        placeholder="Location"
        value={value.location ?? ""}
        onChange={(e) => onChange({ ...value, location: e.target.value })}
      />
      <button
        type="button"
        onClick={onRemove}
        className="flex items-center justify-center rounded-full text-stone-400 hover:text-red-600"
        aria-label="Remove session"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <div className="sm:col-span-3">
        <label className="mb-1 block text-xs text-stone-500">From</label>
        <Input
          type="date"
          value={value.startsOn}
          onChange={(e) => onChange({ ...value, startsOn: e.target.value })}
        />
      </div>
      <div className="sm:col-span-3">
        <label className="mb-1 block text-xs text-stone-500">Until</label>
        <Input
          type="date"
          value={value.endsOn}
          onChange={(e) => onChange({ ...value, endsOn: e.target.value })}
        />
      </div>
    </div>
  );
}
