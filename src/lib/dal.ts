import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const verifySession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(); // never getSession() for authorization

  if (error || !user) {
    redirect("/login");
  }

  return { user };
});

export type ClassSummary = {
  id: string;
  name: string;
  course_code: string | null;
  term: string | null;
  color: string;
  status: "draft" | "active" | "archived";
  created_at: string;
};

export const getClasses = cache(async (): Promise<ClassSummary[]> => {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classes")
    .select("id, name, course_code, term, color, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
});

export const getProfile = cache(async () => {
  const { user } = await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, calendar_feed_token")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
});

// Wrapped in React's cache() so that a class layout and its nested page
// (e.g. class layout + calendar/tasks/review page) share one query per
// request instead of issuing the same lookup twice.
export const getClassById = cache(async (classId: string) => {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classes")
    .select("id, name, course_code, term, color, status")
    .eq("id", classId)
    .single();

  if (error) throw error;
  return data;
});
