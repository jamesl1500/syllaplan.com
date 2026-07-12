"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEmail } from "@/app/(dashboard)/account/actions";
import { resendVerificationEmail } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function EmailForm({
  email,
  emailConfirmed,
}: {
  email: string;
  emailConfirmed: boolean;
}) {
  const [state, action, pending] = useActionState(updateEmail, undefined);
  const router = useRouter();
  const [verifying, startVerifying] = useTransition();
  const [verifyError, setVerifyError] = useState<string | null>(null);

  function handleVerifyClick() {
    setVerifyError(null);
    startVerifying(async () => {
      try {
        await resendVerificationEmail(email);
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } catch (err) {
        setVerifyError(err instanceof Error ? err.message : "Failed to send verification email.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-stone-700">
          Current: <span className="font-medium text-stone-900">{email}</span>
        </p>
        {emailConfirmed ? (
          <span className="rounded-full bg-clay-50 px-2 py-0.5 text-xs font-medium text-clay-700">Verified</span>
        ) : (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            Not verified
          </span>
        )}
      </div>

      {!emailConfirmed && (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleVerifyClick}
            disabled={verifying}
            className="self-start"
          >
            {verifying ? "Sending..." : "Verify email"}
          </Button>
          {verifyError && <p className="text-sm text-red-600">{verifyError}</p>}
        </div>
      )}

      <form action={action} className="flex flex-col gap-3 border-t border-stone-200 pt-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-700">
            New email address
          </label>
          <Input id="email" name="email" type="email" placeholder="you@school.edu" required />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="text-sm text-clay-600">{state.success}</p>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Updating..." : "Update email"}
        </Button>
      </form>
    </div>
  );
}
