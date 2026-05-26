import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionTitle } from "@/components/ui";
import { historyTasks } from "@/lib/data";

export default function HistoryPage() {
  return (
    <AppShell
      eyebrow="历史"
      title="每一次拆解和写回都可追踪"
      description="历史页记录源视频、使用的人物画像、输出平台、反馈状态，以及这条内容是否已经沉淀到资产库。"
    >
      <SectionTitle title="任务记录" description="当前列表先展示 MVP 所需字段，后续可进入详情继续编辑、反馈或写回画像。" />
      <div className="overflow-hidden rounded-card border border-paper-200 bg-paper-0 shadow-sheet">
        <div className="hidden grid-cols-[1.1fr_0.65fr_0.7fr_0.55fr_0.6fr_44px] gap-4 border-b border-paper-200 bg-paper-100 px-5 py-3 text-xs font-medium text-ink-600 md:grid">
          <span>源文件 / 标题</span>
          <span>人物画像</span>
          <span>输出平台</span>
          <span>状态</span>
          <span>更新时间</span>
          <span className="sr-only">打开</span>
        </div>
        {historyTasks.map((task) => (
          <Link
            key={task.id}
            href={`/history/${task.id}`}
            className="grid gap-2 border-b border-paper-200 px-5 py-4 text-sm transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] last:border-b-0 active:scale-[0.99] [@media(hover:hover)]:hover:bg-paper-50 md:grid-cols-[1.1fr_0.65fr_0.7fr_0.55fr_0.6fr_44px] md:items-center md:gap-4"
          >
            <span>
              <span className="block font-medium text-ink-950">{task.title}</span>
              <span className="mt-1 block text-xs text-ink-400">{task.source}</span>
            </span>
            <span className="text-ink-800">{task.persona}</span>
            <span>{task.platforms.join(" / ")}</span>
            <span className="inline-flex w-max items-center gap-1.5 rounded-tag bg-paper-50 px-2.5 py-1 text-xs text-ink-800">
              {task.deposited ? <CheckCircle2 className="size-3.5 text-sage-500" aria-hidden="true" /> : <Clock3 className="size-3.5 text-amber-500" aria-hidden="true" />}
              {task.deposited ? "已沉淀" : task.status}
            </span>
            <span className="text-xs text-ink-400">{task.updatedAt}</span>
            <ArrowRight className="size-4 text-ink-400" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
