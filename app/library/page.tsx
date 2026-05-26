import { CheckCircle2, FileText, UploadCloud } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionTitle } from "@/components/ui";
import { VoiceProfile } from "@/components/voice-profile";
import { platformRules, sourceVideos } from "@/lib/data";

export default function LibraryPage() {
  return (
    <AppShell
      eyebrow="资产库"
      title="管理当前在记录谁的声纹"
      description="上传视频后先解析，不自动写入人物画像。用户确认候选观点、语气和结构后，才会更新当前人物档案。"
      actionLabel="上传到资产库"
    >
      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <section className="space-y-6">
          <div className="rounded-card border border-paper-200 bg-paper-0 p-2 shadow-sheet">
            <div className="rounded-[8px] bg-paper-0 p-5">
              <SectionTitle
                kicker="源文件"
                title="上传视频并解析为画像候选"
                description="这里的上传目的，是建立或更新某个人物的长期表达资产。默认只解析，等待用户确认写入。"
              />
              <button className="mt-4 flex min-h-36 w-full flex-col items-center justify-center rounded-card border border-dashed border-paper-200 bg-paper-50 px-4 text-center transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] [@media(hover:hover)]:hover:bg-paper-0">
                <UploadCloud className="size-7 text-seal-500" aria-hidden="true" />
                <span className="mt-3 text-sm font-medium">拖入视频或点击上传</span>
                <span className="mt-1 text-xs text-ink-400">上传后进入转写和解析，不会自动写入画像</span>
              </button>
            </div>
          </div>

          <div>
            <SectionTitle title="源文件列表" description="点击源文件可查看转写文本和可写入候选项。" />
            <div className="space-y-3">
              {sourceVideos.map((item) => (
                <article key={item.id} className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-ink-950">{item.title}</h2>
                      <p className="mt-1 text-xs text-ink-400">{item.source} / {item.duration}</p>
                    </div>
                    <span className="rounded-tag bg-seal-50 px-2.5 py-1 text-xs font-medium text-seal-600">{item.libraryState}</span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-ink-600">{item.excerpt}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.candidates.map((signal) => (
                      <span key={signal} className="rounded-tag bg-paper-50 px-2.5 py-1 text-xs text-ink-800">
                        {signal}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button className="inline-flex min-h-10 items-center gap-2 rounded-button border border-paper-200 bg-paper-0 px-4 text-sm font-medium text-ink-800 transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] [@media(hover:hover)]:hover:bg-paper-50">
                      <FileText className="size-4" aria-hidden="true" />
                      预览可写入内容
                    </button>
                    <button className="inline-flex min-h-10 items-center gap-2 rounded-button bg-seal-500 px-4 text-sm font-medium text-paper-0 shadow-action transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] [@media(hover:hover)]:hover:bg-seal-600">
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                      写入当前人物画像
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <VoiceProfile />

          <section className="rounded-card border border-paper-200 bg-paper-0 p-6 shadow-sheet">
            <SectionTitle title="平台写法规则" description="规则可编辑，生成时与人物画像一起调用。" />
            <div className="mt-4 grid gap-3">
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
        </aside>
      </div>
    </AppShell>
  );
}
