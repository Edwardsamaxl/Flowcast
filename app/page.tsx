import Link from "next/link";
import { ArrowRight, BookOpenText, LibraryBig, PenLine } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { draftList, generatedDraft, stats, transcripts } from "@/lib/data";

export default function HomePage() {
  return (
    <AppShell
      eyebrow="首页"
      title="让 AI 写得像你。"
      description="建立你的个人声纹资产库，让 AI 学会你的观点、语气和表达方式。无论是长视频还是直播内容，都能转化成像本人写的平台文字内容。"
      actionLabel="创建声纹资产库"
    >
      <div className="grid gap-7 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-7">
          <div className="rounded-card border border-paper-200 bg-paper-0 p-6 shadow-sheet sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-sm font-medium text-seal-500">个人声纹资产库</p>
                <h2 className="mt-3 max-w-3xl font-editorial text-[34px] font-semibold leading-[1.12] tracking-[-0.01em] text-ink-950 sm:text-[44px]">
                  把你的观点、语气和禁用表达，整理成 AI 可调用的写作档案。
                </h2>
                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink-600">
                  先沉淀个人表达资产，再把长视频拆成小红书、知乎和 X 的可编辑草稿。每一次改稿反馈，都会写回下一次生成的约束。
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/library" className="inline-flex min-h-11 items-center gap-2 rounded-button bg-seal-500 px-5 text-sm font-medium text-paper-0 shadow-action transition-[background-color,transform] duration-200 ease-out active:translate-y-px [@media(hover:hover)]:hover:bg-seal-600">
                  创建我的声纹资产库
                  <LibraryBig className="size-4" aria-hidden="true" />
                </Link>
                <Link href="/create" className="inline-flex min-h-11 items-center gap-2 rounded-button border border-paper-200 bg-paper-0 px-5 text-sm font-medium text-ink-800 transition-[background-color,transform] duration-200 ease-out active:translate-y-px [@media(hover:hover)]:hover:bg-paper-50">
                  试写一篇内容
                  <PenLine className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-card border border-paper-200 bg-paper-50 p-4">
                  <p className="text-xs text-ink-600">{stat.label}</p>
                  <p className="mt-2 font-editorial text-4xl font-semibold tracking-[-0.01em] tabular">{stat.value}</p>
                  <p className="mt-1 text-xs text-ink-400">{stat.helper}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-card border border-paper-200 bg-paper-0 p-6 shadow-sheet">
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-[24px] font-semibold tracking-[-0.01em]">最近转录</h2>
              <Link href="/library" className="inline-flex items-center gap-1 text-xs font-medium text-seal-500">
                查看资产库
                <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-4 grid gap-3">
              {transcripts.slice(0, 3).map((item, index) => (
                <Link key={item.id} href={`/library/videos/${item.id}`} className="flex items-start gap-3 rounded-button border border-paper-200 bg-paper-50 p-4 transition-[background-color,transform] duration-200 ease-out active:translate-y-px [@media(hover:hover)]:hover:bg-paper-0">
                  <span className="mt-0.5 font-mono text-xs tabular text-ink-400">{String(index + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink-950">{item.title}</span>
                    <span className="mt-1 block text-xs text-ink-400">{item.source} / {item.duration} / {item.status}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-7">
          <section className="rounded-card border border-paper-200 bg-paper-0 p-6 shadow-sheet">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink-600">最近草稿</p>
              <Link href="/drafts" className="inline-flex items-center gap-1 text-xs font-medium text-seal-500">
                全部
                <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            </div>
            <h2 className="mt-3 font-editorial text-[26px] font-semibold leading-[1.25] tracking-[-0.01em]">{generatedDraft.title}</h2>
            <p className="mt-4 whitespace-pre-line border-l-2 border-seal-500 pl-4 text-sm leading-7 text-ink-800">{generatedDraft.body.split("\n\n").slice(0, 2).join("\n\n")}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-tag bg-seal-50 px-2.5 py-1 text-xs font-medium text-seal-600">{generatedDraft.platform}</span>
              <span className="rounded-tag bg-paper-50 px-2.5 py-1 text-xs text-ink-600">已校准</span>
            </div>
            <Link href={`/drafts/${draftList[0].id}`} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-button border border-paper-200 bg-paper-0 px-4 text-sm font-medium text-ink-800 transition-[background-color,transform] duration-200 ease-out active:translate-y-px [@media(hover:hover)]:hover:bg-paper-50">
              继续编辑
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </section>

          <section className="rounded-card border border-paper-200 bg-paper-50 p-6">
            <div className="flex items-center gap-2">
              <BookOpenText className="size-4 text-seal-500" aria-hidden="true" />
              <p className="text-sm font-medium text-ink-950">固定示例对比</p>
            </div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-button border border-paper-200 bg-paper-0 p-4">
                <p className="text-xs font-medium text-ink-400">通用 AI 味</p>
                <p className="mt-2 text-sm leading-6 text-ink-600">今天给大家分享考研执行力干货，建议狠狠收藏，帮助你快速逆袭上岸。</p>
              </div>
              <div className="rounded-button border border-seal-500/30 bg-paper-0 p-4">
                <p className="text-xs font-medium text-seal-500">像我写版本</p>
                <p className="mt-2 text-sm leading-6 text-ink-800">计划能不能落地，不看你最有状态的那一天，看你最累的时候还能不能完成最关键的一件事。</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
