import { RotateCcw, Save, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FeedbackBar } from "@/components/feedback-bar";
import { TextareaBlock } from "@/components/ui";
import { generatedDraft, transcripts } from "@/lib/data";

export default function CalibratePage() {
  const transcript = transcripts[0];

  return (
    <AppShell
      eyebrow="编辑与校准"
      title="把反馈写回声纹画像"
      description="两栏校准是 MVP 的使用核心：左边看来源，右边改内容，底部记录明确反馈。"
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-card bg-canvas-50 p-5 shadow-ring">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-ink-400">来源视频</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.012em]">{transcript.title}</h2>
              <p className="mt-1 text-xs text-ink-400">{transcript.source} · {transcript.duration}</p>
            </div>
            <button className="inline-flex min-h-10 items-center gap-2 rounded-button bg-surface-50 px-3 text-sm text-ink-800 shadow-ring transition-[background-color,transform] duration-150 ease-out active:scale-[0.96]">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              画像
            </button>
          </div>
          <div className="mt-5 rounded-card bg-canvas-50 p-5 text-sm leading-7 text-ink-600 shadow-ring">
            <p>{transcript.excerpt}</p>
            <p className="mt-4">
              所以你不要问“我能不能每天学 12 个小时”，而要问“如果今天状态很差，我还能不能完成最关键的一件事”。这才是计划真正开始有用的地方。
            </p>
            <p className="mt-4">
              计划不是拿来感动自己的，它是拿来减少犹豫的。越复杂的计划，越容易在第一周就崩掉。
            </p>
          </div>
        </section>

        <section className="rounded-card bg-surface-0 p-5 shadow-editor">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-calibrate-600">生成草稿 · {generatedDraft.platform}</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.012em]">{generatedDraft.title}</h2>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex min-h-10 items-center gap-2 rounded-button bg-surface-50 px-3 text-sm text-ink-800 shadow-ring transition-[background-color,transform] duration-150 ease-out active:scale-[0.96]">
                <RotateCcw className="size-4" aria-hidden="true" />
                重新生成
              </button>
              <button className="inline-flex min-h-10 items-center gap-2 rounded-button bg-calibrate-500 px-3 text-sm font-medium text-white shadow-action transition-[background-color,transform] duration-150 ease-out active:scale-[0.96]">
                <Save className="size-4" aria-hidden="true" />
                保存
              </button>
            </div>
          </div>

          <div className="mt-5">
            <TextareaBlock label="可编辑内容" value={generatedDraft.body} rows={14} />
          </div>

          <div className="mt-5 rounded-card bg-calibrate-50 p-4 shadow-ring">
            <p className="text-sm font-medium">不像我检测</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-ink-600">
              {generatedDraft.warnings.map((warning) => (
                <li key={warning}>• {warning}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <FeedbackBar />
    </AppShell>
  );
}
