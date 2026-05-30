"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Copy, RefreshCcw, UploadCloud, ArrowRight, Check,
  Trash2, MessageSquareText, Loader2, Pencil, X,
  FileText,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionTitle } from "@/components/ui";
import { platformOptions, feedbackTagOptions } from "@/lib/data";
import { useCreators } from "@/lib/hooks/use-creators";
import type { Asset } from "@/lib/hooks/use-assets";
import type { Task, Draft } from "@/lib/hooks/use-tasks";

type WorkModule = "content" | "profile" | "drafts";

type ProfileAddition = { field: string; value: string; accepted?: boolean };
type ProfileModification = { field: string; from: string; to: string; accepted?: boolean };

const FIELD_DISPLAY_MAP: Record<string, string> = {
  positioning: "定位",
  domain: "领域",
  tone: "语气风格",
  beliefs: "核心观点",
  cases: "常用案例",
  common_patterns: "叙事结构",
  avoid_phrases: "禁忌表达",
  title_preference: "标题偏好",
  定位: "定位",
  领域: "领域",
  语气风格: "语气风格",
  语气: "语气风格",
  口头禅: "口头禅",
  核心观点: "核心观点",
  高频观点: "核心观点",
  常用案例: "常用案例",
  叙事结构: "叙事结构",
  常用结构: "叙事结构",
  论证方式: "论证方式",
  禁忌表达: "禁忌表达",
  禁用表达: "禁忌表达",
  标题偏好: "标题偏好",
};

const FIELD_COLOR_MAP: Record<string, { normal: string; accepted: string }> = {
  定位: { normal: "bg-violet-100 text-violet-700", accepted: "bg-violet-50 text-violet-600" },
  领域: { normal: "bg-violet-100 text-violet-700", accepted: "bg-violet-50 text-violet-600" },
  标题偏好: { normal: "bg-violet-100 text-violet-700", accepted: "bg-violet-50 text-violet-600" },
  核心观点: { normal: "bg-rose-100 text-rose-700", accepted: "bg-rose-50 text-rose-600" },
  常用案例: { normal: "bg-rose-100 text-rose-700", accepted: "bg-rose-50 text-rose-600" },
  语气风格: { normal: "bg-sky-100 text-sky-700", accepted: "bg-sky-50 text-sky-600" },
  口头禅: { normal: "bg-sky-100 text-sky-700", accepted: "bg-sky-50 text-sky-600" },
  叙事结构: { normal: "bg-emerald-100 text-emerald-700", accepted: "bg-emerald-50 text-emerald-600" },
  论证方式: { normal: "bg-emerald-100 text-emerald-700", accepted: "bg-emerald-50 text-emerald-600" },
  禁忌表达: { normal: "bg-amber-100 text-amber-700", accepted: "bg-amber-50 text-amber-600" },
};

function getFieldMeta(field: string) {
  const display = FIELD_DISPLAY_MAP[field] || field;
  const colors = FIELD_COLOR_MAP[display] || { normal: "bg-slate-100 text-slate-700", accepted: "bg-slate-50 text-slate-600" };
  return { display, colors };
}

export default function CreatePage() {
  const { creators } = useCreators();

  // ---- Upload & processing state ----
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<"" | "transcribing" | "analyzing">("");
  const [processError, setProcessError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Task state ----
  const [taskId, setTaskId] = useState<string | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // ---- Config ----
  const [selectedCreatorId, setSelectedCreatorId] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("xiaohongshu");

  // ---- Work module ----
  const [module, setModule] = useState<WorkModule>("content");

  // ---- Profile changes (initialized from analysis, then managed locally) ----
  const [localAdditions, setLocalAdditions] = useState<ProfileAddition[]>([]);
  const [localModifications, setLocalModifications] = useState<ProfileModification[]>([]);

  // ---- Editing state for profile items ----
  const [editingAdditionIdx, setEditingAdditionIdx] = useState<number | null>(null);
  const [editingAdditionValue, setEditingAdditionValue] = useState("");
  const [editingModificationIdx, setEditingModificationIdx] = useState<number | null>(null);
  const [editingModTo, setEditingModTo] = useState("");

  // ---- Feedback state ----
  const [contentFeedbackText, setContentFeedbackText] = useState("");
  const [contentFeedbackTags, setContentFeedbackTags] = useState<Set<string>>(new Set());
  const [profileFeedbackText, setProfileFeedbackText] = useState("");
  const [profileFeedbackTags, setProfileFeedbackTags] = useState<Set<string>>(new Set());

  // ---- Draft editing ----
  const [draftEdits, setDraftEdits] = useState<Record<string, string>>({});
  const [draftSaved, setDraftSaved] = useState(false);

  // ---- Profile regeneration ----
  const [isRegeneratingProfile, setIsRegeneratingProfile] = useState(false);

  // ---- All drafts accumulator (across platforms for this asset) ----
  const [allDrafts, setAllDrafts] = useState<Draft[]>([]);

  // ---- Selected draft ID (for draft library navigation) ----
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);

  // ---- Profile suggestion dismissed state ----
  const [profileDismissed, setProfileDismissed] = useState(false);

  // Reset transient states when active asset changes
  const activeAssetId = asset?.id || task?.asset?.id;
  useEffect(() => {
    setProfileDismissed(false);
    setSelectedDraftId(null);
    setLocalAdditions([]);
    setLocalModifications([]);
    setEditingAdditionIdx(null);
    setEditingAdditionValue("");
    setEditingModificationIdx(null);
    setEditingModTo("");
  }, [activeAssetId]);

  // Load task or asset from URL on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const taskParam = params.get("task");
    const assetParam = params.get("assetId") || params.get("asset");
    if (taskParam) {
      setTaskId(taskParam);
    } else if (assetParam) {
      fetch(`/api/assets/${assetParam}`)
        .then((res) => {
          if (!res.ok) throw new Error("素材不存在或已删除");
          return res.json();
        })
        .then((data: Asset) => {
          setAsset(data);
          setSelectedCreatorId(data.creatorId || "");
          setModule("content");

          // Load any existing tasks for this asset so drafts are restored
          fetch(`/api/tasks?asset_id=${data.id}`)
            .then((res) => (res.ok ? res.json() : []))
            .then((tasks: Task[]) => {
              if (tasks.length > 0) {
                const latest = tasks.sort((a, b) => b.updatedAt - a.updatedAt)[0];
                setTaskId(latest.id);
              }
            })
            .catch(() => {
              // Non-critical: task restoration is best-effort
            });

          // Auto-process if user left before processing completed
          const needsTranscribe = data.status === "uploaded" || data.status === "transcribing";
          const needsAnalyze = data.status === "transcribed" || data.status === "analyzing";

          if (needsTranscribe) {
            setIsProcessing(true);
            setProcessStep("transcribing");
            fetch(`/api/assets/${data.id}/transcribe`, { method: "POST" })
              .then((res) => {
                if (!res.ok) throw new Error("转写失败");
                return fetch(`/api/assets/${data.id}`);
              })
              .then((res) => res.json())
              .then((updated: Asset) => {
                setAsset(updated);
                setProcessStep("analyzing");
                return fetch(`/api/assets/${data.id}/analyze`, { method: "POST" });
              })
              .then((res) => {
                if (!res.ok) throw new Error("分析失败");
                return fetch(`/api/assets/${data.id}`);
              })
              .then((res) => res.json())
              .then((processed: Asset) => {
                setAsset(processed);
              })
              .catch((err) => {
                setProcessError(err instanceof Error ? err.message : "解析失败");
              })
              .finally(() => {
                setIsProcessing(false);
                setProcessStep("");
              });
          } else if (needsAnalyze) {
            setIsProcessing(true);
            setProcessStep("analyzing");
            fetch(`/api/assets/${data.id}/analyze`, { method: "POST" })
              .then((res) => {
                if (!res.ok) throw new Error("分析失败");
                return fetch(`/api/assets/${data.id}`);
              })
              .then((res) => res.json())
              .then((processed: Asset) => {
                setAsset(processed);
              })
              .catch((err) => {
                setProcessError(err instanceof Error ? err.message : "解析失败");
              })
              .finally(() => {
                setIsProcessing(false);
                setProcessStep("");
              });
          }
        })
        .catch((err) => {
          setProcessError(err instanceof Error ? err.message : "加载素材失败");
        });
    }
  }, []);

  // Initialize profile additions/modifications from LLM profile suggestion, falling back to analysis extraction
  useEffect(() => {
    if (profileDismissed) return;
    if (localAdditions.length > 0 || localModifications.length > 0) return;

    const profileSuggestion = task?.asset?.profileSuggestion || asset?.profileSuggestion;
    if (profileSuggestion?.suggestions) {
      const sugg = profileSuggestion.suggestions;
      const additions: ProfileAddition[] = [];
      const modifications: ProfileModification[] = [];

      if (sugg.additions && Array.isArray(sugg.additions)) {
        sugg.additions.forEach((a: { field?: string; value?: string }) => {
          if (a.field?.trim() && a.value?.trim()) additions.push({ field: a.field.trim(), value: a.value.trim() });
        });
      }
      if (sugg.modifications && Array.isArray(sugg.modifications)) {
        sugg.modifications.forEach((m: { field?: string; from?: string; to?: string }) => {
          if (m.field?.trim() && m.to?.trim()) modifications.push({ field: m.field.trim(), from: m.from?.trim() || "", to: m.to.trim() });
        });
      }

      setLocalAdditions(additions);
      setLocalModifications(modifications);
      return;
    }

    const analysis = task?.asset?.analysis || asset?.analysis;
    if (!analysis) return;

    const additions: ProfileAddition[] = [];
    if (analysis.corePoints && Array.isArray(analysis.corePoints)) {
      analysis.corePoints.forEach((cp: unknown, i: number) => {
        const point = cp as { point?: string };
        if (i < 3 && point.point) additions.push({ field: "核心观点", value: point.point });
      });
    }
    if (analysis.cases && Array.isArray(analysis.cases)) {
      analysis.cases.forEach((c: string, i: number) => {
        if (i < 2) additions.push({ field: "常用案例", value: c });
      });
    }
    setLocalAdditions(additions);
  }, [task?.asset?.profileSuggestion, asset?.profileSuggestion, task?.asset?.analysis, asset?.analysis]);

  // Poll task status when generating
  useEffect(() => {
    if (!taskId) {
      setTask(null);
      return;
    }

    let cancelled = false;

    const fetchTask = async () => {
      try {
        const res = await fetch(`/api/tasks/${taskId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setTask(data);
        return data as Task;
      } catch {
        return null;
      }
    };

    fetchTask();

    const interval = setInterval(async () => {
      await fetchTask();
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [taskId]);

  // Merge task drafts into allDrafts
  useEffect(() => {
    if (!task?.drafts) return;
    setAllDrafts((prev) => {
      const map = new Map<string, Draft>();
      prev.forEach((d) => map.set(d.id, d));
      task.drafts!.forEach((d) => map.set(d.id, d));
      return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
    });
  }, [task?.drafts]);

  // ---- Upload handler ----
  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setProcessError(null);
    setAsset(null);
    setTaskId(null);
    setTask(null);
    setAllDrafts([]);
    setLocalAdditions([]);
    setLocalModifications([]);
    setDraftEdits({});
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "video");
      formData.append("title", file.name);
      if (selectedCreatorId) formData.append("creatorId", selectedCreatorId);

      const res = await fetch("/api/assets", { method: "POST", body: formData });
      if (!res.ok) throw new Error("上传失败");
      const uploaded = (await res.json()) as Asset;
      setAsset(uploaded);
      window.history.replaceState({}, "", `/create?assetId=${uploaded.id}`);

      setIsProcessing(true);

      setProcessStep("transcribing");
      const transcribeRes = await fetch(`/api/assets/${uploaded.id}/transcribe`, { method: "POST" });
      if (!transcribeRes.ok) {
        const text = await transcribeRes.text();
        let message = "转写失败";
        try {
          const err = JSON.parse(text) as { error?: string };
          if (err.error) message = err.error;
        } catch {
          message = text.slice(0, 200) || `服务器错误 ${transcribeRes.status}`;
        }
        throw new Error(message);
      }

      const transcribedAssetRes = await fetch(`/api/assets/${uploaded.id}`);
      if (transcribedAssetRes.ok) {
        setAsset(await transcribedAssetRes.json() as Asset);
      }

      setProcessStep("analyzing");
      const analyzeRes = await fetch(`/api/assets/${uploaded.id}/analyze`, { method: "POST" });
      if (!analyzeRes.ok) {
        const text = await analyzeRes.text();
        let message = "分析失败";
        try {
          const err = JSON.parse(text) as { error?: string };
          if (err.error) message = err.error;
        } catch {
          message = text.slice(0, 200) || `服务器错误 ${analyzeRes.status}`;
        }
        throw new Error(message);
      }

      const analyzedAssetRes = await fetch(`/api/assets/${uploaded.id}`);
      if (analyzedAssetRes.ok) {
        setAsset(await analyzedAssetRes.json() as Asset);
      }

      setModule("content");
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
      setProcessStep("");
    }
  }, [selectedCreatorId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  // ---- Generate / Regenerate handler ----
  const handleGenerate = useCallback(async () => {
    if (!asset || !selectedPlatform) return;
    setIsGenerating(true);
    setProcessError(null);
    try {
      const taskRes = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: asset.id,
          creatorId: selectedCreatorId || undefined,
          title: asset.title,
          platforms: [selectedPlatform],
        }),
      });
      if (!taskRes.ok) throw new Error("创建任务失败");
      const { taskId: newTaskId } = await taskRes.json() as { taskId: string };
      setTaskId(newTaskId);

      const genRes = await fetch(`/api/tasks/${newTaskId}/generate`, { method: "POST" });
      if (!genRes.ok) {
        const err = await genRes.json() as { error?: string };
        throw new Error(err.error || "生成失败");
      }

      const taskRes2 = await fetch(`/api/tasks/${newTaskId}`);
      if (taskRes2.ok) setTask(await taskRes2.json() as Task);
      setSelectedDraftId(null);
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setIsGenerating(false);
    }
  }, [asset, selectedCreatorId, selectedPlatform]);

  const handleRegenerate = useCallback(async () => {
    if (!taskId) return;
    setIsGenerating(true);
    setProcessError(null);
    try {
      const genRes = await fetch(`/api/tasks/${taskId}/generate`, { method: "POST" });
      if (!genRes.ok) {
        const err = await genRes.json() as { error?: string };
        throw new Error(err.error || "重新生成失败");
      }
      const taskRes = await fetch(`/api/tasks/${taskId}`);
      if (taskRes.ok) setTask(await taskRes.json() as Task);
      setSelectedDraftId(null);
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : "重新生成失败");
    } finally {
      setIsGenerating(false);
    }
  }, [taskId]);

  // ---- Profile actions ----
  const acceptAddition = (i: number) => {
    setLocalAdditions((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, accepted: true } : item))
    );
  };

  const deleteAddition = (i: number) => {
    setLocalAdditions((prev) => prev.filter((_, idx) => idx !== i));
  };

  const startEditAddition = (i: number) => {
    setEditingAdditionIdx(i);
    setEditingAdditionValue(localAdditions[i].value);
  };

  const saveEditAddition = () => {
    if (editingAdditionIdx === null) return;
    setLocalAdditions((prev) =>
      prev.map((item, idx) => (idx === editingAdditionIdx ? { ...item, value: editingAdditionValue } : item))
    );
    setEditingAdditionIdx(null);
    setEditingAdditionValue("");
  };

  const acceptModification = (i: number) => {
    setLocalModifications((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, accepted: true } : item))
    );
  };

  const deleteModification = (i: number) => {
    setLocalModifications((prev) => prev.filter((_, idx) => idx !== i));
  };

  const startEditModification = (i: number) => {
    setEditingModificationIdx(i);
    setEditingModTo(localModifications[i].to);
  };

  const saveEditModification = () => {
    if (editingModificationIdx === null) return;
    setLocalModifications((prev) =>
      prev.map((item, idx) => (idx === editingModificationIdx ? { ...item, to: editingModTo } : item))
    );
    setEditingModificationIdx(null);
    setEditingModTo("");
  };

  const handleConfirmProfile = async () => {
    if (!selectedCreatorId) return;
    const toApplyAdditions = localAdditions.filter((a) => a.accepted);
    const toApplyModifications = localModifications.filter((m) => m.accepted);

    const profile = selectedCreator?.profile;
    const beliefs = [...(profile?.beliefs || [])];
    const structures = [...(profile?.structures || [])];
    const catchphrases = [...(profile?.catchphrases || [])];
    const tone = [...(profile?.tone || [])];
    const avoidPhrases = [...(profile?.avoidPhrases || [])];
    let positioning = profile?.positioning ?? "";
    let titlePreference = profile?.titlePreference ?? "";

    const additionFieldMap: Record<string, string[] | undefined> = {
      "核心观点": beliefs,
      "高频观点": beliefs,
      "叙事结构": structures,
      "常用结构": structures,
      "论证方式": structures,
      "语气风格": tone,
      "语气": tone,
      "口头禅": catchphrases,
      "禁忌表达": avoidPhrases,
      "禁用表达": avoidPhrases,
      // 英文兜底
      beliefs,
      structures,
      tone,
      catchphrases,
      avoid_phrases: avoidPhrases,
    };

    toApplyAdditions.forEach((a) => {
      const field = a.field;
      if (field === "定位" || field === "positioning") {
        if (!positioning) positioning = a.value;
      } else if (field === "标题偏好" || field === "title_preference") {
        if (!titlePreference) titlePreference = a.value;
      } else {
        const target = additionFieldMap[field];
        if (target) target.push(a.value);
      }
    });

    const modificationFieldMap: Record<string, { scalar?: string; array?: string[] }> = {
      "定位": { scalar: "positioning" },
      "标题偏好": { scalar: "titlePreference" },
      "核心观点": { array: beliefs },
      "高频观点": { array: beliefs },
      "叙事结构": { array: structures },
      "常用结构": { array: structures },
      "论证方式": { array: structures },
      "语气风格": { array: tone },
      "语气": { array: tone },
      "口头禅": { array: catchphrases },
      "禁忌表达": { array: avoidPhrases },
      "禁用表达": { array: avoidPhrases },
      // 英文兜底
      positioning: { scalar: "positioning" },
      title_preference: { scalar: "titlePreference" },
      beliefs: { array: beliefs },
      structures: { array: structures },
      tone: { array: tone },
      catchphrases: { array: catchphrases },
      avoid_phrases: { array: avoidPhrases },
    };

    toApplyModifications.forEach((m) => {
      const mapping = modificationFieldMap[m.field];
      if (!mapping) return;
      if (mapping.array) {
        const idx = mapping.array.indexOf(m.from);
        if (idx !== -1) mapping.array[idx] = m.to;
      } else if (mapping.scalar === "positioning") {
        positioning = m.to;
      } else if (mapping.scalar === "titlePreference") {
        titlePreference = m.to;
      }
    });

    const updatePayload: Record<string, unknown> = {};
    if (beliefs.length > 0) updatePayload.beliefs = beliefs;
    if (structures.length > 0) updatePayload.structures = structures;
    if (catchphrases.length > 0) updatePayload.catchphrases = catchphrases;
    if (tone.length > 0) updatePayload.tone = tone;
    if (avoidPhrases.length > 0) updatePayload.avoidPhrases = avoidPhrases;
    if (positioning !== (profile?.positioning ?? "")) updatePayload.positioning = positioning;
    if (titlePreference !== (profile?.titlePreference ?? "")) updatePayload.titlePreference = titlePreference;

    try {
      const res = await fetch(`/api/creators/${selectedCreatorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });
      if (!res.ok) throw new Error("写入失败");
      setLocalAdditions((prev) => prev.filter((a) => !a.accepted));
      setLocalModifications((prev) => prev.filter((m) => !m.accepted));

      // Mark the LLM profile suggestion as applied if it exists
      const profileSuggestion = task?.asset?.profileSuggestion || asset?.profileSuggestion;
      if (profileSuggestion?.id) {
        await fetch(`/api/creators/${selectedCreatorId}/suggestions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            suggestionId: profileSuggestion.id,
            action: "apply",
          }),
        }).catch(() => {
          // Non-fatal: suggestion status update is best-effort
        });
      }
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : "写入失败");
    }
  };

  const handleRegenerateProfile = useCallback(async () => {
    const assetId = asset?.id || task?.asset?.id;
    if (!assetId) return;
    setIsRegeneratingProfile(true);
    setProcessError(null);
    try {
      const res = await fetch(`/api/assets/${assetId}/profile-suggestion`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error || "重新生成失败");
      }
      const data = await res.json() as {
        suggestions?: {
          additions?: Array<{ field?: string; value?: string }>;
          modifications?: Array<{ field?: string; from?: string; to?: string }>;
        };
      };

      const additions: ProfileAddition[] = [];
      const modifications: ProfileModification[] = [];

      const sugg = data.suggestions;
      if (sugg?.additions && Array.isArray(sugg.additions)) {
        sugg.additions.forEach((a) => {
          if (a.field?.trim() && a.value?.trim()) additions.push({ field: a.field.trim(), value: a.value.trim() });
        });
      }
      if (sugg?.modifications && Array.isArray(sugg.modifications)) {
        sugg.modifications.forEach((m) => {
          if (m.field?.trim() && m.to?.trim()) modifications.push({ field: m.field.trim(), from: m.from?.trim() || "", to: m.to.trim() });
        });
      }

      setProfileDismissed(false);
      setLocalAdditions(additions);
      setLocalModifications(modifications);

      if (assetId === asset?.id) {
        const assetRes = await fetch(`/api/assets/${assetId}`);
        if (assetRes.ok) setAsset(await assetRes.json() as Asset);
      }
      if (taskId) {
        const taskRes = await fetch(`/api/tasks/${taskId}`);
        if (taskRes.ok) setTask(await taskRes.json() as Task);
      }
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : "重新生成失败");
    } finally {
      setIsRegeneratingProfile(false);
    }
  }, [asset?.id, task?.asset?.id, taskId]);

  // ---- Feedback handlers ----
  const submitContentFeedback = async () => {
    if (!taskId || (!contentFeedbackText.trim() && contentFeedbackTags.size === 0)) return;
    try {
      await fetch(`/api/tasks/${taskId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tags: Array.from(contentFeedbackTags),
          message: contentFeedbackText,
          scope: "current_draft",
        }),
      });
      setContentFeedbackText("");
      setContentFeedbackTags(new Set());
      const taskRes = await fetch(`/api/tasks/${taskId}`);
      if (taskRes.ok) setTask(await taskRes.json() as Task);
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  const submitProfileFeedback = async () => {
    if (!taskId || (!profileFeedbackText.trim() && profileFeedbackTags.size === 0)) return;
    try {
      await fetch(`/api/tasks/${taskId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tags: Array.from(profileFeedbackTags),
          message: profileFeedbackText,
          scope: "creator_profile",
        }),
      });
      setProfileFeedbackText("");
      setProfileFeedbackTags(new Set());
      const taskRes = await fetch(`/api/tasks/${taskId}`);
      if (taskRes.ok) setTask(await taskRes.json() as Task);
    } catch (err) {
      console.error("Profile feedback error:", err);
    }
  };

  const toggleContentFeedbackTag = (tag: string) => {
    setContentFeedbackTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const toggleProfileFeedbackTag = (tag: string) => {
    setProfileFeedbackTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  // ---- Derived data ----
  const selectedCreator = creators.find((c) => c.id === selectedCreatorId);
  const selectedPlatformName = platformOptions.find((p) => p.key === selectedPlatform)?.name || "当前平台";

  const currentDraft = useMemo(() => {
    if (selectedDraftId) {
      const matched = allDrafts.find((d: Draft) => d.id === selectedDraftId);
      if (matched && matched.platform === selectedPlatform) return matched;
    }
    const drafts = allDrafts.filter((d: Draft) => d.platform === selectedPlatform);
    if (drafts.length === 0) return null;
    return drafts.sort((a: Draft, b: Draft) => b.createdAt - a.createdAt)[0];
  }, [allDrafts, selectedPlatform, selectedDraftId]);

  const sourceContent = task?.asset?.transcript?.fullText || asset?.transcript?.fullText || "";

  const hasContent = asset !== null;
  const canGenerate = hasContent && !isProcessing && !!selectedPlatform;

  const handleDraftChange = (value: string) => {
    if (currentDraft) {
      setDraftEdits((prev) => ({ ...prev, [currentDraft.id]: value }));
    }
    setDraftSaved(false);
    setTimeout(() => setDraftSaved(true), 600);
  };

  const draftDisplayContent = currentDraft
    ? (draftEdits[currentDraft.id] ?? currentDraft.content)
    : "";

  const draftDisplayTitle = currentDraft?.title ?? "尚未生成";

  return (
    <AppShell
      eyebrow="流转工作台"
      title="把一条内容流转成多平台文字稿件"
      description="上传内容、转写解析、选择画像和平台后生成可编辑稿件。"
    >
      {processError && (
        <div className="mb-4 rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {processError}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* ====== Left Column: Upload & Source ====== */}
        <div className="space-y-6">
          {/* Top Left: Upload Area */}
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
                disabled={isUploading || isProcessing}
                className="mt-4 flex min-h-32 w-full flex-col items-center justify-center rounded-card border border-dashed border-paper-200 bg-paper-50 px-4 text-center transition-[background-color,transform] duration-300 active:scale-[0.98] hover:bg-paper-0 disabled:opacity-60"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="size-7 animate-spin text-seal-500" />
                    <span className="mt-3 text-sm font-medium text-ink-600">正在上传...</span>
                  </>
                ) : isProcessing ? (
                  <>
                    <Loader2 className="size-7 animate-spin text-seal-500" />
                    <span className="mt-3 text-sm font-medium text-ink-600">
                      {processStep === "transcribing" ? "正在转写音频..." : processStep === "analyzing" ? "正在分析内容..." : "正在解析..."}
                    </span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-7 text-seal-500" />
                    <span className="mt-3 text-sm font-medium">拖入视频或点击选择文件</span>
                    <span className="mt-1 text-xs text-ink-400">支持 mp4、mov、avi 等视频格式</span>
                  </>
                )}
              </button>

              {asset && (
                <div className="mt-3 flex items-center gap-3 rounded-card border border-sage-100 bg-[#f6f8f3] p-3">
                  <Check className="size-4 text-sage-500 shrink-0" />
                  <span className="text-sm text-ink-700 flex-1 truncate">{asset.title}</span>
                  <span className="text-xs text-ink-400 shrink-0">
                    {asset.status === "analyzed" ? "已解析" : asset.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Left: Source Text & Analysis */}
          <section className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
            <SectionTitle
              title="源文本与解析"
              description={hasContent ? "原始转写文本与提取观点" : "上传内容后，源文本将在此显示"}
            />
            {hasContent ? (
              isProcessing ? (
                <div className="flex items-center gap-3 py-8 justify-center">
                  <Loader2 className="size-5 animate-spin text-seal-500" />
                  <span className="text-sm text-ink-500">正在解析...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="max-h-64 overflow-y-auto rounded-card border border-paper-200 bg-paper-50 p-4 text-sm leading-7 text-ink-700 whitespace-pre-line">
                    {sourceContent || "（源内容为空）"}
                  </p>
                  {(task?.asset?.analysis || asset?.analysis)?.corePoints && (
                    <div className="rounded-card border border-paper-200 bg-paper-50 p-4">
                      <p className="text-xs font-medium text-ink-400 mb-2">提取的核心观点</p>
                      <ul className="space-y-2">
                        {((task?.asset?.analysis || asset?.analysis)?.corePoints as Array<{point?: string; evidence?: string}> || []).map((cp, i) => (
                          <li key={i} className="text-sm text-ink-700">
                            <span className="font-medium">{cp.point}</span>
                            {cp.evidence && <span className="text-ink-400"> — {cp.evidence}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="py-8 text-center text-sm text-ink-400">
                请先上传视频内容，源文本将自动显示在这里
              </div>
            )}
          </section>
        </div>

        {/* ====== Right Column: Config & Output ====== */}
        <div className="space-y-6">
          {/* Top Right: Flow Config */}
          <div className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
            <SectionTitle title="流转配置" description="选择创作者画像和目标平台，然后生成稿件。" />

            <label className="block">
              <span className="text-xs font-medium text-ink-600">创作者画像</span>
              <select
                className="mt-2 h-10 w-full rounded-button border border-paper-200 bg-paper-0 px-3 text-sm text-ink-800 outline-none focus-visible:border-seal-500"
                value={selectedCreatorId}
                onChange={(e) => setSelectedCreatorId(e.target.value)}
              >
                <option value="">无画像</option>
                {creators.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            {selectedCreator && (
              <div className="mt-3 rounded-card border border-paper-200 bg-paper-50 p-3">
                <p className="text-xs text-ink-500">{selectedCreator.profile?.positioning || "暂无定位"}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(selectedCreator.profile?.tone || []).map((t: string) => (
                    <span key={t} className="rounded-tag bg-seal-50 px-2 py-0.5 text-[10px] font-medium text-seal-600">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Platform single-select */}
            <div className="mt-4">
              <p className="text-xs font-medium text-ink-600">目标平台</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {platformOptions.map((p) => {
                  const active = selectedPlatform === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setSelectedPlatform(p.key)}
                      className={`rounded-tag border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
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

            {/* Generate button */}
            <div className="mt-5 flex flex-wrap gap-3 border-t border-paper-200 pt-4">
              <button
                onClick={taskId ? handleRegenerate : handleGenerate}
                disabled={!canGenerate || isGenerating}
                className="inline-flex min-h-10 items-center gap-2 rounded-button bg-seal-500 px-4 text-sm font-medium text-paper-0 shadow-action disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : taskId ? (
                  <RefreshCcw className="size-4" />
                ) : null}
                {isGenerating ? "生成中..." : taskId ? "重新生成" : "生成稿件"}
              </button>
              {task?.status === "generating" && (
                <span className="inline-flex items-center text-xs text-ink-500">
                  <Loader2 className="size-3 animate-spin mr-1" />
                  LLM 正在生成稿件...
                </span>
              )}
            </div>
          </div>

          {/* Bottom Right: Three Modules */}
          <div className="flex gap-1 rounded-card border border-paper-200 bg-paper-50 p-1">
            {([
              ["content", "生成内容"],
              ["profile", "画像更新确认"],
              ["drafts", "稿件库"],
            ] as [WorkModule, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setModule(key)}
                className={`flex-1 rounded-button py-2 text-xs font-medium transition-colors ${
                  module === key
                    ? "bg-paper-0 text-ink-950 shadow-hairline"
                    : "text-ink-500 hover:text-ink-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Module 1: Generated Content */}
          {module === "content" && (
            <div className="space-y-6">
              <section className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
                {currentDraft ? (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <SectionTitle
                        kicker={selectedPlatformName}
                        title={draftDisplayTitle}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => { navigator.clipboard.writeText(draftDisplayContent); }}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-button border border-paper-200 bg-paper-0 px-3 text-xs font-medium text-ink-800 hover:bg-paper-50"
                        >
                          <Copy className="size-3.5" />
                          复制
                        </button>
                        <button
                          onClick={handleRegenerate}
                          disabled={isGenerating}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-button border border-paper-200 bg-paper-0 px-3 text-xs font-medium text-ink-800 hover:bg-paper-50 disabled:opacity-50"
                        >
                          <RefreshCcw className="size-3.5" />
                          重新生成
                        </button>
                      </div>
                    </div>

                    <textarea
                      className="mt-4 min-h-[260px] w-full resize-none rounded-card border border-paper-200 bg-paper-50 p-4 text-[15px] leading-7 text-ink-800 outline-none focus-visible:border-seal-500 focus-visible:ring-2 focus-visible:ring-seal-500/20"
                      value={draftDisplayContent}
                      onChange={(e) => handleDraftChange(e.target.value)}
                    />
                    {draftSaved && (
                      <p className="mt-1 text-xs text-ink-400">已自动保存</p>
                    )}

                    {currentDraft.notes && currentDraft.notes.length > 0 && (
                      <div className="mt-4 rounded-card border border-paper-200 bg-paper-50 p-3">
                        <p className="text-xs font-medium text-ink-500">生成备注</p>
                        <ul className="mt-1 space-y-1">
                          {currentDraft.notes.map((note: string, i: number) => (
                            <li key={i} className="text-xs text-ink-600">{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : task?.status === "generating" ? (
                  <div className="py-16 text-center">
                    <Loader2 className="size-8 animate-spin text-seal-500 mx-auto" />
                    <p className="mt-4 text-sm text-ink-500">正在生成 {selectedPlatformName} 稿件...</p>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <p className="text-sm text-ink-500">{selectedPlatformName} 稿件尚未生成</p>
                    <button
                      onClick={taskId ? handleRegenerate : handleGenerate}
                      disabled={!canGenerate || isGenerating}
                      className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-button bg-seal-500 px-4 text-sm font-medium text-paper-0 shadow-action disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 className="size-4 animate-spin" /> : null}
                      {isGenerating ? "生成中..." : "生成稿件"}
                    </button>
                  </div>
                )}
              </section>

              {/* Content Feedback */}
              {taskId && (
                <div className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquareText className="size-4 text-seal-500" />
                    <h2 className="font-editorial text-[24px] font-semibold">内容反馈</h2>
                    <span className="text-xs text-ink-400">输入反馈后重新生成</span>
                  </div>

                  {task?.feedback && task.feedback.filter((fb) => fb.scope === "current_draft").length > 0 && (
                    <div className="mb-4 space-y-2 max-h-48 overflow-y-auto">
                      {task.feedback
                        .filter((fb) => fb.scope === "current_draft")
                        .map((fb, i) => (
                          <div key={i} className="rounded-card border border-paper-200 bg-paper-50 p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-ink-400">
                                {new Date(fb.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {fb.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {fb.tags.map((t: string) => (
                                    <span key={t} className="rounded-tag bg-seal-50 px-1.5 py-0.5 text-[10px] font-medium text-seal-600">{t}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {fb.message && <p className="mt-1 text-sm text-ink-700">{fb.message}</p>}
                          </div>
                        ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {feedbackTagOptions.map((tag) => {
                      const active = contentFeedbackTags.has(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleContentFeedbackTag(tag)}
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
                      placeholder="例如：标题太夸张，压低一点..."
                      value={contentFeedbackText}
                      onChange={(e) => setContentFeedbackText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") submitContentFeedback(); }}
                    />
                    <button
                      onClick={submitContentFeedback}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-button bg-seal-500 px-4 text-sm font-medium text-paper-0 shadow-action"
                    >
                      发送
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Module 2: Profile Update Confirmation */}
          {module === "profile" && (
            <div className="space-y-6">
              <div className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
                <SectionTitle
                  title="画像更新确认"
                  description="本次内容对当前创作者画像的建议变化。请逐一接受、编辑或忽略。"
                />

                {/* Additions */}
                {localAdditions.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-sage-600">将新增</p>
                    <div className="mt-2 space-y-2">
                      {localAdditions.map((item, i) => {
                        const meta = getFieldMeta(item.field);
                        return (
                          <div key={i} className={`flex items-start gap-3 rounded-card border p-3 ${item.accepted ? "border-seal-200 bg-seal-50/40" : "border-sage-100 bg-[#f6f8f3]"}`}>
                            <span className={`mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium shrink-0 ${item.accepted ? meta.colors.accepted : meta.colors.normal}`}>{meta.display}</span>
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
                              {item.accepted ? (
                                <span className="inline-flex items-center gap-1 rounded-button border border-seal-200 bg-seal-50 px-2 py-1 text-[10px] font-medium text-seal-600">
                                  <Check className="size-3" />已接受
                                </span>
                              ) : (
                                <>
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
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  </div>
                )}

                {/* Modifications */}
                {localModifications.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-amber-600">将修改</p>
                    <div className="mt-2 space-y-2">
                      {localModifications.map((item, i) => {
                        const meta = getFieldMeta(item.field);
                        return (
                          <div key={i} className={`flex items-start gap-3 rounded-card border p-3 ${item.accepted ? "border-seal-200 bg-seal-50/40" : "border-amber-100 bg-[#fefcf5]"}`}>
                            <span className={`mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium shrink-0 ${item.accepted ? meta.colors.accepted : meta.colors.normal}`}>{meta.display}</span>
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
                              {item.accepted ? (
                                <span className="inline-flex items-center gap-1 rounded-button border border-seal-200 bg-seal-50 px-2 py-1 text-[10px] font-medium text-seal-600">
                                  <Check className="size-3" />已接受
                                </span>
                              ) : (
                                <>
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
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  </div>
                )}

                {localAdditions.length === 0 && localModifications.length === 0 && (
                  <p className="mt-4 text-sm text-ink-400">暂无待确认的画像更新</p>
                )}

                <div className="mt-5 flex flex-wrap gap-3 border-t border-paper-200 pt-4">
                  <button
                    onClick={handleConfirmProfile}
                    disabled={!selectedCreatorId || (!localAdditions.some((a) => a.accepted) && !localModifications.some((m) => m.accepted))}
                    className="inline-flex min-h-10 items-center gap-2 rounded-button bg-seal-500 px-4 text-sm font-medium text-paper-0 shadow-action disabled:opacity-50"
                  >
                    <Check className="size-4" />
                    确认写入创作者画像
                  </button>
                  <button
                    onClick={handleRegenerateProfile}
                    disabled={isRegeneratingProfile || !asset}
                    className="inline-flex min-h-10 items-center gap-2 rounded-button border border-paper-200 bg-paper-0 px-4 text-sm font-medium text-ink-800 hover:bg-paper-50 disabled:opacity-50"
                  >
                    {isRegeneratingProfile ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="size-4" />
                    )}
                    重新生成建议
                  </button>
                  <button
                    onClick={() => { setProfileDismissed(true); setLocalAdditions([]); setLocalModifications([]); }}
                    className="inline-flex min-h-10 items-center gap-2 rounded-button border border-paper-200 bg-paper-0 px-4 text-sm font-medium text-ink-800 hover:bg-paper-50"
                  >
                    不写入，仅用于本次任务
                  </button>
                </div>
              </div>

              {/* Profile Feedback */}
              {taskId && (
                <div className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquareText className="size-4 text-seal-500" />
                    <h2 className="font-editorial text-[24px] font-semibold">画像反馈</h2>
                    <span className="text-xs text-ink-400">输入反馈后系统会记录</span>
                  </div>

                  {task?.feedback && task.feedback.filter((fb) => fb.scope === "creator_profile").length > 0 && (
                    <div className="mb-4 space-y-2 max-h-48 overflow-y-auto">
                      {task.feedback
                        .filter((fb) => fb.scope === "creator_profile")
                        .map((fb, i) => (
                          <div key={i} className="rounded-card border border-paper-200 bg-paper-50 p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-ink-400">
                                {new Date(fb.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {fb.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {fb.tags.map((t: string) => (
                                    <span key={t} className="rounded-tag bg-seal-50 px-1.5 py-0.5 text-[10px] font-medium text-seal-600">{t}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {fb.message && <p className="mt-1 text-sm text-ink-700">{fb.message}</p>}
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
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-button bg-seal-500 px-4 text-sm font-medium text-paper-0 shadow-action"
                    >
                      发送
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Module 3: Draft Library */}
          {module === "drafts" && (
            <section className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
              <SectionTitle
                title="稿件库"
                description="该素材已生成的所有平台稿件"
              />

              {allDrafts.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="mx-auto size-8 text-ink-300" />
                  <p className="mt-3 text-sm text-ink-500">暂无稿件</p>
                  <p className="mt-1 text-xs text-ink-400">选择平台并生成后，稿件将出现在这里</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {allDrafts.map((draft) => {
                    const platformName = platformOptions.find((p) => p.key === draft.platform)?.name || draft.platform;
                    const isActive = draft.platform === selectedPlatform && draft.id === currentDraft?.id;
                    return (
                      <div
                        key={draft.id}
                        onClick={() => {
                          setSelectedPlatform(draft.platform);
                          setSelectedDraftId(draft.id);
                          setModule("content");
                        }}
                        className={`cursor-pointer rounded-card border p-4 transition-colors ${
                          isActive
                            ? "border-seal-500 bg-seal-50/40"
                            : "border-paper-200 bg-paper-50 hover:bg-paper-0"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="inline-block rounded-tag bg-seal-50 px-2 py-0.5 text-[10px] font-medium text-seal-600 mb-1">
                              {platformName}
                            </span>
                            <p className="text-sm font-medium text-ink-950 truncate">{draft.title}</p>
                          </div>
                          <span className="text-xs text-ink-400 shrink-0">
                            {new Date(draft.createdAt).toLocaleString("zh-CN", {
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-ink-600 line-clamp-2">{draft.content.slice(0, 120)}...</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}
