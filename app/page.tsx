import Link from "next/link";
import { ArrowRight, LibraryBig, PenLine } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { draftList, generatedDraft, stats, transcripts } from "@/lib/data";

export default function HomePage() {
  return (
    <AppShell
      eyebrow="工作台"
      title="让 AI 写得像你"
      description="先沉淀个人表达资产，再把长视频拆成小红书、知乎和 X 的可编辑草稿。"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-6">
            <div className="rounded-card bg-surface-0 p-6 shadow-editor">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-calibrate-600">声纹资产状态</p>
                  <h2 className="mt-2 text-[22px] font-semibold leading-[1.25] tracking-[-0.012em]">你的表达资产正在变清晰</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-600">
                    系统已经从历史内容里提取观点、语气和禁用表达。下一步不是继续堆资料，而是用改稿反馈校准它。
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href="/create" className="inline-flex min-h-10 items-center gap-2 rounded-button bg-calibrate-500 px-4 text-sm font-medium text-white shadow-action transition-[background-color,transform] duration-150 ease-out active:scale-[0.96] [@media(hover:hover)]:hover:bg-calibrate-600">
                    开始拆条
                    <PenLine className="size-4" aria-hidden="true" />
                  </Link>
                  <Link href="/library" className="hidden min-h-10 items-center gap-2 rounded-button bg-surface-50 px-4 text-sm font-medium text-ink-800 shadow-ring transition-[background-color,transform] duration-150 ease-out active:scale-[0.96] [@media(hover:hover)]:hover:bg-surface-100 sm:inline-flex">
                    管理资产
                    <LibraryBig className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-card bg-canvas-50 p-4 shadow-ring">
                    <p className="text-xs text-ink-600">{stat.label}</p>
                    <p className="mt-2 text-4xl font-semibold tracking-[-0.022em] tabular">{stat.value}</p>
                    <p className="mt-1 text-xs text-ink-400">{stat.helper}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-card bg-surface-0 p-6 shadow-editor">
              <div className="flex items-center justify-between">
                <h2 className="text-[22px] font-semibold tracking-[-0.012em]">最近转录</h2>
                <Link href="/library" className="inline-flex items-center gap-1 text-xs font-medium text-calibrate-600">
                  查看资产库
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              </div>
              <div className="mt-4 grid gap-3">
                {transcripts.slice(0, 3).map((item, index) => (
                  <Link key={item.id} href={`/library/videos/${item.id}`} className="flex items-start gap-3 rounded-card bg-surface-50 p-4 shadow-ring transition-[background-color,transform] duration-150 ease-out active:scale-[0.99] [@media(hover:hover)]:hover:bg-surface-100">
                    <span className="mt-0.5 font-mono text-xs tabular text-ink-400">{String(index + 1).padStart(2, "0")}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink-950">{item.title}</span>
                      <span className="mt-1 block text-xs text-ink-400">{item.source} · {item.duration} · {item.status}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-card bg-surface-0 p-6 shadow-editor">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink-600">最近草稿</p>
                <Link href="/drafts" className="inline-flex items-center gap-1 text-xs font-medium text-calibrate-600">
                  全部
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              </div>
              <h2 className="mt-3 text-[22px] font-semibold leading-[1.25] tracking-[-0.012em]">{generatedDraft.title}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink-800">{generatedDraft.body.split("\n\n").slice(0, 2).join("\n\n")}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-tag bg-calibrate-50 px-2.5 py-1 text-xs font-medium text-calibrate-600">{generatedDraft.platform}</span>
                <span className="rounded-tag bg-surface-50 px-2.5 py-1 text-xs text-ink-600">已校准</span>
              </div>
              <Link href={`/drafts/${draftList[0].id}`} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-button bg-surface-50 px-4 text-sm font-medium text-ink-800 shadow-ring transition-[background-color,transform] duration-150 ease-out active:scale-[0.96] [@media(hover:hover)]:hover:bg-surface-100">
                继续编辑
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </section>

            <section className="rounded-card bg-canvas-100 p-6 shadow-ring">
              <p className="text-sm font-medium text-ink-950">固定示例对比</p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-card bg-surface-50 p-4 shadow-ring">
                  <p className="text-xs font-medium text-ink-400">通用 AI 味</p>
                  <p className="mt-2 text-sm leading-6 text-ink-600">今天给大家分享考研执行力干货，建议狠狠收藏，帮助你快速逆袭上岸。</p>
                </div>
                <div className="rounded-card bg-surface-0 p-4 shadow-editor">
                  <p className="text-xs font-medium text-calibrate-600">像我写版本</p>
                  <p className="mt-2 text-sm leading-6 text-ink-800">计划能不能落地，不看你最有状态的那一天，看你最累的时候还能不能完成最关键的一件事。</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
