"use client";

import { useState, useRef, useCallback } from "react";
import {
  Copy, RefreshCcw, UploadCloud, ArrowRight, Check,
  Trash2, MessageSquareText, Loader2, Pencil, X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionTitle } from "@/components/ui";
import { personas, platformOptions, feedbackTagOptions, generatedDraft } from "@/lib/data";

type WorkMode = "transcript" | "profile" | "drafts";

type ProfileAddition = { field: string; value: string };
type ProfileModification = { field: string; from: string; to: string };

export default function CreatePage() {
  // ---- Upload state ----
  const [uploadedAsset, setUploadedAsset] = useState<{
    id: string; title: string; status: string;
  } | null>(null);
  const [transcriptText, setTranscriptText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Config ----
  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("xiaohongshu");

  // ---- Work mode ----
  const [mode, setMode] = useState<WorkMode>("transcript");

  // ---- Drafts state ----
  const [draftContent, setDraftContent] = useState(generatedDraft.body);
  const [draftsSaved, setDraftsSaved] = useState(false);

  // ---- Profile changes ----
  const [profileChanges, setProfileChanges] = useState<{
    additions: ProfileAddition[];
    modifications: ProfileModification[];
  }>({
    additions: [
      { field: "高频观点", value: "稳定执行优先于极限方法" },
      { field: "常用案例", value: "低状态学习日" },
      { field: "常用结构", value: "先承认问题普遍性，再给具体方法" },
    ],
    modifications: [
      { field: "语气特征", from: "有经验感", to: "更有经验感，增加具体数据支撑" },
    ],
  });

  // ---- Editing state for profile items ----
  const [editingAdditionIdx, setEditingAdditionIdx] = useState<number | null>(null);
  const [editingAdditionValue, setEditingAdditionValue] = useState("");
  const [editingModificationIdx, setEditingModificationIdx] = useState<number | null>(null);
  const [editingModTo, setEditingModTo] = useState("");

  // ---- Transcript feedback ----
  const [transcriptFeedbackText, setTranscriptFeedbackText] = useState("");
  const [transcriptFeedbackTags, setTranscriptFeedbackTags] = useState<Set<string>>(new Set());
  const [transcriptFeedbackHistory, setTranscriptFeedbackHistory] = useState<Array<{ text: string; tags: string[]; time: string }>>([]);

  // ---- Profile feedback ----
  const [profileFeedbackText, setProfileFeedbackText] = useState("");
  const [profileFeedbackTags, setProfileFeedbackTags] = useState<Set<string>>(new Set());
  const [profileFeedbackHistory, setProfileFeedbackHistory] = useState<Array<{ text: string; tags: string[]; time: string }>>([]);

  // ---- Upload handler ----
  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "video");
      formData.append("title", file.name);
      const res = await fetch("/api/assets", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const asset = await res.json();
      setUploadedAsset({ id: asset.id, title: asset.title, status: "uploaded" });

      // Mock transcription
      setIsTranscribing(true);
      await new Promise((r) => setTimeout(r, 1200));
      setTranscriptText(
        `今天聊一个很多考研同学都会踩的坑：高估自己的执行力。\n\n我见过太多同学做计划，把一天排得满满当当：早上六点起床背单词，上午刷数学，下午专业课，晚上英语真题，睡前还要复盘。这个计划看起来特别漂亮，但问题是——它是按你最理想的状态设计的。\n\n你默认自己每天都精神很好、时间完整、没有临时任务、不会累。但备考不是在理想状态里发生的。\n\n你真正要做的不是把计划排满，而是先设计一个"最差状态也能完成"的版本。比如今天只能学90分钟，那这90分钟里最不能丢的是什么？先把它保住。\n\n我一直在强调一个观点：计划能落地，比计划看起来厉害重要得多。稳定执行优先于极限方法。`
      );
      setIsTranscribing(false);
      setMode("transcript");
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  // ---- Transcript feedback (triggers re-transcription) ----
  const submitTranscriptFeedback = () => {
    if (!transcriptFeedbackText.trim() && transcriptFeedbackTags.size === 0) return;
    const fb = {
      text: transcriptFeedbackText,
      tags: Array.from(transcriptFeedbackTags),
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };
    setTranscriptFeedbackHistory((prev) => [...prev, fb]);
    setTranscriptFeedbackText("");
    setTranscriptFeedbackTags(new Set());

    // Mock LLM re-transcription based on feedback
    setIsTranscribing(true);
    setTimeout(() => {
      const tagFeedback = fb.tags.join("、");
      const allFeedback = [fb.text, tagFeedback].filter(Boolean).join("；");
      setTranscriptText((prev) =>
        prev +
        `\n\n---\n[根据反馈「${allFeedback}」重新转写]\n\n` +
        `（此处为 LLM 根据反馈重新转写后的内容。原始转写已根据「${allFeedback}」进行调整。）\n\n` +
        prev
          .split("\n")
          .slice(0, 3)
          .map((line) => line.replace(/高估/g, "重新评估").replace(/执行力/g, "执行节奏"))
          .join("\n")
      );
      setIsTranscribing(false);
    }, 1500);
  };

  const toggleTranscriptFeedbackTag = (tag: string) => {
    setTranscriptFeedbackTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  // ---- Profile item actions ----
  const acceptAddition = (i: number) => {
    setProfileChanges((prev) => ({
      ...prev,
      additions: prev.additions.filter((_, idx) => idx !== i),
    }));
  };

  const deleteAddition = (i: number) => {
    setProfileChanges((prev) => ({
      ...prev,
      additions: prev.additions.filter((_, idx) => idx !== i),
    }));
  };

  const startEditAddition = (i: number) => {
    setEditingAdditionIdx(i);
    setEditingAdditionValue(profileChanges.additions[i].value);
  };

  const saveEditAddition = () => {
    if (editingAdditionIdx === null) return;
    setProfileChanges((prev) => ({
      ...prev,
      additions: prev.additions.map((item, idx) =>
        idx === editingAdditionIdx ? { ...item, value: editingAdditionValue } : item
      ),
    }));
    setEditingAdditionIdx(null);
    setEditingAdditionValue("");
  };

  const acceptModification = (i: number) => {
    setProfileChanges((prev) => ({
      ...prev,
      modifications: prev.modifications.filter((_, idx) => idx !== i),
    }));
  };

  const deleteModification = (i: number) => {
    setProfileChanges((prev) => ({
      ...prev,
      modifications: prev.modifications.filter((_, idx) => idx !== i),
    }));
  };

  const startEditModification = (i: number) => {
    setEditingModificationIdx(i);
    setEditingModTo(profileChanges.modifications[i].to);
  };

  const saveEditModification = () => {
    if (editingModificationIdx === null) return;
    setProfileChanges((prev) => ({
      ...prev,
      modifications: prev.modifications.map((item, idx) =>
        idx === editingModificationIdx ? { ...item, to: editingModTo } : item
      ),
    }));
    setEditingModificationIdx(null);
    setEditingModTo("");
  };

  // ---- Profile feedback (triggers LLM to re-generate profile suggestions) ----
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const submitProfileFeedback = () => {
    if (!profileFeedbackText.trim() && profileFeedbackTags.size === 0) return;
    const fb = {
      text: profileFeedbackText,
      tags: Array.from(profileFeedbackTags),
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };
    setProfileFeedbackHistory((prev) => [...prev, fb]);
    setProfileFeedbackText("");
    setProfileFeedbackTags(new Set());

    // Mock LLM updating profile suggestions
    setIsUpdatingProfile(true);
    setTimeout(() => {
      setProfileChanges((prev) => ({
        additions: [
          ...prev.additions,
          { field: "语气特征", value: `根据反馈调整：${fb.text || fb.tags.join("、")}` },
        ],
        modifications: prev.modifications,
      }));
      setIsUpdatingProfile(false);
    }, 1500);
  };

  const toggleProfileFeedbackTag = (tag: string) => {
    setProfileFeedbackTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  // ---- Draft ----
  const handleDraftChange = (value: string) => {
    setDraftContent(value);
    setDraftsSaved(false);
    setTimeout(() => setDraftsSaved(true), 600);
  };

  const selectedPersona = personas.find((p) => p.id === selectedPersonaId);
  const selectedPlatformName = platformOptions.find((p) => p.key === selectedPlatform)?.name || "当前平台";

  const hasContent = uploadedAsset !== null;

  return (
    <AppShell
      eyebrow="流转工作台"
      title="把一条内容流转成多平台文字稿件"
      description="上传内容、转写解析、选择画像和平台后生成可编辑稿件。"
    >
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        {/* ====== Left Column: Upload & Transcript ====== */}
        <section className="space-y-6">
          {/* Upload Area */}
          <div className="rounded-card border border-paper-200 bg-paper-0 p-2 shadow-sheet">
            <div className="rounded-[8px] bg-paper-0 p-5">
              <SectionTitle
                kicker="内容输入"
                title="上传一条内容"
                description="上传视频进行转写解析。当前仅支持视频文件。"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                disabled={isUploading}
                className="mt-4 flex min-h-32 w-full flex-col items-center justify-center rounded-card border border-dashed border-paper-200 bg-paper-50 px-4 text-center transition-[background-color,transform] duration-300 active:scale-[0.98] hover:bg-paper-0 disabled:opacity-60"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="size-7 animate-spin text-seal-500" />
                    <span className="mt-3 text-sm font-medium text-ink-600">正在上传...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-7 text-seal-500" />
                    <span className="mt-3 text-sm font-medium">拖入视频或点击选择文件</span>
                    <span className="mt-1 text-xs text-ink-400">支持 mp4、mov、avi 等视频格式</span>
                  </>
                )}
              </button>

              {uploadedAsset && (
                <div className="mt-3 flex items-center gap-3 rounded-card border border-sage-100 bg-[#f6f8f3] p-3">
                  <Check className="size-4 text-sage-500 shrink-0" />
                  <span className="text-sm text-ink-700 flex-1 truncate">{uploadedAsset.title}</span>
                  <span className="text-xs text-ink-400 shrink-0">已上传</span>
                </div>
              )}
            </div>
          </div>

          {/* Transcript Display (left side) */}
          <section className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
            <SectionTitle
              title="转写内容"
              description={hasContent ? "视频转写与解析结果" : "上传内容后，转写结果将在此显示"}
            />
            {hasContent ? (
              isTranscribing ? (
                <div className="flex items-center gap-3 py-8 justify-center">
                  <Loader2 className="size-5 animate-spin text-seal-500" />
                  <span className="text-sm text-ink-500">LLM 正在转写...</span>
                </div>
              ) : (
                <p className="max-h-96 overflow-y-auto rounded-card border border-paper-200 bg-paper-50 p-4 text-sm leading-7 text-ink-700 whitespace-pre-line">
                  {transcriptText || "（转写结果为空）"}
                </p>
              )
            ) : (
              <div className="py-8 text-center text-sm text-ink-400">
                请先上传视频内容，转写结果将自动显示在这里
              </div>
            )}
          </section>
        </section>

        {/* ====== Right Column ====== */}
        <section className="space-y-6">
          {/* Flow Config */}
          <div className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
            <SectionTitle title="流转配置" description="选择创作者画像和目标平台。" />

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

            {selectedPersona && (
              <div className="mt-3 rounded-card border border-paper-200 bg-paper-50 p-3">
                <p className="text-xs text-ink-500">{selectedPersona.positioning}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedPersona.tone.map((t) => (
                    <span key={t} className="rounded-tag bg-seal-50 px-2 py-0.5 text-[10px] font-medium text-seal-600">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Platform single-select */}
            <div className="mt-4">
              <p className="text-xs font-medium text-ink-600">目标平台</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {platformOptions.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setSelectedPlatform(p.key)}
                    className={`rounded-tag border px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedPlatform === p.key
                        ? "border-seal-500 bg-seal-50 text-seal-600"
                        : "border-paper-200 bg-paper-50 text-ink-600 hover:bg-paper-0"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ====== Tab Switcher ====== */}
          <div className="flex gap-1 rounded-card border border-paper-200 bg-paper-50 p-1">
            {([
              ["transcript", "转写内容"],
              ["profile", "画像更新确认"],
              ["drafts", "稿件"],
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

          {/* ====== Tab 1: 转写内容 + 转写反馈 ====== */}
          {mode === "transcript" && (
            <div className="space-y-6">
              {/* Transcript card */}
              <div className="rounded-card border border-paper-200 bg-paper-0 p-6 shadow-sheet">
                {hasContent ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-ink-400">当前素材</span>
                      <span className="text-sm font-medium text-ink-800">{uploadedAsset.title}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-ink-400">转写全文</p>
                      {isTranscribing ? (
                        <div className="flex items-center gap-3 py-8 justify-center">
                          <Loader2 className="size-5 animate-spin text-seal-500" />
                          <span className="text-sm text-ink-500">LLM 正在转写...</span>
                        </div>
                      ) : (
                        <p className="mt-2 max-h-80 overflow-y-auto rounded-card border border-paper-200 bg-paper-50 p-4 text-sm leading-7 text-ink-700 whitespace-pre-line">
                          {transcriptText || "（转写结果为空）"}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setMode("profile")}
                      className="inline-flex min-h-10 items-center gap-2 rounded-button bg-seal-500 px-4 text-sm font-medium text-paper-0 shadow-action"
                    >
                      查看画像变化
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-ink-500">尚未上传内容</p>
                    <p className="mt-1 text-xs text-ink-400">上传视频后，转写内容将在此显示</p>
                  </div>
                )}
              </div>

              {/* Transcript Feedback (edits the transcription) */}
              {hasContent && (
                <div className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquareText className="size-4 text-seal-500" />
                    <h2 className="font-editorial text-[24px] font-semibold">转写反馈</h2>
                    <span className="text-xs text-ink-400">输入反馈后 LLM 将重新转写</span>
                  </div>

                  {transcriptFeedbackHistory.length > 0 && (
                    <div className="mb-4 space-y-2 max-h-48 overflow-y-auto">
                      {transcriptFeedbackHistory.map((fb, i) => (
                        <div key={i} className="rounded-card border border-paper-200 bg-paper-50 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-ink-400">{fb.time}</span>
                            {fb.tags.length > 0 && (
                              <div className="flex gap-1">
                                {fb.tags.map((t) => (
                                  <span key={t} className="rounded-tag bg-seal-50 px-1.5 py-0.5 text-[10px] font-medium text-seal-600">{t}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          {fb.text && <p className="mt-1 text-sm text-ink-700">{fb.text}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {feedbackTagOptions.map((tag) => {
                      const active = transcriptFeedbackTags.has(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTranscriptFeedbackTag(tag)}
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

                  <div className="mt-3 flex gap-2">
                    <input
                      className="flex-1 h-10 rounded-button border border-paper-200 bg-paper-50 px-3 text-sm outline-none focus-visible:border-seal-500"
                      placeholder="例如：这段转写不准确，漏掉了关于复盘的部分..."
                      value={transcriptFeedbackText}
                      onChange={(e) => setTranscriptFeedbackText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") submitTranscriptFeedback(); }}
                    />
                    <button
                      onClick={submitTranscriptFeedback}
                      disabled={isTranscribing}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-button bg-seal-500 px-4 text-sm font-medium text-paper-0 shadow-action disabled:opacity-50"
                    >
                      {isTranscribing ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "发送"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====== Tab 2: 画像更新确认 + 画像反馈 ====== */}
          {mode === "profile" && (
            <div className="space-y-6">
              {/* Profile changes */}
              <div className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
                <SectionTitle
                  title="画像更新确认"
                  description="本次内容对当前创作者画像的建议变化。请逐一接受、编辑或删除。"
                />

                {isUpdatingProfile && (
                  <div className="flex items-center gap-3 py-4 justify-center">
                    <Loader2 className="size-5 animate-spin text-seal-500" />
                    <span className="text-sm text-ink-500">LLM 正在根据反馈更新画像建议...</span>
                  </div>
                )}

                {/* Additions */}
                {profileChanges.additions.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-sage-600">将新增</p>
                    <div className="mt-2 space-y-2">
                      {profileChanges.additions.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-card border border-sage-100 bg-[#f6f8f3] p-3">
                          <span className="mt-0.5 rounded bg-sage-100 px-1.5 py-0.5 text-[10px] font-medium text-sage-600 shrink-0">{item.field}</span>
                          {editingAdditionIdx === i ? (
                            <div className="flex-1 flex gap-2">
                              <input
                                className="flex-1 h-8 rounded-button border border-paper-200 bg-paper-0 px-2 text-sm outline-none focus-visible:border-seal-500"
                                value={editingAdditionValue}
                                onChange={(e) => setEditingAdditionValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") saveEditAddition(); if (e.key === "Escape") setEditingAdditionIdx(null); }}
                                autoFocus
                              />
                              <button onClick={saveEditAddition} className="rounded-button bg-seal-500 px-2 py-1 text-[10px] font-medium text-paper-0">
                                <Check className="size-3" />
                              </button>
                              <button onClick={() => setEditingAdditionIdx(null)} className="rounded-button border border-paper-200 bg-paper-0 px-2 py-1 text-[10px] font-medium text-ink-400">
                                <X className="size-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="flex-1 text-sm text-ink-800">{item.value}</span>
                          )}
                          {editingAdditionIdx !== i && (
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => acceptAddition(i)}
                                className="rounded-button border border-sage-200 bg-paper-0 px-2 py-1 text-[10px] font-medium text-sage-600 hover:bg-sage-50"
                              >
                                <Check className="size-3 inline mr-0.5" />接受
                              </button>
                              <button
                                onClick={() => startEditAddition(i)}
                                className="rounded-button border border-amber-200 bg-paper-0 px-2 py-1 text-[10px] font-medium text-amber-600 hover:bg-amber-50"
                              >
                                <Pencil className="size-3 inline mr-0.5" />编辑
                              </button>
                              <button
                                onClick={() => deleteAddition(i)}
                                className="rounded-button border border-red-200 bg-paper-0 px-2 py-1 text-[10px] font-medium text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="size-3 inline mr-0.5" />删除
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modifications */}
                {profileChanges.modifications.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-amber-600">将修改</p>
                    <div className="mt-2 space-y-2">
                      {profileChanges.modifications.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-card border border-amber-100 bg-[#fefcf5] p-3">
                          <span className="mt-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 shrink-0">{item.field}</span>
                          {editingModificationIdx === i ? (
                            <div className="flex-1 flex items-center gap-2 text-sm">
                              <span className="line-through text-ink-400">{item.from}</span>
                              <ArrowRight className="size-3 text-ink-400 shrink-0" />
                              <input
                                className="flex-1 h-8 rounded-button border border-paper-200 bg-paper-0 px-2 text-sm outline-none focus-visible:border-seal-500"
                                value={editingModTo}
                                onChange={(e) => setEditingModTo(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") saveEditModification(); if (e.key === "Escape") setEditingModificationIdx(null); }}
                                autoFocus
                              />
                              <button onClick={saveEditModification} className="rounded-button bg-seal-500 px-2 py-1 text-[10px] font-medium text-paper-0">
                                <Check className="size-3" />
                              </button>
                              <button onClick={() => setEditingModificationIdx(null)} className="rounded-button border border-paper-200 bg-paper-0 px-2 py-1 text-[10px] font-medium text-ink-400">
                                <X className="size-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="flex-1 text-sm text-ink-800">
                              <span className="line-through text-ink-400 mr-1">{item.from}</span>
                              <ArrowRight className="size-3 inline mx-0.5 text-ink-400" />
                              <span>{item.to}</span>
                            </span>
                          )}
                          {editingModificationIdx !== i && (
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => acceptModification(i)}
                                className="rounded-button border border-amber-200 bg-paper-0 px-2 py-1 text-[10px] font-medium text-amber-600 hover:bg-amber-50"
                              >
                                <Check className="size-3 inline mr-0.5" />接受
                              </button>
                              <button
                                onClick={() => startEditModification(i)}
                                className="rounded-button border border-amber-200 bg-paper-0 px-2 py-1 text-[10px] font-medium text-amber-600 hover:bg-amber-50"
                              >
                                <Pencil className="size-3 inline mr-0.5" />编辑
                              </button>
                              <button
                                onClick={() => deleteModification(i)}
                                className="rounded-button border border-red-200 bg-paper-0 px-2 py-1 text-[10px] font-medium text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="size-3 inline mr-0.5" />删除
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profileChanges.additions.length === 0 && profileChanges.modifications.length === 0 && (
                  <p className="mt-4 text-sm text-ink-400">暂无待确认的画像更新</p>
                )}

                {/* Confirm actions */}
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

              {/* Profile Feedback (updates the profile suggestions) */}
              <div className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquareText className="size-4 text-seal-500" />
                  <h2 className="font-editorial text-[24px] font-semibold">画像反馈</h2>
                  <span className="text-xs text-ink-400">输入反馈后 LLM 将更新画像建议</span>
                </div>

                {profileFeedbackHistory.length > 0 && (
                  <div className="mb-4 space-y-2 max-h-48 overflow-y-auto">
                    {profileFeedbackHistory.map((fb, i) => (
                      <div key={i} className="rounded-card border border-paper-200 bg-paper-50 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-ink-400">{fb.time}</span>
                          {fb.tags.length > 0 && (
                            <div className="flex gap-1">
                              {fb.tags.map((t) => (
                                <span key={t} className="rounded-tag bg-seal-50 px-1.5 py-0.5 text-[10px] font-medium text-seal-600">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        {fb.text && <p className="mt-1 text-sm text-ink-700">{fb.text}</p>}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {feedbackTagOptions.map((tag) => {
                    const active = profileFeedbackTags.has(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleProfileFeedbackTag(tag)}
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

                <div className="mt-3 flex gap-2">
                  <input
                    className="flex-1 h-10 rounded-button border border-paper-200 bg-paper-50 px-3 text-sm outline-none focus-visible:border-seal-500"
                    placeholder="例如：语气应该更温和，不要用这么书面的词汇..."
                    value={profileFeedbackText}
                    onChange={(e) => setProfileFeedbackText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") submitProfileFeedback(); }}
                  />
                  <button
                    onClick={submitProfileFeedback}
                    disabled={isUpdatingProfile}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-button bg-seal-500 px-4 text-sm font-medium text-paper-0 shadow-action disabled:opacity-50"
                  >
                    {isUpdatingProfile ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "发送"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ====== Tab 3: 稿件 ====== */}
          {mode === "drafts" && (
            <section className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <SectionTitle
                  kicker={selectedPlatformName}
                  title={generatedDraft.title}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { navigator.clipboard.writeText(draftContent); }}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-button border border-paper-200 bg-paper-0 px-3 text-xs font-medium text-ink-800 hover:bg-paper-50"
                  >
                    <Copy className="size-3.5" />
                    复制
                  </button>
                  <button
                    onClick={() => setMode("transcript")}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-button border border-paper-200 bg-paper-0 px-3 text-xs font-medium text-ink-800 hover:bg-paper-50"
                  >
                    <RefreshCcw className="size-3.5" />
                    重新生成
                  </button>
                </div>
              </div>

              <textarea
                className="mt-4 min-h-[320px] w-full resize-none rounded-card border border-paper-200 bg-paper-50 p-4 text-[15px] leading-7 text-ink-800 outline-none focus-visible:border-seal-500 focus-visible:ring-2 focus-visible:ring-seal-500/20"
                value={draftContent}
                onChange={(e) => handleDraftChange(e.target.value)}
              />
              {draftsSaved && (
                <p className="mt-1 text-xs text-ink-400">已自动保存</p>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => setMode("profile")}
                  className="inline-flex min-h-10 items-center gap-2 rounded-button bg-seal-500 px-4 text-sm font-medium text-paper-0 shadow-action"
                >
                  沉淀到资产库
                </button>
              </div>
            </section>
          )}
        </section>
      </div>
    </AppShell>
  );
}
