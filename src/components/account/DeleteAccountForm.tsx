"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "@/app/(dashboard)/account/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function DeleteAccountForm() {
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const canDelete = confirmText === "DELETE";

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteAccount();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete account.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-stone-600">
        Permanently delete your account and every class, syllabus, calendar event, and task tied to
        it. This cannot be undone.
      </p>
      <div>
        <label htmlFor="confirmDelete" className="mb-1 block text-sm font-medium text-stone-700">
          Type <span className="font-mono font-semibold">DELETE</span> to confirm
        </label>
        <Input
          id="confirmDelete"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          className="max-w-xs"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        type="button"
        variant="danger"
        disabled={!canDelete || pending}
        onClick={handleDelete}
        className="self-start"
      >
        {pending ? "Deleting..." : "Delete account"}
      </Button>
    </div>
  );
}
