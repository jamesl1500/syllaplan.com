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

export async function getClasses(): Promise<ClassSummary[]> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classes")
    .select("id, name, course_code, term, color, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getProfile() {
  const { user } = await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function getClassById(classId: string) {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classes")
    .select("id, name, course_code, term, color, status")
    .eq("id", classId)
    .single();

  if (error) throw error;
  return data;
}
