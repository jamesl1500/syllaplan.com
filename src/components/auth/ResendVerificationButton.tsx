"use client";

import { useState, useTransition } from "react";
import { resendVerificationEmail } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";

export function ResendVerificationButton({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        await resendVerificationEmail(email);
        setSent(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to resend email.");
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button type="button" variant="secondary" onClick={handleClick} disabled={pending}>
        {pending ? "Sending..." : "Resend email"}
      </Button>
      {sent && <p className="text-sm text-clay-600">Verification email sent.</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
