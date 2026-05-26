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
        "min-h-10 rounded-button px-3 text-sm transition-[background-color,color,transform,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seal-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45",
        active
          ? "bg-seal-500 text-paper-0 shadow-action"
          : "bg-paper-50 text-ink-600 shadow-hairline [@media(hover:hover)]:hover:bg-seal-50 [@media(hover:hover)]:hover:text-seal-600"
      )}
    >
      {active ? "已收录" : label}
    </button>
  );
}
