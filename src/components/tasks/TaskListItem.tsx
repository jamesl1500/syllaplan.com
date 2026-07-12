import { TaskCompleteCheckbox } from "./TaskCompleteCheckbox";

export type TaskRecord = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  completed: boolean;
};

export function TaskListItem({ task, classId }: { task: TaskRecord; classId: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-stone-200 py-3 last:border-0">
      <div className="mt-0.5">
        <TaskCompleteCheckbox taskId={task.id} classId={classId} completed={task.completed} />
      </div>
      <div className="flex-1">
        <p className={`text-sm ${task.completed ? "text-stone-400 line-through" : "text-stone-900"}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 text-xs text-stone-500">{task.description}</p>
        )}
      </div>
      {task.due_date && (
        <span className="shrink-0 text-xs text-stone-500">
          {new Date(task.due_date + "T00:00:00").toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      )}
    </div>
  );
}
