"use client";

import { cn } from "@/lib/utils";

type FeedbackTagProps = {
  label: string;
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export function FeedbackTag({ label, active, onToggle, disabled = false }: FeedbackTagProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "min-h-10 rounded-button px-3 text-sm transition-[background-color,color,transform,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calibrate-500/25 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-45",
        active
          ? "bg-calibrate-500 text-white shadow-action"
          : "bg-surface-50 text-ink-600 shadow-ring [@media(hover:hover)]:hover:bg-calibrate-50 [@media(hover:hover)]:hover:text-calibrate-600"
      )}
    >
      {active ? "已收录" : label}
    </button>
  );
}
