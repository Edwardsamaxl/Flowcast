import { Copy, MessageSquareText, RefreshCcw, Save, UploadCloud } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionTitle } from "@/components/ui";
import { generatedDraft, personas, platformRules, sourceVideos } from "@/lib/data";

export default function CreatePage() {
  return (
    <AppShell
      eyebrow="拆解内容"
      title="把一条视频拆成多平台文字内容"
      description="选择视频、人物画像和发布平台后生成可编辑稿件。默认不沉淀进资产库，用户可手动选择写入当前人物。"
      actionLabel="导入内容"
    >
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="space-y-6">
          <div className="rounded-card border border-paper-200 bg-paper-0 p-2 shadow-sheet">
            <div className="rounded-[8px] bg-paper-0 p-5">
              <SectionTitle
                kicker="视频输入"
                title="上传或选择一条视频"
                description="左侧负责转写、解析和提取内容片段；右侧负责人物、平台、生成稿件和反馈。"
              />
              <button className="mt-4 flex min-h-32 w-full flex-col items-center justify-center rounded-card border border-dashed border-paper-200 bg-paper-50 px-4 text-center transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] [@media(hover:hover)]:hover:bg-paper-0">
                <UploadCloud className="size-7 text-seal-500" aria-hidden="true" />
                <span className="mt-3 text-sm font-medium">拖入本地视频或选择已有源文件</span>
                <span className="mt-1 text-xs text-ink-400">本次拆解默认不会写入人物资产库</span>
              </button>
            </div>
          </div>

          <section className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
            <SectionTitle title="内容解析" />
            <div className="space-y-3">
              {sourceVideos.slice(0, 2).map((item, index) => (
                <label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-card border border-paper-200 bg-paper-50 p-4 transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] [@media(hover:hover)]:hover:bg-paper-0">
                  <input type="radio" name="source-video" defaultChecked={index === 0} className="mt-1 accent-seal-500" />
                  <span>
                    <span className="block text-sm font-medium text-ink-950">{item.title}</span>
                    <span className="mt-1 block text-xs text-ink-400">{item.status} / {item.duration}</span>
                    <span className="mt-3 block text-sm leading-6 text-ink-600">{item.excerpt}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </section>

        <section className="space-y-6">
          <div className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
            <SectionTitle title="生成配置" description="人物可以为“无画像”。MVP 当前只有一个默认人物，但保留下拉和新建入口。" />
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="text-xs font-medium text-ink-600">人物画像</span>
                <select className="mt-2 h-10 w-full rounded-button border border-paper-200 bg-paper-0 px-3 text-sm text-ink-800 outline-none focus-visible:border-seal-500">
                  <option>无画像</option>
                  {personas.map((persona) => (
                    <option key={persona.id}>{persona.name}</option>
                  ))}
                  <option>新建人物...</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-ink-600">发布平台</span>
                <select className="mt-2 h-10 w-full rounded-button border border-paper-200 bg-paper-0 px-3 text-sm text-ink-800 outline-none focus-visible:border-seal-500">
                  {Object.values(platformRules).map((rule) => (
                    <option key={rule.name}>{rule.name}</option>
                  ))}
                </select>
              </label>
              <div>
                <span className="text-xs font-medium text-ink-600">资产沉淀</span>
                <button className="mt-2 inline-flex min-h-10 w-full items-center justify-center rounded-button border border-paper-200 bg-paper-0 px-3 text-sm font-medium text-ink-800 transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] [@media(hover:hover)]:hover:bg-paper-50">
                  默认不沉淀
                </button>
              </div>
            </div>
          </div>

          <section className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <SectionTitle kicker={generatedDraft.platform} title={generatedDraft.title} />
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex min-h-9 items-center gap-1.5 rounded-button border border-paper-200 bg-paper-0 px-3 text-xs font-medium text-ink-800">
                  <Save className="size-3.5" aria-hidden="true" />
                  保存草稿
                </button>
                <button className="inline-flex min-h-9 items-center gap-1.5 rounded-button border border-paper-200 bg-paper-0 px-3 text-xs font-medium text-ink-800">
                  <Copy className="size-3.5" aria-hidden="true" />
                  复制
                </button>
                <button className="inline-flex min-h-9 items-center gap-1.5 rounded-button border border-paper-200 bg-paper-0 px-3 text-xs font-medium text-ink-800">
                  <RefreshCcw className="size-3.5" aria-hidden="true" />
                  重新生成
                </button>
              </div>
            </div>
            <textarea
              className="mt-4 min-h-[320px] w-full resize-none rounded-card border border-paper-200 bg-paper-50 p-4 text-[15px] leading-7 text-ink-800 outline-none focus-visible:border-seal-500 focus-visible:ring-2 focus-visible:ring-seal-500/20"
              defaultValue={generatedDraft.body}
            />
            <div className="mt-4 rounded-card border border-amber-500/30 bg-paper-50 p-4">
              <p className="text-sm font-medium text-ink-950">是否沉淀到当前人物资产库？</p>
              <p className="mt-1 text-sm leading-6 text-ink-600">默认关闭。只有当这条视频能代表该人物长期观点、案例或写法时，再手动沉淀。</p>
              <button className="mt-3 inline-flex min-h-10 items-center rounded-button bg-seal-500 px-4 text-sm font-medium text-paper-0 shadow-action">
                沉淀到当前人物资产库
              </button>
            </div>
          </section>

          <section className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
            <div className="flex items-center gap-2">
              <MessageSquareText className="size-4 text-seal-500" aria-hidden="true" />
              <h2 className="font-editorial text-[24px] font-semibold">对话反馈</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["太 AI 味了", "不像我", "太长了", "太营销了", "语气不对"].map((tag) => (
                <button key={tag} className="rounded-tag border border-paper-200 bg-paper-50 px-2.5 py-1 text-xs text-ink-800">
                  {tag}
                </button>
              ))}
            </div>
            <label className="mt-4 block">
              <span className="text-xs font-medium text-ink-600">自然语言反馈</span>
              <textarea
                className="mt-2 min-h-24 w-full resize-none rounded-card border border-paper-200 bg-paper-50 p-3 text-sm leading-6 outline-none focus-visible:border-seal-500"
                placeholder="例如：标题再克制一点，保留观点，但换成知乎长文结构。"
              />
            </label>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-card bg-paper-50 p-3">
              <span className="text-sm text-ink-600">本次反馈默认只影响当前稿件</span>
              <button className="rounded-button border border-paper-200 bg-paper-0 px-3 py-2 text-xs font-medium text-ink-800">
                写回人物画像
              </button>
            </div>
          </section>
        </section>
      </div>
    </AppShell>
  );
}
