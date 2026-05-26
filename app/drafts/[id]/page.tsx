import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TextareaBlock } from "@/components/ui";
import { generatedDraft, historyTasks } from "@/lib/data";

export default function DraftDetailPage({ params }: { params: { id: string } }) {
  const task = historyTasks.find((item) => item.id === params.id) ?? historyTasks[0];

  return (
    <AppShell eyebrow="历史详情" title={task.title} description="旧草稿详情路由保留为历史详情兼容入口。">
      <Link href="/history" className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-button border border-paper-200 bg-paper-0 px-3 text-sm font-medium text-ink-800 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]">
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回历史
      </Link>
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
          <p className="text-sm font-medium text-ink-950">任务信息</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-ink-400">人物画像</dt>
              <dd className="mt-1 font-medium">{task.persona}</dd>
            </div>
            <div>
              <dt className="text-ink-400">来源</dt>
              <dd className="mt-1 font-medium">{task.source}</dd>
            </div>
            <div>
              <dt className="text-ink-400">是否沉淀</dt>
              <dd className="mt-1 font-medium">{task.deposited ? "已沉淀到资产库" : "未沉淀"}</dd>
            </div>
          </dl>
        </aside>
        <section className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
          <TextareaBlock label="生成稿件" value={generatedDraft.body} rows={16} />
        </section>
      </div>
    </AppShell>
  );
}
