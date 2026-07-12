import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";
import { TaskList } from "@/components/tasks/TaskList";

export default async function ClassTasksPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  await verifySession();
  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, description, due_date, due_time, completed")
    .eq("class_id", classId)
    .order("due_date", { ascending: true, nullsFirst: false });

  return <TaskList tasks={tasks ?? []} classId={classId} />;
}
