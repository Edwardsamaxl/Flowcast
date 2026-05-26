"use client";

import { useState } from "react";
import {
  Copy, MessageSquareText, RefreshCcw, Save, UploadCloud,
  FileText, ArrowRight, Check, ChevronRight, Eye, Pencil,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionTitle } from "@/components/ui";
import { personas, sourceVideos, generatedDraft, platformOptions, feedbackTagOptions } from "@/lib/data";

type WorkMode = "parse" | "profile" | "drafts" | "feedback";

export default function CreatePage() {
  // Workflow mode
  const [mode, setMode] = useState<WorkMode>("parse");

  // Selected source video (mock)
  const [selectedVideoId, setSelectedVideoId] = useState(sourceVideos[0].id);
  const selectedVideo = sourceVideos.find((v) => v.id === selectedVideoId) || sourceVideos[0];

  // Config
  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(["xiaohongshu"]));

  // Drafts state
  const [draftContent, setDraftContent] = useState(generatedDraft.body);
  const [activePlatform, setActivePlatform] = useState("小红书");

  // Profile changes (mock)
  const [profileChanges, setProfileChanges] = useState({
    additions: [
      { field: "高频观点", value: "稳定执行优先于极限方法" },
      { field: "常用案例", value: "低状态学习日" },
      { field: "常用结构", value: "先承认问题普遍性，再给具体方法" },
    ],
    modifications: [
      { field: "语气特征", from: "有经验感", to: "更有经验感，增加具体数据支撑" },
    ],
    ignore: [
      "本次视频中的临时表达「今天状态不好」不应进入长期画像",
    ],
  });

  // Feedback state
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackTags, setFeedbackTags] = useState<Set<string>>(new Set());

  const togglePlatform = (key: string) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleFeedbackTag = (tag: string) => {
    setFeedbackTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  return (
    <AppShell
      eyebrow="流转工作台"
      title="把一条内容流转成多平台文字稿件"
      description="上传内容、转写解析、选择画像和平台后生成可编辑稿件。默认不沉淀进资产库，用户可手动选择写入当前创作者画像。"
    >
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        {/* ====== Left Column: Content Input & Parse ====== */}
        <section className="space-y-6">
          {/* Upload Area */}
          <div className="rounded-card border border-paper-200 bg-paper-0 p-2 shadow-sheet">
            <div className="rounded-[8px] bg-paper-0 p-5">
              <SectionTitle
                kicker="内容输入"
                title="上传或选择一条内容"
                description="左侧负责转写、解析和提取内容片段；右侧负责配置、生成和反馈。"
              />
              <button className="mt-4 flex min-h-32 w-full flex-col items-center justify-center rounded-card border border-dashed border-paper-200 bg-paper-50 px-4 text-center transition-[background-color,transform] duration-300 active:scale-[0.98] hover:bg-paper-0">
                <UploadCloud className="size-7 text-seal-500" />
                <span className="mt-3 text-sm font-medium">拖入本地视频或选择已有源文件</span>
                <span className="mt-1 text-xs text-ink-400">本次拆解默认不会写入创作者资产</span>
              </button>
            </div>
          </div>

          {/* Source Video Selection (mock data) */}
          <section className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
            <SectionTitle title="已有素材" description="选择之前上传的素材继续流转。" />
            <div className="space-y-3">
              {sourceVideos.map((item) => (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-card border p-4 transition-colors ${
                    selectedVideoId === item.id
                      ? "border-seal-500 bg-seal-50"
                      : "border-paper-200 bg-paper-50 hover:bg-paper-0"
                  }`}
                >
                  <input
                    type="radio"
                    name="source-video"
                    checked={selectedVideoId === item.id}
                    onChange={() => setSelectedVideoId(item.id)}
                    className="mt-1 accent-seal-500"
                  />
                  <span>
                    <span className="block text-sm font-medium text-ink-950">{item.title}</span>
                    <span className="mt-1 block text-xs text-ink-400">{item.status} / {item.duration}</span>
                    <span className="mt-3 block text-sm leading-6 text-ink-600">{item.excerpt}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Parse Result (shown when mode >= parse) */}
          <section className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
            <SectionTitle title="内容解析" description="系统从视频中提取的观点、案例和金句。" />
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-ink-400">核心观点</p>
                <ul className="mt-2 space-y-2">
                  {"corePoints" in selectedVideo && (selectedVideo.corePoints as Array<{point: string; evidence: string}>).map((cp, i) => (
                    <li key={i} className="flex gap-2 text-sm text-ink-800">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-seal-500" />
                      <span><span className="font-medium">{cp.point}</span> — {cp.evidence}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-medium text-ink-400">可沉淀画像候选</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedVideo.candidates.map((c) => (
                    <span key={c} className="rounded-tag bg-seal-50 px-2.5 py-1 text-xs font-medium text-seal-600">{c}</span>
                  ))}
                </div>
              </div>

              {/* Transcript preview */}
              {"transcriptText" in selectedVideo && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-medium text-ink-400 hover:text-ink-600">
                    查看转写全文
                  </summary>
                  <p className="mt-2 max-h-48 overflow-y-auto rounded-card border border-paper-200 bg-paper-50 p-4 text-sm leading-7 text-ink-700 whitespace-pre-line">
                    {selectedVideo.transcriptText as string}
                  </p>
                </details>
              )}
            </div>
          </section>
        </section>

        {/* ====== Right Column: Config / Profile / Drafts / Feedback ====== */}
        <section className="space-y-6">
          {/* Config Bar (always visible) */}
          <div className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
            <SectionTitle title="流转配置" description="选择创作者画像和目标平台。默认不沉淀，需手动确认。" />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-ink-600">创作者画像</span>
                <select
                  className="mt-2 h-10 w-full rounded-button border border-paper-200 bg-paper-0 px-3 text-sm text-ink-800 outline-none focus-visible:border-seal-500"
                  value={selectedPersonaId}
                  onChange={(e) => setSelectedPersonaId(e.target.value)}
                >
                  <option value="">无画像</option>
                  {personas.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>
              <div>
                <span className="text-xs font-medium text-ink-600">资产沉淀</span>
                <p className="mt-2 text-sm text-ink-400">默认不沉淀到创作者画像</p>
              </div>
            </div>

            {/* Platform multi-select */}
            <div className="mt-4">
              <p className="text-xs font-medium text-ink-600">目标平台（多选）</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {platformOptions.map((p) => {
                  const sel = selectedPlatforms.has(p.key);
                  return (
                    <button
                      key={p.key}
                      onClick={() => togglePlatform(p.key)}
                      className={`rounded-tag border px-3 py-1.5 text-xs font-medium transition-colors ${
                        sel
                          ? "border-seal-500 bg-seal-50 text-seal-600"
                          : "border-paper-200 bg-paper-50 text-ink-600 hover:bg-paper-0"
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ====== Work Mode Tabs ====== */}
          <div className="flex gap-1 rounded-card border border-paper-200 bg-paper-50 p-1">
            {([
              ["parse", "上传与解析"],
              ["profile", "画像更新确认"],
              ["drafts", "稿件"],
              ["feedback", "反馈"],
            ] as [WorkMode, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`flex-1 rounded-button py-2 text-xs font-medium transition-colors ${
                  mode === key
                    ? "bg-paper-0 text-ink-950 shadow-hairline"
                    : "text-ink-500 hover:text-ink-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ====== Mode 1: Upload & Parse (summary view) ====== */}
          {mode === "parse" && (
            <div className="rounded-card border border-paper-200 bg-paper-0 p-6 shadow-sheet text-center">
              <Eye className="mx-auto size-8 text-ink-300" />
              <p className="mt-3 text-sm text-ink-500">转写与解析结果已在左侧展示</p>
              <p className="mt-1 text-xs text-ink-400">切换到「画像更新确认」查看本次内容如何影响创作者画像</p>
              <button
                onClick={() => setMode("profile")}
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-button bg-seal-500 px-4 text-sm font-medium text-paper-0 shadow-action"
              >
                查看画像变化
                <ArrowRight className="size-4" />
              </button>
            </div>
          )}

          {/* ====== Mode 2: Profile Update Confirmation ====== */}
          {mode === "profile" && (
            <div className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
              <SectionTitle
                title="画像更新确认"
                description="本次内容对当前创作者画像的建议变化。请逐一确认哪些写入长期画像。"
              />

              {/* Additions */}
              <div className="mt-4">
                <p className="text-xs font-medium text-sage-600">将新增</p>
                <div className="mt-2 space-y-2">
                  {profileChanges.additions.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-card border border-sage-100 bg-[#f6f8f3] p-3">
                      <span className="mt-0.5 rounded bg-sage-100 px-1.5 py-0.5 text-[10px] font-medium text-sage-600">{item.field}</span>
                      <span className="flex-1 text-sm text-ink-800">{item.value}</span>
                      <div className="flex gap-1">
                        <button className="rounded-button border border-sage-200 bg-paper-0 px-2 py-1 text-[10px] font-medium text-sage-600 hover:bg-sage-50">
                          <Check className="size-3 inline mr-0.5" />接受
                        </button>
                        <button className="rounded-button border border-paper-200 bg-paper-0 px-2 py-1 text-[10px] font-medium text-ink-400 hover:bg-paper-50">忽略</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modifications */}
              <div className="mt-4">
                <p className="text-xs font-medium text-amber-600">将修改</p>
                <div className="mt-2 space-y-2">
                  {profileChanges.modifications.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-card border border-amber-100 bg-[#fefcf5] p-3">
                      <span className="mt-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">{item.field}</span>
                      <span className="flex-1 text-sm text-ink-800">
                        <span className="line-through text-ink-400 mr-1">{item.from}</span>
                        <ArrowRight className="size-3 inline mx-0.5 text-ink-400" />
                        <span>{item.to}</span>
                      </span>
                      <div className="flex gap-1">
                        <button className="rounded-button border border-amber-200 bg-paper-0 px-2 py-1 text-[10px] font-medium text-amber-600 hover:bg-amber-50">
                          <Check className="size-3 inline mr-0.5" />接受
                        </button>
                        <button className="rounded-button border border-paper-200 bg-paper-0 px-2 py-1 text-[10px] font-medium text-ink-400 hover:bg-paper-50">忽略</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Ignore */}
              <div className="mt-4">
                <p className="text-xs font-medium text-ink-400">建议忽略</p>
                <div className="mt-2 space-y-2">
                  {profileChanges.ignore.map((item, i) => (
                    <div key={i} className="rounded-card border border-paper-200 bg-paper-50 p-3 text-sm text-ink-500">{item}</div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex flex-wrap gap-3 border-t border-paper-200 pt-4">
                <button className="inline-flex min-h-10 items-center gap-2 rounded-button bg-seal-500 px-4 text-sm font-medium text-paper-0 shadow-action">
                  <Check className="size-4" />
                  确认写入创作者画像
                </button>
                <button className="inline-flex min-h-10 items-center gap-2 rounded-button border border-paper-200 bg-paper-0 px-4 text-sm font-medium text-ink-800 hover:bg-paper-50">
                  不写入，仅用于本次任务
                </button>
              </div>
            </div>
          )}

          {/* ====== Mode 3: Drafts ====== */}
          {mode === "drafts" && (
            <>
              {/* Platform tab switching */}
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedPlatforms).map((key) => {
                  const meta = platformOptions.find((p) => p.key === key);
                  const active = activePlatform === (meta?.name || key);
                  return (
                    <button
                      key={key}
                      onClick={() => setActivePlatform(meta?.name || key)}
                      className={`rounded-tag border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "border-seal-500 bg-seal-50 text-seal-600"
                          : "border-paper-200 bg-paper-50 text-ink-600 hover:bg-paper-0"
                      }`}
                    >
                      {meta?.name || key}
                    </button>
                  );
                })}
              </div>

              <section className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <SectionTitle kicker={activePlatform} title={generatedDraft.title} />
                  <div className="flex flex-wrap gap-2">
                    <button className="inline-flex min-h-9 items-center gap-1.5 rounded-button border border-paper-200 bg-paper-0 px-3 text-xs font-medium text-ink-800 hover:bg-paper-50">
                      <Save className="size-3.5" />
                      保存草稿
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(draftContent)}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-button border border-paper-200 bg-paper-0 px-3 text-xs font-medium text-ink-800 hover:bg-paper-50"
                    >
                      <Copy className="size-3.5" />
                      复制
                    </button>
                    <button className="inline-flex min-h-9 items-center gap-1.5 rounded-button border border-paper-200 bg-paper-0 px-3 text-xs font-medium text-ink-800 hover:bg-paper-50">
                      <RefreshCcw className="size-3.5" />
                      重新生成
                    </button>
                  </div>
                </div>
                <textarea
                  className="mt-4 min-h-[320px] w-full resize-none rounded-card border border-paper-200 bg-paper-50 p-4 text-[15px] leading-7 text-ink-800 outline-none focus-visible:border-seal-500 focus-visible:ring-2 focus-visible:ring-seal-500/20"
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                />
                <div className="mt-4 rounded-card border border-amber-500/30 bg-paper-50 p-4">
                  <p className="text-sm font-medium text-ink-950">是否沉淀到当前创作者资产库？</p>
                  <p className="mt-1 text-sm leading-6 text-ink-600">默认关闭。只有当这条内容能代表该创作者长期观点、案例或写法时，再手动沉淀。</p>
                  <button className="mt-3 inline-flex min-h-10 items-center rounded-button bg-seal-500 px-4 text-sm font-medium text-paper-0 shadow-action">
                    沉淀到当前创作者资产库
                  </button>
                </div>
              </section>
            </>
          )}

          {/* ====== Mode 4: Feedback ====== */}
          {mode === "feedback" && (
            <section className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
              <div className="flex items-center gap-2">
                <MessageSquareText className="size-4 text-seal-500" />
                <h2 className="font-editorial text-[24px] font-semibold">对话反馈</h2>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {feedbackTagOptions.map((tag) => {
                  const active = feedbackTags.has(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleFeedbackTag(tag)}
                      className={`rounded-tag border px-2.5 py-1 text-xs transition-colors ${
                        active
                          ? "border-seal-500 bg-seal-50 text-seal-600"
                          : "border-paper-200 bg-paper-50 text-ink-600 hover:bg-paper-0"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              <label className="mt-4 block">
                <span className="text-xs font-medium text-ink-600">自然语言反馈</span>
                <textarea
                  className="mt-2 min-h-24 w-full resize-none rounded-card border border-paper-200 bg-paper-50 p-3 text-sm leading-6 outline-none focus-visible:border-seal-500"
                  placeholder="例如：标题再克制一点，保留观点，但换成知乎长文结构。这段太像营销号，把语气压低一点。"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </label>

              {/* Generated draft notes (mock) */}
              <div className="mt-4 rounded-card border border-sage-100 bg-[#f6f8f3] p-4">
                <p className="text-xs font-medium text-sage-600">当前稿件备注</p>
                <ul className="mt-2 space-y-1 text-xs text-ink-600">
                  {generatedDraft.notes.map((note, i) => (
                    <li key={i}>- {note}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 rounded-card bg-paper-50 p-3">
                <span className="text-sm text-ink-600">本次反馈默认只影响当前稿件</span>
                <button className="rounded-button border border-paper-200 bg-paper-0 px-3 py-2 text-xs font-medium text-ink-800 hover:bg-paper-50">
                  写回创作者画像
                </button>
              </div>
            </section>
          )}
        </section>
      </div>
    </AppShell>
  );
}
