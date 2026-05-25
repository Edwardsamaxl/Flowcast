import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionTitle } from "@/components/ui";
import { draftList } from "@/lib/data";

export default function DraftsPage() {
  return (
    <AppShell
      eyebrow="草稿"
      title="历史生成内容"
      description="草稿列表用于追踪每次生成、编辑状态和反馈标签，后续接 GeneratedDraft 表。"
    >
      <SectionTitle title="草稿列表" />
      <div className="overflow-hidden rounded-card bg-surface-0 shadow-editor">
        <div className="hidden grid-cols-[1.2fr_0.55fr_0.75fr_0.7fr_44px] gap-4 border-b border-line-200 bg-canvas-100 px-5 py-3 text-xs font-medium text-ink-600 md:grid">
          <span>标题</span>
          <span>平台</span>
          <span>状态</span>
          <span>时间</span>
          <span className="sr-only">打开</span>
        </div>
        {draftList.map((draft) => (
          <Link
            key={draft.id}
            href={`/drafts/${draft.id}`}
            className="grid gap-2 border-b border-line-200 px-5 py-4 text-sm transition-[background-color,transform] duration-150 ease-out last:border-b-0 active:scale-[0.99] [@media(hover:hover)]:hover:bg-surface-50 md:grid-cols-[1.2fr_0.55fr_0.75fr_0.7fr_44px] md:items-center md:gap-4"
          >
            <span>
              <span className="block font-medium">{draft.title}</span>
              <span className="mt-1 block text-xs text-ink-400">{draft.source}</span>
            </span>
            <span>{draft.platform}</span>
            <span>{draft.status}</span>
            <span className="text-xs text-ink-400">{draft.createdAt}</span>
            <ArrowRight className="size-4 text-ink-400" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
