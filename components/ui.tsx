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
    <div className="rounded-card border border-paper-200 bg-paper-0 p-4 shadow-sheet">
      <p className="text-xs text-ink-600">{label}</p>
      <p className="mt-2 font-editorial text-4xl font-semibold tracking-[-0.01em] tabular">{value}</p>
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
      {kicker ? <p className="text-xs font-medium text-seal-500">{kicker}</p> : null}
      <h2 className="font-editorial text-[24px] font-semibold leading-[1.2] tracking-[-0.01em] text-ink-950">{title}</h2>
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
        "inline-flex min-h-10 items-center gap-2 rounded-button border px-3 text-sm",
        active ? "border-seal-500 bg-seal-50 text-seal-600" : "border-paper-200 bg-paper-0 text-ink-600"
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
        className="mt-2 w-full resize-none rounded-card border border-paper-200 bg-paper-0 p-4 text-[15px] leading-7 text-ink-800 outline-none transition-[border-color,box-shadow] duration-200 ease-out focus-visible:border-seal-500 focus-visible:ring-2 focus-visible:ring-seal-500/20"
        rows={rows}
        defaultValue={value}
      />
    </label>
  );
}
