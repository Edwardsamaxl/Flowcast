"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, UploadCloud } from "lucide-react";
import { navItems } from "@/lib/data";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
};

export function AppShell({
  children,
  eyebrow,
  title,
  description,
  actionLabel = "上传视频"
}: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-canvas-50 text-ink-950">
      <aside className="fixed inset-y-0 left-0 hidden w-[248px] border-r border-line-200 bg-canvas-100 px-4 py-5 lg:block">
        <Link href="/" className="flex items-center gap-3 rounded-button px-2 py-2 transition-transform duration-150 ease-out active:scale-[0.96]">
          <span className="grid size-9 place-items-center rounded-tag bg-ink-950 text-sm font-semibold text-white shadow-ring">
            像
          </span>
          <span>
            <span className="block text-lg font-semibold tracking-[-0.012em]">像我写</span>
            <span className="block text-xs text-ink-600">个人表达资产库</span>
          </span>
        </Link>

        <nav className="mt-8 space-y-1" aria-label="主导航">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-10 items-center gap-3 rounded-button px-3 text-sm transition-[background-color,transform,color] duration-150 ease-out active:scale-[0.96]",
                  active
                    ? "bg-surface-0 text-ink-950 shadow-ring"
                    : "text-ink-600 [@media(hover:hover)]:hover:bg-surface-50 [@media(hover:hover)]:hover:text-ink-950"
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-line-200 bg-canvas-50/95 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              {eyebrow ? (
                <p className="text-xs font-medium text-calibrate-600">{eyebrow}</p>
              ) : null}
              <h1 className="mt-1 truncate text-[30px] font-semibold leading-[1.15] tracking-[-0.012em] text-ink-950">
                {title}
              </h1>
              {description ? (
                <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-600">{description}</p>
              ) : null}
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <label className="relative">
                <span className="sr-only">搜索资产</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                <input
                  className="h-10 w-56 rounded-button bg-surface-0 pl-9 pr-3 text-sm shadow-ring outline-none transition-[box-shadow] duration-150 ease-out placeholder:text-ink-400 focus-visible:ring-2 focus-visible:ring-calibrate-500/25"
                  placeholder="搜索观点、视频、草稿"
                />
              </label>
              <button className="inline-flex min-h-10 items-center gap-2 rounded-button bg-calibrate-500 px-4 text-sm font-medium text-white shadow-action transition-[background-color,transform] duration-150 ease-out active:scale-[0.96] [@media(hover:hover)]:hover:bg-calibrate-600">
                <UploadCloud className="size-4" aria-hidden="true" />
                {actionLabel}
              </button>
            </div>
          </div>
        </header>

        <main id="main-content" className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line-200 bg-surface-0 px-2 py-2 lg:hidden" aria-label="移动端导航">
        {navItems.filter((item) => item.href !== "/calibrate").map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-button text-[11px] transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96]",
                active ? "bg-calibrate-50 text-calibrate-600" : "text-ink-600"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
