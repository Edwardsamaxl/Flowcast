import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TextareaBlock } from "@/components/ui";
import { draftList, generatedDraft } from "@/lib/data";

export default function DraftDetailPage({ params }: { params: { id: string } }) {
  const draft = draftList.find((item) => item.id === params.id) ?? draftList[0];

  return (
    <AppShell eyebrow="草稿详情" title={draft.title} description="这是草稿详情骨架，后续可与编辑校准页共用同一数据源。">
      <Link href="/drafts" className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-button bg-surface-0 px-3 text-sm shadow-ring transition-transform duration-150 ease-out active:scale-[0.96]">
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回草稿列表
      </Link>
      <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <aside className="rounded-card bg-surface-0 p-5 shadow-ring">
          <p className="text-sm font-medium">草稿信息</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-ink-400">平台</dt>
              <dd className="mt-1 font-medium">{draft.platform}</dd>
            </div>
            <div>
              <dt className="text-ink-400">来源</dt>
              <dd className="mt-1 font-medium">{draft.source}</dd>
            </div>
            <div>
              <dt className="text-ink-400">反馈标签</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {(draft.feedbackTags.length ? draft.feedbackTags : ["暂无反馈"]).map((tag) => (
                  <span key={tag} className="rounded-tag bg-calibrate-50 px-2.5 py-1 text-xs text-calibrate-600">{tag}</span>
                ))}
              </dd>
            </div>
          </dl>
        </aside>
        <section className="rounded-card bg-surface-0 p-5 shadow-editor">
          <TextareaBlock label="编辑后内容" value={generatedDraft.body} rows={16} />
        </section>
      </div>
    </AppShell>
  );
}
