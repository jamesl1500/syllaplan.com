import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type { ConfirmedExtraction } from "@/lib/anthropic/schema";

type Task = ConfirmedExtraction["tasks"][number];

export function TaskRow({
  value,
  onChange,
  onRemove,
}: {
  value: Task;
  onChange: (next: Task) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl border border-stone-200 bg-white p-3 sm:grid-cols-6">
      <Input
        className="sm:col-span-3"
        placeholder="Title"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
      />
      <Input
        type="date"
        value={value.dueDate}
        onChange={(e) => onChange({ ...value, dueDate: e.target.value })}
      />
      <Input
        type="time"
        value={value.dueTime ?? ""}
        onChange={(e) => onChange({ ...value, dueTime: e.target.value })}
      />
      <button
        type="button"
        onClick={onRemove}
        className="flex items-center justify-center rounded-full text-stone-400 hover:text-red-600"
        aria-label="Remove task"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <Input
        className="col-span-2 sm:col-span-6"
        placeholder="Description (optional)"
        value={value.description ?? ""}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
      />
    </div>
  );
}
