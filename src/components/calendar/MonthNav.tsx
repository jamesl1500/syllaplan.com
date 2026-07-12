"use client";

import { ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import { MONTH_LABELS } from "@/lib/calendar/date-utils";

export function MonthNav({
  currentMonth,
  onPrev,
  onNext,
  onToday,
  viewMode,
  onViewModeChange,
}: {
  currentMonth: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  viewMode: "month" | "agenda";
  onViewModeChange: (mode: "month" | "agenda") => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-full p-1.5 text-stone-500 hover:bg-stone-900/5"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="min-w-[10rem] text-center font-serif text-lg font-medium text-stone-900">
          {MONTH_LABELS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button
          type="button"
          onClick={onNext}
          className="rounded-full p-1.5 text-stone-500 hover:bg-stone-900/5"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onToday}
          className="ml-2 rounded-full border border-stone-300 px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-50"
        >
          Today
        </button>
      </div>
      <div className="flex rounded-full border border-stone-300 p-0.5">
        <button
          type="button"
          onClick={() => onViewModeChange("month")}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            viewMode === "month" ? "bg-clay-500 text-white" : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" /> Month
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("agenda")}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            viewMode === "agenda" ? "bg-clay-500 text-white" : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <List className="h-3.5 w-3.5" /> Agenda
        </button>
      </div>
    </div>
  );
}
