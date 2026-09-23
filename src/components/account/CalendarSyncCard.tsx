"use client";

import { useState, useTransition } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { regenerateCalendarFeedToken } from "@/app/(dashboard)/account/actions";
import { Button } from "@/components/ui/Button";

export function CalendarSyncCard({ feedUrl }: { feedUrl: string }) {
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy automatically — select and copy the link manually.");
    }
  }

  function handleRegenerate() {
    setError(null);
    if (
      !window.confirm(
        "Generate a new link? Any calendar app already subscribed to the old one will stop updating.",
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await regenerateCalendarFeedToken();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate a new link.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-stone-600">
        Subscribe to this link from Google Calendar, Apple Calendar, or Outlook to see your class
        sessions, exams, and task due dates alongside everything else — it stays in sync
        automatically as your classes change.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          readOnly
          value={feedUrl}
          aria-label="Calendar subscription link"
          onFocus={(e) => e.target.select()}
          className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 font-mono text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-clay-500/30 sm:flex-1"
        />
        <Button type="button" variant="secondary" onClick={handleCopy} className="shrink-0">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        type="button"
        variant="ghost"
        onClick={handleRegenerate}
        disabled={pending}
        className="self-start text-stone-500"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        {pending ? "Generating..." : "Generate new link"}
      </Button>
    </div>
  );
}
