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
    <div className="min-h-screen text-ink-950">
      <aside className="fixed inset-y-0 left-0 hidden w-[264px] border-r border-paper-200 bg-paper-50/95 px-4 py-5 lg:block">
        <Link href="/" className="group flex items-center gap-3 rounded-button px-2 py-2 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:translate-y-px">
          <span className="grid size-10 place-items-center rounded-button bg-ink-950 font-editorial text-lg font-semibold text-paper-0 shadow-hairline">
            流
          </span>
          <span>
            <span className="block font-editorial text-xl font-semibold leading-tight">流转</span>
            <span className="mt-0.5 block text-xs text-ink-600">内容流转工作台</span>
          </span>
        </Link>

        <nav className="mt-9 space-y-1" aria-label="主导航">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-10 items-center gap-3 rounded-button border-l-2 px-3 text-sm transition-[background-color,border-color,transform,color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:translate-y-px",
                  active
                    ? "border-seal-500 bg-seal-50 text-ink-950"
                    : "border-transparent text-ink-600 [@media(hover:hover)]:hover:bg-paper-0 [@media(hover:hover)]:hover:text-ink-950"
                )}
              >
                <Icon className="size-4 stroke-[1.5]" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-4 bottom-5 border-t border-paper-200 pt-4">
          <p className="text-xs leading-5 text-ink-600">
            视频只会在用户确认后写入人物画像。拆解内容默认只影响当前稿件。
          </p>
        </div>
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-20 border-b border-paper-200 bg-paper-0/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4">
            <div className="min-w-0">
              {eyebrow ? <p className="text-xs font-medium text-seal-500">{eyebrow}</p> : null}
              <h1 className="mt-1 truncate font-editorial text-[32px] font-semibold leading-[1.12] text-ink-950 sm:text-[38px]">
                {title}
              </h1>
              {description ? (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-600">{description}</p>
              ) : null}
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <label className="relative">
                <span className="sr-only">搜索资产</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                <input
                  className="h-10 w-60 rounded-button border border-paper-200 bg-paper-0 pl-9 pr-3 text-sm text-ink-800 outline-none transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-ink-400 focus-visible:border-seal-500 focus-visible:ring-2 focus-visible:ring-seal-500/20"
                  placeholder="搜索观点、视频、草稿"
                />
              </label>
              <button className="inline-flex min-h-10 items-center gap-2 rounded-button bg-seal-500 px-4 text-sm font-medium text-paper-0 shadow-action transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] [@media(hover:hover)]:hover:bg-seal-600">
                <UploadCloud className="size-4 stroke-[1.5]" aria-hidden="true" />
                {actionLabel}
              </button>
            </div>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-[1360px] px-4 pb-24 pt-7 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-paper-200 bg-paper-0 px-2 py-2 lg:hidden" aria-label="移动端导航">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-button text-[11px] transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:translate-y-px",
                active ? "bg-seal-50 text-seal-600" : "text-ink-600"
              )}
            >
              <Icon className="size-4 stroke-[1.5]" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
