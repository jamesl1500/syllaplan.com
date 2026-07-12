"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";

export async function toggleTaskComplete(taskId: string, classId: string, completed: boolean) {
  const { user } = await verifySession();
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/classes/${classId}/tasks`);
}
