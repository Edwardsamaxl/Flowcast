import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Metric({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-card bg-surface-0 p-4 shadow-ring">
      <p className="text-xs text-ink-600">{label}</p>
      <p className="mt-2 text-4xl font-semibold tracking-[-0.022em] tabular">{value}</p>
      <p className="mt-1 text-xs text-ink-400">{helper}</p>
    </div>
  );
}

export function SectionTitle({
  kicker,
  title,
  description
}: {
  kicker?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4 flex flex-col gap-1">
      {kicker ? <p className="text-xs font-medium text-calibrate-600">{kicker}</p> : null}
      <h2 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.012em] text-ink-950">{title}</h2>
      {description ? <p className="max-w-2xl text-sm leading-6 text-ink-600 pretty">{description}</p> : null}
    </div>
  );
}

export function IconPill({
  icon: Icon,
  children,
  active = false
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-button px-3 text-sm shadow-ring",
        active ? "bg-surface-0 text-calibrate-600" : "bg-surface-50 text-ink-600"
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {children}
    </span>
  );
}

export function TextareaBlock({
  label,
  value,
  rows = 8
}: {
  label: string;
  value: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-800">{label}</span>
      <textarea
        className="mt-2 w-full resize-none rounded-card bg-surface-0 p-4 text-sm leading-7 text-ink-800 shadow-ring outline-none transition-[box-shadow] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-calibrate-500/25"
        rows={rows}
        defaultValue={value}
      />
    </label>
  );
}
