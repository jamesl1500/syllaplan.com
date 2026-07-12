"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/(dashboard)/account/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function PasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-stone-700">
          New password
        </label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
        <p className="mt-1 text-xs text-stone-500">At least 8 characters.</p>
      </div>
      <div>
        <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-stone-700">
          Confirm new password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-clay-600">{state.success}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
