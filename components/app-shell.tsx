"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/data";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
};

export function AppShell({
  children,
  eyebrow,
  title,
  description,
}: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen text-ink-950">
      <aside className="fixed inset-y-0 left-0 hidden w-[264px] border-r border-paper-200 bg-paper-50/95 px-4 py-5 lg:block">
        <Link href="/" className="group flex items-center rounded-button px-2 py-2 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:translate-y-px" aria-label="Flowcast 首页">
          <img
            src="/brand/flowcast-logo-v1.png"
            alt="流转 Flowcast"
            className="h-10 w-auto object-contain"
          />
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
            <div className="hidden items-center gap-2 md:flex" />
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
