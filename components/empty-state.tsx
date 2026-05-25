import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center pt-16 text-center">
      <Icon className="size-12 text-ink-400" aria-hidden="true" />
      <h2 className="mt-5 text-xl font-semibold tracking-[-0.012em] text-ink-600">
        {title}
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-6 text-ink-400">{description}</p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-button bg-calibrate-500 px-5 text-sm font-medium text-white shadow-action transition-[background-color,transform] duration-150 ease-out active:scale-[0.96] [@media(hover:hover)]:hover:bg-calibrate-600"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
