import Link from "next/link";
import { ArrowRight, LibraryBig, PenLine } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { flowSteps, generatedDraft, platformRules } from "@/lib/data";

export default function HomePage() {
  return (
    <AppShell
      eyebrow="首页"
      title="让视频内容自然流转。"
      description="建立人物声纹资产库，让 AI 学会你的观点、语气和表达方式。无论是长视频还是直播内容，都能转化成像本人写的多平台文字内容。"
      actionLabel="上传视频"
    >
      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-card border border-paper-200 bg-paper-0 p-2 shadow-sheet">
          <div className="rounded-[8px] bg-paper-0 p-7 sm:p-9">
            <p className="inline-flex rounded-full bg-seal-50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-seal-600">
              Flowcast
            </p>
            <h2 className="mt-6 max-w-3xl font-editorial text-[48px] font-semibold leading-[1.08] text-ink-950 sm:text-[64px]">
              把一条视频，变成一组可复用的表达资产。
            </h2>
            <p className="mt-5 max-w-2xl text-[16px] leading-8 text-ink-600">
              先解析视频，再由你确认哪些观点、语气、结构可以写入人物画像。拆解内容默认只影响当前稿件，避免污染人设库。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/library" className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-seal-500 py-2 pl-5 pr-2 text-sm font-medium text-paper-0 shadow-action transition-[background-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] [@media(hover:hover)]:hover:bg-seal-600">
                创建声纹资产库
                <span className="grid size-8 place-items-center rounded-full bg-paper-0/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-px">
                  <LibraryBig className="size-4" aria-hidden="true" />
                </span>
              </Link>
              <Link href="/create" className="group inline-flex min-h-12 items-center gap-3 rounded-full border border-paper-200 bg-paper-0 py-2 pl-5 pr-2 text-sm font-medium text-ink-800 transition-[background-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] [@media(hover:hover)]:hover:bg-paper-50">
                拆解一条内容
                <span className="grid size-8 place-items-center rounded-full bg-paper-50 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-px">
                  <PenLine className="size-4" aria-hidden="true" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-card border border-paper-200 bg-paper-50 p-2 shadow-sheet">
          <div className="rounded-[8px] bg-paper-0 p-5">
            <div className="grid gap-3">
              {flowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex items-center gap-4 rounded-card border border-paper-200 bg-paper-50 p-4">
                    <span className="font-mono text-xs tabular text-ink-400">{String(index + 1).padStart(2, "0")}</span>
                    <span className="grid size-10 place-items-center rounded-button bg-paper-0 text-seal-500 shadow-hairline">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-ink-950">{step.title}</span>
                      <span className="mt-1 block text-xs text-ink-600">{step.detail}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-card border border-paper-200 bg-paper-0 p-6 shadow-sheet">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-seal-500">流转示例</p>
              <h2 className="mt-2 font-editorial text-[28px] font-semibold">同一段视频，三种平台写法</h2>
            </div>
            <ArrowRight className="size-4 text-ink-400" aria-hidden="true" />
          </div>
          <div className="mt-5 grid gap-3">
            {Object.entries(platformRules).map(([key, rule]) => (
              <article key={key} className="rounded-card border border-paper-200 bg-paper-50 p-4">
                <div className="flex items-center gap-2">
                  <rule.icon className="size-4 text-seal-500" aria-hidden="true" />
                  <h3 className="text-sm font-medium text-ink-950">{rule.name}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-ink-600">{rule.rule}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-card border border-paper-200 bg-paper-0 p-6 shadow-sheet">
          <p className="text-xs font-medium text-seal-500">像本人写的对比</p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-card border border-paper-200 bg-paper-50 p-4">
              <p className="text-xs font-medium text-ink-400">普通 AI 文案</p>
              <p className="mt-2 text-sm leading-6 text-ink-600">今天给大家分享考研执行力干货，建议狠狠收藏，帮助你快速逆袭上岸。</p>
            </div>
            <div className="rounded-card border border-seal-500/30 bg-paper-0 p-4">
              <p className="text-xs font-medium text-seal-500">调用人物画像后</p>
              <p className="mt-2 text-sm leading-6 text-ink-800">{generatedDraft.body.split("\n\n")[2]}</p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
