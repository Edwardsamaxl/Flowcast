"use client";

import { useState, useCallback } from "react";
import {
  Pencil, Plus, X,
  User, Lightbulb, BookOpen, Ban, Layers,
  Save, AlignLeft, Tag, ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SectionTitle } from "@/components/ui";
import { personas, sourceVideos, platformMeta } from "@/lib/data";
import type { Platform } from "@/lib/pipeline/types";
import { useCreators } from "@/lib/hooks/use-creators";
import { PlatformLogo } from "@/components/platform-logos";

type View = "profile" | "new" | "edit";

export default function LibraryPage() {
  const router = useRouter();
  const { createCreator, updateCreator } = useCreators();

  const [localPersonas, setLocalPersonas] = useState(personas);
  const [activePersonaId, setActivePersonaId] = useState(personas[0].id);
  const activePersona = localPersonas.find((p) => p.id === activePersonaId) || localPersonas[0];

  const [view, setView] = useState<View>("profile");

  const [editingRules, setEditingRules] = useState(false);
  const [ruleDraft, setRuleDraft] = useState<Record<Platform, string>>({ ...activePersona.platformRules });

  const [editDraft, setEditDraft] = useState({
    name: activePersona.name,
    positioning: activePersona.positioning,
    domain: activePersona.domain,
    tone: activePersona.tone.join(", "),
    beliefs: activePersona.beliefs.join("\n"),
    cases: activePersona.cases.join("\n"),
    patterns: activePersona.patterns.join("\n"),
    avoidPhrases: activePersona.avoidPhrases.join("\n"),
  });
  const [saving, setSaving] = useState(false);

  const [newDraft, setNewDraft] = useState({
    name: "",
    positioning: "",
    domain: "",
    tone: "",
    beliefs: "",
    cases: "",
    patterns: "",
    avoidPhrases: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const linkedMaterials = sourceVideos.filter((v) => v.deposited);

  const switchPersona = (id: string) => {
    setActivePersonaId(id);
    setView("profile");
    const p = localPersonas.find((x) => x.id === id);
    if (p) {
      setRuleDraft({ ...p.platformRules });
      setEditDraft({
        name: p.name,
        positioning: p.positioning,
        domain: p.domain,
        tone: p.tone.join(", "),
        beliefs: p.beliefs.join("\n"),
        cases: p.cases.join("\n"),
        patterns: p.patterns.join("\n"),
        avoidPhrases: p.avoidPhrases.join("\n"),
      });
    }
  };

  const enterEdit = () => {
    setEditDraft({
      name: activePersona.name,
      positioning: activePersona.positioning,
      domain: activePersona.domain,
      tone: activePersona.tone.join(", "),
      beliefs: activePersona.beliefs.join("\n"),
      cases: activePersona.cases.join("\n"),
      patterns: activePersona.patterns.join("\n"),
      avoidPhrases: activePersona.avoidPhrases.join("\n"),
    });
    setView("edit");
  };

  const cancelEdit = () => setView("profile");

  const saveEdit = useCallback(async () => {
    setSaving(true);
    try {
      const payload = {
        name: editDraft.name.trim(),
        positioning: editDraft.positioning,
        domain: editDraft.domain,
        tone: editDraft.tone.split(",").map((s) => s.trim()).filter(Boolean),
        beliefs: editDraft.beliefs.split("\n").map((s) => s.trim()).filter(Boolean),
        cases: editDraft.cases.split("\n").map((s) => s.trim()).filter(Boolean),
        commonPatterns: editDraft.patterns.split("\n").map((s) => s.trim()).filter(Boolean),
        avoidPhrases: editDraft.avoidPhrases.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      await updateCreator(activePersonaId, payload);
      setLocalPersonas((prev) =>
        prev.map((p) =>
          p.id === activePersonaId
            ? {
                ...p,
                name: payload.name,
                positioning: payload.positioning,
                domain: payload.domain,
                tone: payload.tone,
                beliefs: payload.beliefs,
                cases: payload.cases,
                patterns: payload.commonPatterns,
                avoidPhrases: payload.avoidPhrases,
              }
            : p
        )
      );
      setView("profile");
    } catch (err) {
      alert(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }, [editDraft, activePersonaId, updateCreator]);

  const handleCreate = useCallback(async () => {
    if (!newDraft.name.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createCreator({
        name: newDraft.name.trim(),
        positioning: newDraft.positioning,
        domain: newDraft.domain,
        tone: newDraft.tone.split(",").map((s) => s.trim()).filter(Boolean),
        beliefs: newDraft.beliefs.split("\n").map((s) => s.trim()).filter(Boolean),
        cases: newDraft.cases.split("\n").map((s) => s.trim()).filter(Boolean),
        commonPatterns: newDraft.patterns.split("\n").map((s) => s.trim()).filter(Boolean),
        avoidPhrases: newDraft.avoidPhrases.split("\n").map((s) => s.trim()).filter(Boolean),
        platformRules: Object.fromEntries(
          Object.entries(platformMeta).map(([k, v]) => [k, v.rule])
        ) as Record<string, string>,
      });
      const newId = "local-" + Date.now();
      const freshPersona = {
        id: newId,
        name: newDraft.name.trim(),
        status: "当前使用" as const,
        positioning: newDraft.positioning || "",
        domain: newDraft.domain || "",
        tone: newDraft.tone.split(",").map((s) => s.trim()).filter(Boolean),
        beliefs: newDraft.beliefs.split("\n").map((s) => s.trim()).filter(Boolean),
        cases: newDraft.cases.split("\n").map((s) => s.trim()).filter(Boolean),
        patterns: newDraft.patterns.split("\n").map((s) => s.trim()).filter(Boolean),
        avoidPhrases: newDraft.avoidPhrases.split("\n").map((s) => s.trim()).filter(Boolean),
        titlePreference: "",
        platformRules: Object.fromEntries(
          Object.entries(platformMeta).map(([k, v]) => [k, v.rule])
        ) as Record<Platform, string>,
      };
      setLocalPersonas((prev) => [...prev, freshPersona]);
      setActivePersonaId(newId);
      setView("profile");
      setNewDraft({ name: "", positioning: "", domain: "", tone: "", beliefs: "", cases: "", patterns: "", avoidPhrases: "" });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setCreating(false);
    }
  }, [newDraft, createCreator]);

  const cancelNew = () => {
    setView("profile");
    setCreateError(null);
  };

  const dimensionCount =
    (activePersona.positioning ? 1 : 0) +
    activePersona.beliefs.length +
    activePersona.cases.length +
    activePersona.patterns.length +
    activePersona.avoidPhrases.length;

  return (
    <AppShell
      eyebrow="资产库"
      title="创作者档案"
      description="管理创作者画像、查看素材关联、调整平台规则。素材上传与画像更新请在流转工作台完成。"
    >
      <div className="grid gap-6 xl:grid-cols-[380px_1fr] items-start">
        {/* ====== Left Column ====== */}
        <aside className="space-y-4">
          {/* Creator Switcher */}
          <section className="rounded-card border border-paper-200 bg-paper-0 p-4 shadow-sheet">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">当前创作者</p>
                <select
                  className="mt-1.5 h-9 w-full rounded-button border border-paper-200 bg-paper-0 px-2.5 text-sm text-ink-800 outline-none focus-visible:border-seal-500"
                  value={activePersonaId}
                  onChange={(e) => switchPersona(e.target.value)}
                >
                  {localPersonas.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => { setView("new"); setCreateError(null); }}
                className="mt-5 inline-flex h-9 items-center gap-1 rounded-button border border-paper-200 bg-paper-0 px-3 text-xs font-medium text-ink-800 hover:bg-paper-50"
              >
                <Plus className="size-3.5" />
                新建
              </button>
            </div>
          </section>

          {/* Identity Card */}
          <section className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-seal-50 text-seal-600">
                <User className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold leading-tight text-ink-950">{activePersona.name}</h2>
                <p className="mt-1 text-xs leading-5 text-ink-500">{activePersona.positioning || "暂无定位描述"}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {activePersona.domain && (
                <span className="rounded-tag bg-paper-50 px-2 py-0.5 text-[10px] font-medium text-ink-500">{activePersona.domain}</span>
              )}
              {activePersona.tone.map((t) => (
                <span key={t} className="rounded-tag bg-seal-50 px-2 py-0.5 text-[10px] font-medium text-seal-600">{t}</span>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-card bg-paper-50 p-2.5 text-center">
                <p className="text-lg font-semibold text-ink-950">{linkedMaterials.length}</p>
                <p className="text-[10px] text-ink-400">关联素材</p>
              </div>
              <div className="rounded-card bg-paper-50 p-2.5 text-center">
                <p className="text-lg font-semibold text-ink-950">{dimensionCount}</p>
                <p className="text-[10px] text-ink-400">画像维度</p>
              </div>
              <div className="rounded-card bg-paper-50 p-2.5 text-center">
                <p className="text-lg font-semibold text-ink-950">{Object.keys(activePersona.platformRules).length}</p>
                <p className="text-[10px] text-ink-400">平台规则</p>
              </div>
            </div>

            {/* Completion hint */}
            {dimensionCount < 6 && (
              <div className="mt-4 rounded-card bg-paper-50 p-3">
                <p className="text-[10px] font-medium text-ink-400">画像完整度</p>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-paper-200">
                  <div
                    className="h-1.5 rounded-full bg-seal-500 transition-all"
                    style={{ width: `${Math.min(100, (dimensionCount / 10) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-ink-400">{dimensionCount} / 10 个维度已完善</p>
              </div>
            )}
          </section>

          {/* Formation Timeline */}
          <section className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">画像形成历程</p>
            <div className="mt-3 space-y-0">
              {linkedMaterials.length === 0 ? (
                <p className="py-4 text-center text-xs text-ink-400">暂无已归档素材</p>
              ) : (
                linkedMaterials.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => router.push(`/create?assetId=${item.id}`)}
                    className="relative flex w-full gap-3 pb-4 text-left last:pb-0 group"
                  >
                    {idx !== linkedMaterials.length - 1 && (
                      <div className="absolute left-[7px] top-5 bottom-0 w-px bg-paper-200" />
                    )}
                    <div className="relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-seal-500 bg-paper-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-ink-800 truncate">{item.title}</p>
                      <p className="mt-0.5 text-[10px] text-ink-400">
                        {item.candidates.length > 0 ? `贡献了 ${item.candidates.length} 个候选` : "已归档"}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 size-3.5 shrink-0 text-ink-300 group-hover:text-seal-500 transition-colors" />
                  </button>
                ))
              )}
            </div>
          </section>
        </aside>

        {/* ====== Right Column ====== */}
        <div className="space-y-6">
          {view === "profile" && (
            <>
              {/* Profile Detail */}
              <section className="rounded-card border border-paper-200 bg-paper-0 p-2 shadow-sheet">
                <div className="rounded-[8px] bg-paper-0 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <SectionTitle title="创作者画像" description="由流转工作台确认的素材累积形成，反映创作者的长期表达特征。" />
                    <button
                      onClick={enterEdit}
                      className="inline-flex h-8 items-center gap-1.5 rounded-button bg-seal-500 px-3 text-xs font-medium text-paper-0 hover:bg-seal-600"
                    >
                      <Pencil className="size-3.5" />
                      编辑档案
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4">
                    {/* Positioning */}
                    <div className="rounded-card border border-paper-200 bg-paper-50 p-4">
                      <div className="flex items-center gap-2">
                        <AlignLeft className="size-4 text-ink-400" />
                        <span className="text-sm font-medium text-ink-950">定位</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-ink-800">{activePersona.positioning || "未设置"}</p>
                    </div>

                    {/* Domain + Tone */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-card border border-paper-200 bg-paper-50 p-4">
                        <div className="flex items-center gap-2">
                          <Tag className="size-4 text-ink-400" />
                          <span className="text-sm font-medium text-ink-950">领域</span>
                        </div>
                        <p className="mt-2 text-sm text-ink-800">{activePersona.domain || "未设置"}</p>
                      </div>
                      <div className="rounded-card border border-paper-200 bg-paper-50 p-4">
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-ink-400" />
                          <span className="text-sm font-medium text-ink-950">语气</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {activePersona.tone.length > 0 ? activePersona.tone.map((t) => (
                            <span key={t} className="rounded-tag bg-seal-50 px-2 py-0.5 text-xs font-medium text-seal-600">{t}</span>
                          )) : <span className="text-sm text-ink-400">未设置</span>}
                        </div>
                      </div>
                    </div>

                    {/* Beliefs */}
                    <div className="rounded-card border border-paper-200 bg-paper-50 p-4">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="size-4 text-ink-400" />
                        <span className="text-sm font-medium text-ink-950">高频观点</span>
                        <span className="rounded-tag bg-paper-0 px-1.5 py-0.5 text-[10px] text-ink-400">{activePersona.beliefs.length}</span>
                      </div>
                      {activePersona.beliefs.length > 0 ? (
                        <ol className="mt-3 space-y-2">
                          {activePersona.beliefs.map((b, i) => (
                            <li key={b} className="flex gap-2.5 text-sm leading-6 text-ink-800">
                              <span className="mt-0.5 shrink-0 font-mono text-[10px] tabular text-ink-400">{String(i + 1).padStart(2, "0")}</span>
                              {b}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="mt-2 text-sm text-ink-400">未设置</p>
                      )}
                    </div>

                    {/* Cases + Patterns */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-card border border-paper-200 bg-paper-50 p-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="size-4 text-ink-400" />
                          <span className="text-sm font-medium text-ink-950">常用案例</span>
                          <span className="rounded-tag bg-paper-0 px-1.5 py-0.5 text-[10px] text-ink-400">{activePersona.cases.length}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {activePersona.cases.length > 0 ? activePersona.cases.map((c) => (
                            <span key={c} className="rounded-tag bg-paper-0 px-2 py-0.5 text-xs text-ink-800">{c}</span>
                          )) : <span className="text-sm text-ink-400">未设置</span>}
                        </div>
                      </div>
                      <div className="rounded-card border border-paper-200 bg-paper-50 p-4">
                        <div className="flex items-center gap-2">
                          <Layers className="size-4 text-ink-400" />
                          <span className="text-sm font-medium text-ink-950">常用结构</span>
                          <span className="rounded-tag bg-paper-0 px-1.5 py-0.5 text-[10px] text-ink-400">{activePersona.patterns.length}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {activePersona.patterns.length > 0 ? activePersona.patterns.map((p) => (
                            <span key={p} className="rounded-tag bg-paper-0 px-2 py-0.5 text-xs text-ink-800">{p}</span>
                          )) : <span className="text-sm text-ink-400">未设置</span>}
                        </div>
                      </div>
                    </div>

                    {/* Avoid Phrases */}
                    <div className="rounded-card border border-paper-200 bg-paper-50 p-4">
                      <div className="flex items-center gap-2">
                        <Ban className="size-4 text-ink-400" />
                        <span className="text-sm font-medium text-ink-950">禁用表达</span>
                        <span className="rounded-tag bg-paper-0 px-1.5 py-0.5 text-[10px] text-ink-400">{activePersona.avoidPhrases.length}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {activePersona.avoidPhrases.length > 0 ? activePersona.avoidPhrases.map((a) => (
                          <span key={a} className="rounded-tag bg-paper-50 px-2 py-0.5 text-xs text-ink-600 line-through decoration-ink-300">{a}</span>
                        )) : <span className="text-sm text-ink-400">未设置</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Platform Rules */}
              <section className="rounded-card border border-paper-200 bg-paper-0 p-2 shadow-sheet">
                <div className="rounded-[8px] bg-paper-0 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <SectionTitle title="平台写法规则" description="规则可编辑，生成时与创作者画像一起调用。" />
                    <button
                      onClick={() => {
                        if (!editingRules) setRuleDraft({ ...activePersona.platformRules });
                        setEditingRules((v) => !v);
                      }}
                      className={`inline-flex h-8 items-center gap-1.5 rounded-button px-3 text-xs font-medium ${
                        editingRules ? "bg-seal-500 text-paper-0" : "border border-paper-200 bg-paper-0 text-ink-800 hover:bg-paper-50"
                      }`}
                    >
                      <Pencil className="size-3.5" />
                      {editingRules ? "完成" : "编辑"}
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {(Object.keys(platformMeta) as Platform[]).map((key) => {
                      const meta = platformMeta[key];
                      const rule = editingRules ? ruleDraft[key] : (activePersona.platformRules[key] || meta.rule);
                      return (
                        <article key={key} className="rounded-card border border-paper-200 bg-paper-50 p-4">
                          <div className="flex items-center gap-2">
                            <PlatformLogo platform={key} className="size-4" />
                            <h3 className="text-sm font-medium text-ink-950">{meta.name}</h3>
                          </div>
                          {editingRules ? (
                            <textarea
                              className="mt-2 w-full min-h-[60px] resize-none rounded-card border border-paper-200 bg-paper-0 p-3 text-sm leading-6 outline-none focus-visible:border-seal-500"
                              value={rule}
                              onChange={(e) => setRuleDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                            />
                          ) : (
                            <p className="mt-2 text-sm leading-6 text-ink-600">{rule}</p>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </div>
              </section>
            </>
          )}

          {view === "edit" && (
            <section className="rounded-card border border-paper-200 bg-paper-0 p-2 shadow-sheet">
              <div className="rounded-[8px] bg-paper-0 p-5">
                <div className="flex items-center justify-between gap-2">
                  <SectionTitle title="编辑档案" description="修改后保存将直接更新创作者画像。" />
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEdit}
                      className="inline-flex h-8 items-center gap-1 rounded-button border border-paper-200 bg-paper-0 px-3 text-xs font-medium text-ink-800 hover:bg-paper-50"
                    >
                      <X className="size-3.5" />
                      取消
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={saving || !editDraft.name.trim()}
                      className="inline-flex h-8 items-center gap-1 rounded-button bg-seal-500 px-3 text-xs font-medium text-paper-0 hover:bg-seal-600 disabled:opacity-50"
                    >
                      <Save className="size-3.5" />
                      {saving ? "保存中..." : "保存"}
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="名称" value={editDraft.name} onChange={(v) => setEditDraft((d) => ({ ...d, name: v }))} />
                    <FormField label="领域" value={editDraft.domain} onChange={(v) => setEditDraft((d) => ({ ...d, domain: v }))} />
                  </div>
                  <FormField label="定位" value={editDraft.positioning} onChange={(v) => setEditDraft((d) => ({ ...d, positioning: v }))} />
                  <FormField label="语气特征（逗号分隔）" value={editDraft.tone} onChange={(v) => setEditDraft((d) => ({ ...d, tone: v }))} />
                  <FormField label="高频观点（每行一条）" value={editDraft.beliefs} onChange={(v) => setEditDraft((d) => ({ ...d, beliefs: v }))} textarea />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="常用案例（每行一个）" value={editDraft.cases} onChange={(v) => setEditDraft((d) => ({ ...d, cases: v }))} textarea />
                    <FormField label="常用结构（每行一个）" value={editDraft.patterns} onChange={(v) => setEditDraft((d) => ({ ...d, patterns: v }))} textarea />
                  </div>
                  <FormField label="禁用表达（每行一个）" value={editDraft.avoidPhrases} onChange={(v) => setEditDraft((d) => ({ ...d, avoidPhrases: v }))} textarea />
                </div>
              </div>
            </section>
          )}

          {view === "new" && (
            <section className="rounded-card border border-paper-200 bg-paper-0 p-2 shadow-sheet">
              <div className="rounded-[8px] bg-paper-0 p-5">
                <div className="flex items-center justify-between gap-2">
                  <SectionTitle title="新建创作者" description="填写基本信息和画像维度，创建后即可在流转工作台使用。" />
                  <div className="flex gap-2">
                    <button
                      onClick={cancelNew}
                      className="inline-flex h-8 items-center gap-1 rounded-button border border-paper-200 bg-paper-0 px-3 text-xs font-medium text-ink-800 hover:bg-paper-50"
                    >
                      <X className="size-3.5" />
                      取消
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={creating || !newDraft.name.trim()}
                      className="inline-flex h-8 items-center gap-1 rounded-button bg-seal-500 px-3 text-xs font-medium text-paper-0 hover:bg-seal-600 disabled:opacity-50"
                    >
                      <Plus className="size-3.5" />
                      {creating ? "创建中..." : "创建"}
                    </button>
                  </div>
                </div>

                {createError && (
                  <div className="mt-4 rounded-card border border-red-200 bg-red-50 p-3 text-xs text-red-700">{createError}</div>
                )}

                <div className="mt-5 grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="名称 *" value={newDraft.name} onChange={(v) => setNewDraft((d) => ({ ...d, name: v }))} />
                    <FormField label="领域" value={newDraft.domain} onChange={(v) => setNewDraft((d) => ({ ...d, domain: v }))} />
                  </div>
                  <FormField label="定位（一句话描述）" value={newDraft.positioning} onChange={(v) => setNewDraft((d) => ({ ...d, positioning: v }))} />
                  <FormField label="语气特征（逗号分隔）" value={newDraft.tone} onChange={(v) => setNewDraft((d) => ({ ...d, tone: v }))} placeholder="直接, 温和, 有经验感" />
                  <FormField label="高频观点（每行一条）" value={newDraft.beliefs} onChange={(v) => setNewDraft((d) => ({ ...d, beliefs: v }))} textarea />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="常用案例（每行一个）" value={newDraft.cases} onChange={(v) => setNewDraft((d) => ({ ...d, cases: v }))} textarea />
                    <FormField label="常用结构（每行一个）" value={newDraft.patterns} onChange={(v) => setNewDraft((d) => ({ ...d, patterns: v }))} textarea />
                  </div>
                  <FormField label="禁用表达（每行一个）" value={newDraft.avoidPhrases} onChange={(v) => setNewDraft((d) => ({ ...d, avoidPhrases: v }))} textarea />
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function FormField({
  label,
  value,
  onChange,
  textarea = false,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {
  const inputClass =
    "w-full rounded-button border border-paper-200 bg-paper-0 px-3 py-2 text-sm outline-none focus-visible:border-seal-500";
  return (
    <div>
      <label className="text-xs font-medium text-ink-400">{label}</label>
      {textarea ? (
        <textarea
          className={`${inputClass} mt-1 min-h-[80px] resize-none leading-6`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={`${inputClass} mt-1 h-9`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
