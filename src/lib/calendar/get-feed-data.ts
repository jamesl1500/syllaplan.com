import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedClass, FeedSchedule, FeedEvent, FeedTask } from "./ics";

export type FeedData = {
  classes: FeedClass[];
  schedules: FeedSchedule[];
  events: FeedEvent[];
  tasks: FeedTask[];
};

/**
 * Fetches everything the calendar feed (`buildICSFeed`) needs for one user.
 * Takes any Supabase client — the authenticated request-scoped client (RLS
 * applies) or the service-role admin client (the unauthenticated feed route
 * looks the user up by token first, then fetches with admin since there's
 * no session to carry RLS) — both expose the same query surface.
 */
export async function getFeedData(supabase: SupabaseClient, userId: string): Promise<FeedData> {
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, course_code")
    .eq("user_id", userId)
    .eq("status", "active");

  const classIds = (classes ?? []).map((c) => c.id);
  if (classIds.length === 0) {
    return { classes: [], schedules: [], events: [], tasks: [] };
  }

  const [{ data: schedules }, { data: events }, { data: tasks }] = await Promise.all([
    supabase
      .from("class_schedules")
      .select("id, class_id, day_of_week, start_time, end_time, location, starts_on, ends_on")
      .in("class_id", classIds),
    supabase
      .from("calendar_events")
      .select("id, class_id, event_type, title, description, event_date, start_time, end_time, all_day")
      .in("class_id", classIds),
    supabase
      .from("tasks")
      .select("id, class_id, title, description, due_date, due_time")
      .in("class_id", classIds)
      .eq("completed", false)
      .not("due_date", "is", null),
  ]);

  return {
    classes: classes ?? [],
    schedules: (schedules ?? []) as FeedSchedule[],
    events: (events ?? []) as FeedEvent[],
    tasks: (tasks ?? []) as FeedTask[],
  };
}
