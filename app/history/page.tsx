"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionTitle } from "@/components/ui";
import { historyTasks, personas } from "@/lib/data";

export default function HistoryPage() {
  const [filterCreator, setFilterCreator] = useState("all");

  const filteredTasks = historyTasks.filter((task) => {
    if (filterCreator === "all") return true;
    if (filterCreator === "none") return task.persona === "无画像";
    return task.persona === filterCreator;
  });

  return (
    <AppShell
      eyebrow="历史"
      title="每一次拆解和写回都可追踪"
      description="历史页记录源视频、使用的创作者画像、输出平台、反馈状态，以及这条内容是否已经沉淀到资产库。"
    >
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <span className="text-xs font-medium text-ink-500">按创作者筛选：</span>
        <button
          onClick={() => setFilterCreator("all")}
          className={`rounded-tag border px-3 py-1.5 text-xs font-medium transition-colors ${
            filterCreator === "all" ? "border-seal-500 bg-seal-50 text-seal-600" : "border-paper-200 bg-paper-50 text-ink-600 hover:bg-paper-0"
          }`}
        >
          全部
        </button>
        {personas.map((p) => (
          <button
            key={p.id}
            onClick={() => setFilterCreator(p.name)}
            className={`rounded-tag border px-3 py-1.5 text-xs font-medium transition-colors ${
              filterCreator === p.name ? "border-seal-500 bg-seal-50 text-seal-600" : "border-paper-200 bg-paper-50 text-ink-600 hover:bg-paper-0"
            }`}
          >
            {p.name}
          </button>
        ))}
        <button
          onClick={() => setFilterCreator("none")}
          className={`rounded-tag border px-3 py-1.5 text-xs font-medium transition-colors ${
            filterCreator === "none" ? "border-seal-500 bg-seal-50 text-seal-600" : "border-paper-200 bg-paper-50 text-ink-600 hover:bg-paper-0"
          }`}
        >
          无画像
        </button>
      </div>

      <SectionTitle title="任务记录" description="点击可查看详情，继续编辑、反馈或写回画像。" />

      {filteredTasks.length === 0 ? (
        <div className="rounded-card border border-paper-200 bg-paper-0 p-12 text-center shadow-sheet">
          <Clock3 className="mx-auto size-8 text-ink-300" />
          <p className="mt-3 text-sm text-ink-500">暂无匹配的任务记录</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-paper-200 bg-paper-0 shadow-sheet">
          <div className="hidden grid-cols-[1.1fr_0.65fr_0.7fr_0.55fr_0.6fr_44px] gap-4 border-b border-paper-200 bg-paper-100 px-5 py-3 text-xs font-medium text-ink-600 md:grid">
            <span>源文件 / 标题</span>
            <span>创作者画像</span>
            <span>输出平台</span>
            <span>状态</span>
            <span>更新时间</span>
            <span className="sr-only">打开</span>
          </div>
          {filteredTasks.map((task) => (
            <Link
              key={task.id}
              href={`/history/${task.id}`}
              className="grid gap-2 border-b border-paper-200 px-5 py-4 text-sm transition-[background-color,transform] duration-300 last:border-b-0 active:scale-[0.99] hover:bg-paper-50 md:grid-cols-[1.1fr_0.65fr_0.7fr_0.55fr_0.6fr_44px] md:items-center md:gap-4"
            >
              <span>
                <span className="block font-medium text-ink-950">{task.title}</span>
                <span className="mt-1 block text-xs text-ink-400">{task.source}</span>
              </span>
              <span className="text-ink-800">{task.persona}</span>
              <span className="text-xs text-ink-600">{task.platforms.join(" / ")}</span>
              <span className="inline-flex w-max items-center gap-1.5 rounded-tag bg-paper-50 px-2.5 py-1 text-xs text-ink-800">
                {task.deposited ? (
                  <CheckCircle2 className="size-3.5 text-sage-500" />
                ) : (
                  <Clock3 className="size-3.5 text-amber-500" />
                )}
                {task.deposited ? "已沉淀" : task.status}
              </span>
              <span className="text-xs text-ink-400">{task.updatedAt}</span>
              <ArrowRight className="size-4 text-ink-400" />
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
