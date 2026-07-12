"use client";

import { useOptimistic, useTransition } from "react";
import { toggleTaskComplete } from "@/app/(dashboard)/classes/[classId]/tasks/actions";

export function TaskCompleteCheckbox({
  taskId,
  classId,
  completed,
}: {
  taskId: string;
  classId: string;
  completed: boolean;
}) {
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(completed);
  const [, startTransition] = useTransition();

  function handleChange(next: boolean) {
    startTransition(async () => {
      setOptimisticCompleted(next);
      await toggleTaskComplete(taskId, classId, next);
    });
  }

  return (
    <input
      type="checkbox"
      checked={optimisticCompleted}
      onChange={(e) => handleChange(e.target.checked)}
      className="h-4 w-4 rounded border-stone-300 text-clay-500 focus:ring-clay-500"
      aria-label="Mark task complete"
    />
  );
}
