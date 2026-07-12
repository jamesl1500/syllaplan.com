"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySession } from "@/lib/dal";

export type AccountFormState = { error?: string; success?: string } | undefined;

export async function updateProfile(
  _prevState: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const { user } = await verifySession();
  const displayName = formData.get("displayName");

  if (typeof displayName !== "string" || !displayName.trim()) {
    return { error: "Enter a display name." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName.trim() })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/account");
  return { success: "Profile updated." };
}

export async function updateEmail(
  _prevState: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  await verifySession();
  const email = formData.get("email");

  if (typeof email !== "string" || !email) {
    return { error: "Enter a new email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email });

  if (error) return { error: error.message };

  return { success: `Confirmation link sent to ${email}. Click it to finish changing your email.` };
}

export async function updatePassword(
  _prevState: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  await verifySession();
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (typeof password !== "string" || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don't match." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: error.message };
  return { success: "Password updated." };
}

export async function deleteAccount() {
  const { user } = await verifySession();
  const supabase = await createClient();

  const { data: files } = await supabase.storage.from("syllabi").list(user.id);
  if (files && files.length > 0) {
    await supabase.storage.from("syllabi").remove(files.map((f) => `${user.id}/${f.name}`));
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw new Error(error.message);

  await supabase.auth.signOut();
  redirect("/");
}
