"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, Video } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionTitle } from "@/components/ui";
import { useAssets } from "@/lib/hooks/use-assets";
import { useCreators } from "@/lib/hooks/use-creators";

export default function HistoryPage() {
  const { assets, loading } = useAssets();
  const { creators } = useCreators();
  const [filterCreator, setFilterCreator] = useState("all");

  const creatorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of creators) map.set(c.id, c.name);
    return map;
  }, [creators]);

  const filteredAssets = useMemo(() => {
    if (filterCreator === "all") return assets;
    if (filterCreator === "none") return assets.filter((a) => !a.creatorId);
    return assets.filter((a) => a.creatorId === filterCreator);
  }, [assets, filterCreator]);

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      uploaded: "已上传",
      extracting_audio: "提取音频中",
      transcribing: "转写中",
      transcribed: "已转写",
      analyzing: "分析中",
      analyzed: "已解析",
      failed: "失败",
    };
    return map[status] || status;
  };

  return (
    <AppShell
      eyebrow="历史"
      title="已上传的素材"
      description="历史页记录所有已上传的视频素材，点击可进入流转工作台继续处理"
    >
      {/* Creator Filter */}
      <div className="mb-6">
        <label htmlFor="creator-filter" className="text-xs font-medium text-ink-500">
          按创作者筛选
        </label>
        <select
          id="creator-filter"
          value={filterCreator}
          onChange={(e) => setFilterCreator(e.target.value)}
          className="mt-2 block w-full max-w-xs rounded-button border border-paper-200 bg-paper-0 px-3 py-2 text-sm text-ink-800 outline-none transition-[border-color,box-shadow] duration-200 focus-visible:border-seal-500 focus-visible:ring-2 focus-visible:ring-seal-500/20"
        >
          <option value="all">全部</option>
          {creators.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="none">无画像</option>
        </select>
      </div>

      <SectionTitle
        title="素材列表"
        description="点击可进入流转工作台，继续生成平台稿件或进行画像更新确认"
      />

      {loading ? (
        <div className="rounded-card border border-paper-200 bg-paper-0 p-12 text-center shadow-sheet">
          <Clock3 className="mx-auto size-8 text-ink-300 animate-spin" />
          <p className="mt-3 text-sm text-ink-500">加载中...</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="rounded-card border border-paper-200 bg-paper-0 p-12 text-center shadow-sheet">
          <Video className="mx-auto size-8 text-ink-300" />
          <p className="mt-3 text-sm text-ink-500">暂无素材记录</p>
          <p className="mt-1 text-xs text-ink-400">上传视频后，素材将出现在这里</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-paper-200 bg-paper-0 shadow-sheet">
          <div className="hidden grid-cols-[1fr_0.5fr_0.5fr_44px] gap-4 border-b border-paper-200 bg-paper-100 px-5 py-3 text-xs font-medium text-ink-600 md:grid">
            <span>视频名称</span>
            <span>创作者画像</span>
            <span>更新时间</span>
            <span className="sr-only">打开</span>
          </div>
          {filteredAssets.map((asset) => (
            <Link
              key={asset.id}
              href={`/create?assetId=${asset.id}`}
              className="grid gap-2 border-b border-paper-200 px-5 py-4 text-sm transition-[background-color,transform] duration-300 last:border-b-0 active:scale-[0.99] hover:bg-paper-50 md:grid-cols-[1fr_0.5fr_0.5fr_44px] md:items-center md:gap-4"
            >
              <span className="flex items-center gap-3">
                <Video className="size-4 text-ink-400 shrink-0" />
                <span className="font-medium text-ink-950">{asset.title}</span>
                {asset.duration && (
                  <span className="text-xs text-ink-400">{asset.duration}</span>
                )}
              </span>
              <span className="text-ink-800">
                {asset.creatorId ? creatorMap.get(asset.creatorId) || "未知画像" : "无画像"}
              </span>
              <span className="text-xs text-ink-400">
                {asset.updatedAt
                  ? new Date(asset.updatedAt * 1000).toLocaleString("zh-CN", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </span>
              <ArrowRight className="size-4 text-ink-400" />
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
