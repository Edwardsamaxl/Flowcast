import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionTitle } from "@/components/ui";

const steps = [
  ["上传首批历史内容", "至少 3 条视频或口播稿，用来建立初始判断。", CheckCircle2],
  ["提取观点和语气", "从转录文本里识别高频观点、句式和禁用表达。", Loader2],
  ["确认声纹画像", "用户手动修正画像后再进入正式创作。", CheckCircle2]
];

export default function OnboardingPage() {
  return (
    <AppShell
      eyebrow="创建声纹资产库"
      title="先让系统认识你的表达方式"
      description="Onboarding 骨架用于承接首次使用：上传内容、异步转写、生成画像、人工确认。"
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-card bg-surface-0 p-5 shadow-editor">
          <SectionTitle title="首批素材" description="MVP 先做本地上传，链接解析和批量导入留作后续。" />
          <button className="flex min-h-64 w-full flex-col items-center justify-center rounded-card bg-canvas-50 px-6 text-center shadow-ring transition-[background-color,transform] duration-150 ease-out active:scale-[0.96]">
            <UploadCloud className="size-8 text-calibrate-600" aria-hidden="true" />
            <span className="mt-4 text-base font-semibold">上传历史视频或音频</span>
            <span className="mt-2 max-w-sm text-sm leading-6 text-ink-600">
              建议先上传 3 条最能代表你表达方式的长内容，系统会先生成可编辑画像。
            </span>
          </button>
        </section>

        <section className="rounded-card bg-surface-0 p-5 shadow-ring">
          <SectionTitle title="建立进度" />
          <div className="space-y-3">
            {steps.map(([title, detail, Icon]) => (
              <div key={title as string} className="flex gap-3 rounded-card bg-surface-50 p-4 shadow-ring">
                <Icon className="mt-0.5 size-5 text-green-500" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">{title as string}</p>
                  <p className="mt-1 text-sm leading-6 text-ink-600">{detail as string}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/library"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-button bg-calibrate-500 px-5 text-sm font-medium text-white shadow-action transition-[background-color,transform] duration-150 ease-out active:scale-[0.96]"
          >
            查看初始画像
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
