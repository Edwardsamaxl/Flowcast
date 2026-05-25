import Link from "next/link";
import { ArrowRight, Check, Loader2, UploadCloud } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { IconPill, SectionTitle } from "@/components/ui";
import { platformRules, transcripts } from "@/lib/data";

export default function CreatePage() {
  return (
    <AppShell
      eyebrow="内容创作"
      title="从长内容拆条"
      description="MVP 只做一个稳定模式：选择已转录视频，选择输出平台，生成可编辑草稿。"
      actionLabel="导入内容"
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-6">
          <div className="rounded-card bg-surface-0 p-5 shadow-editor">
            <SectionTitle title="上传或选择素材" description="本地 faster-whisper 暂以异步状态占位，后续接 Node 任务队列。" />
            <button className="flex min-h-36 w-full flex-col items-center justify-center rounded-card bg-canvas-50 px-4 text-center shadow-ring transition-[background-color,transform] duration-150 ease-out active:scale-[0.96] [@media(hover:hover)]:hover:bg-surface-50">
              <UploadCloud className="size-7 text-calibrate-600" aria-hidden="true" />
              <span className="mt-3 text-sm font-medium">拖入本地视频或点击上传</span>
              <span className="mt-1 text-xs text-ink-400">MP4、MOV、M4A，先做本地文件</span>
            </button>
          </div>

          <div className="rounded-card bg-surface-0 p-5 shadow-ring">
            <SectionTitle title="转写任务" />
            <div className="space-y-3">
              {[
                ["普通人考研最容易高估自己的执行力", "已完成", Check],
                ["复盘不是检讨书", "转写中", Loader2]
              ].map(([title, status, Icon]) => (
                <div key={title as string} className="flex items-center justify-between rounded-button bg-surface-50 p-3 shadow-ring">
                  <div>
                    <p className="text-sm font-medium">{title as string}</p>
                    <p className="mt-1 text-xs text-ink-400">{status as string}</p>
                  </div>
                  <Icon className="size-4 text-green-500" aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-card bg-surface-0 p-5 shadow-editor">
          <SectionTitle title="生成设置" description="先把配置透明地展示出来，让用户知道 AI 调用了哪些个人资产。" />
          <div className="grid gap-5">
            <div>
              <p className="text-sm font-medium">选择已转录视频</p>
              <div className="mt-3 grid gap-3">
                {transcripts.slice(0, 2).map((item, index) => (
                  <label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-card bg-surface-50 p-4 shadow-ring transition-[background-color,transform] duration-150 ease-out active:scale-[0.96]">
                    <input type="radio" name="transcript" defaultChecked={index === 0} className="mt-1 accent-calibrate-500" />
                    <span>
                      <span className="block text-sm font-medium">{item.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-ink-400">{item.excerpt}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">输出平台</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(platformRules).map(([key, rule], index) => (
                  <IconPill key={key} icon={rule.icon} active={index === 0}>
                    {rule.name}
                  </IconPill>
                ))}
              </div>
            </div>

            <div className="rounded-card bg-canvas-50 p-4 shadow-ring">
              <p className="text-sm font-medium">本次会调用</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-ink-600">
                <li>• 人设定位：考研陪伴型学姐</li>
                <li>• 高频观点：学习计划必须能落地</li>
                <li>• 禁用表达：宝子们、干货满满、狠狠收藏</li>
                <li>• 平台规则：小红书短段落、强场景、轻转化</li>
              </ul>
            </div>

            <Link
              href="/calibrate"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-button bg-calibrate-500 px-5 text-sm font-medium text-white shadow-action transition-[background-color,transform] duration-150 ease-out active:scale-[0.96] [@media(hover:hover)]:hover:bg-calibrate-600"
            >
              生成并进入校准
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
