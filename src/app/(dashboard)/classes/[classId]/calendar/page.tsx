import { createClient } from "@/lib/supabase/server";
import { getClassById, verifySession } from "@/lib/dal";
import { CalendarView } from "@/components/calendar/CalendarView";

export default async function ClassCalendarPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  await verifySession();
  const klass = await getClassById(classId);
  const supabase = await createClient();

  const [{ data: schedules }, { data: events }] = await Promise.all([
    supabase
      .from("class_schedules")
      .select("id, day_of_week, start_time, end_time, location, starts_on, ends_on")
      .eq("class_id", classId),
    supabase
      .from("calendar_events")
      .select("id, event_type, title, event_date")
      .eq("class_id", classId),
  ]);

  return (
    <CalendarView
      schedules={schedules ?? []}
      events={events ?? []}
      classColor={klass.color}
    />
  );
}
