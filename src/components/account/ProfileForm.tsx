"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/(dashboard)/account/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-stone-700">
          Display name
        </label>
        <Input id="displayName" name="displayName" defaultValue={displayName} required />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-clay-600">{state.success}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
