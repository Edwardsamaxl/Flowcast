"use client";

import { useState, useRef, useCallback } from "react";
import { CheckCircle2, FileText, UploadCloud, Pencil, Plus, X, ChevronDown, ChevronUp, Loader2, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionTitle } from "@/components/ui";
import { personas, sourceVideos, platformMeta } from "@/lib/data";
import type { Platform } from "@/lib/pipeline/types";
import { useAssets } from "@/lib/hooks/use-assets";
import { useCreators } from "@/lib/hooks/use-creators";

export default function LibraryPage() {
  // ---- Mock data as display base (merged with API data later) ----
  const [localVideos, setLocalVideos] = useState(sourceVideos);
  const [localPersonas, setLocalPersonas] = useState(personas);

  // ---- API hooks for operations ----
  const { uploadAsset, processAsset } = useAssets();
  const { createCreator } = useCreators();

  // ---- Active creator ----
  const [activePersonaId, setActivePersonaId] = useState(personas[0].id);
  const activePersona = localPersonas.find((p) => p.id === activePersonaId) || localPersonas[0];

  // ---- Platform rules editing ----
  const [editingRules, setEditingRules] = useState(false);
  const [editingPlatformRules, setEditingPlatformRules] = useState<Record<Platform, string>>(
    { ...activePersona.platformRules }
  );

  // ---- New creator form ----
  const [showNewCreator, setShowNewCreator] = useState(false);
  const [newCreator, setNewCreator] = useState({
    name: "",
    positioning: "",
    domain: "",
    tone: "",
    beliefs: "",
    avoidPhrases: "",
    titlePreference: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // ---- Material expand ----
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);

  // ---- Upload ----
  const [uploading, setUploading] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setProcessingStage("上传中...");

    try {
      const asset = await uploadAsset(file, { type: "video", title: file.name });
      setProcessingStage("转写与解析中（约需 1-3 分钟）...");
      // processAsset returns the raw API response shape, not the Asset type
      const result = await processAsset(asset.id) as unknown as {
        transcript: string;
        analysis: { topic: string; summary: string; core_points: Array<{ point: string; evidence: string }>; cases: string[]; quotes: string[]; content_angles: string[]; risk_notes: string[] };
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setLocalVideos((prev: any) => [{
        id: asset.id,
        title: asset.title,
        source: asset.source || "本地上传",
        duration: "",
        status: "已解析，待确认" as const,
        libraryState: "待写入画像" as const,
        deposited: false,
        excerpt: result.analysis?.summary || asset.title,
        signals: [] as string[],
        candidates: result.analysis?.cases || [],
        transcriptText: result.transcript || "",
        corePoints: result.analysis?.core_points || [],
      }, ...prev]);
      setUploading(false);
      setProcessingStage("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setUploading(false);
      setProcessingStage("");
      setUploadError(err instanceof Error ? err.message : "上传或处理失败");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [uploadAsset, processAsset]);

  // ---- Create creator ----
  const handleCreateCreator = useCallback(async () => {
    if (!newCreator.name.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createCreator({
        name: newCreator.name.trim(),
        positioning: newCreator.positioning,
        domain: newCreator.domain,
        tone: newCreator.tone ? newCreator.tone.split(",").map((s) => s.trim()).filter(Boolean) : [],
        beliefs: newCreator.beliefs ? newCreator.beliefs.split("\n").map((s) => s.trim()).filter(Boolean) : [],
        cases: [],
        commonPatterns: [],
        avoidPhrases: [],
        titlePreference: "",
        platformRules: {} as Record<string, string>,
      });
      // Add to local list
      const newId = "local-" + Date.now();
      setLocalPersonas((prev) => [...prev, {
        id: newId,
        name: newCreator.name.trim(),
        status: "当前使用" as const,
        positioning: newCreator.positioning || "",
        domain: newCreator.domain || "",
        tone: newCreator.tone ? newCreator.tone.split(",").map((s) => s.trim()).filter(Boolean) : [],
        beliefs: newCreator.beliefs ? newCreator.beliefs.split("\n").map((s) => s.trim()).filter(Boolean) : [],
        cases: [],
        patterns: [],
        avoidPhrases: [],
        titlePreference: "",
        platformRules: { ...activePersona.platformRules },
      }]);
      setActivePersonaId(newId);
      setShowNewCreator(false);
      setNewCreator({ name: "", positioning: "", domain: "", tone: "", beliefs: "", avoidPhrases: "", titlePreference: "" });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "创建失败，请检查后台服务是否运行。");
    } finally {
      setCreating(false);
    }
  }, [newCreator, createCreator, activePersona.platformRules]);

  return (
    <AppShell
      eyebrow="资产库"
      title="管理创作者画像"
      description="上传视频后先解析，不自动写入创作者画像。用户确认候选观点、语气和结构后，才会更新当前创作者资产。"
    >
      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        {/* ====== Left Column ====== */}
        <div className="space-y-6">
          {/* Upload */}
          <section className="rounded-card border border-paper-200 bg-paper-0 p-2 shadow-sheet">
            <div className="rounded-[8px] bg-paper-0 p-5">
              <SectionTitle
                kicker="画像素材"
                title="上传视频并解析为画像候选"
                description="这里的上传目的是建立或更新某位创作者的长期表达资产。默认只解析，等待用户确认写入。"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-4 flex min-h-36 w-full flex-col items-center justify-center rounded-card border border-dashed border-paper-200 bg-paper-50 px-4 text-center transition-[background-color,transform] duration-300 active:scale-[0.98] hover:bg-paper-0 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="size-7 animate-spin text-seal-500" />
                    <span className="mt-3 text-sm font-medium">{processingStage || "正在上传..."}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-7 text-seal-500" />
                    <span className="mt-3 text-sm font-medium">拖入视频或点击上传</span>
                    <span className="mt-1 text-xs text-ink-400">上传后自动转写和解析，不会自动写入画像</span>
                  </>
                )}
              </button>
              {uploadError && (
                <div className="mt-3 flex items-center gap-2 rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertTriangle className="size-4 shrink-0" />
                  {uploadError}
                </div>
              )}
            </div>
          </section>

          {/* Material List */}
          <section className="rounded-card border border-paper-200 bg-paper-0 p-2 shadow-sheet">
            <div className="rounded-[8px] bg-paper-0 p-5">
              <SectionTitle title="素材列表" description="上传的视频解析后会出现在这里。点击素材可查看转写文本和核心观点。" />
              <div className="mt-4 space-y-3">
                {localVideos.length === 0 ? (
                  <p className="py-8 text-center text-sm text-ink-400">还没有上传素材，上传视频开始构建创作者画像。</p>
                ) : (
                  localVideos.map((item) => {
                    const expanded = expandedMaterial === item.id;
                    return (
                      <article key={item.id} className="rounded-card border border-paper-200 bg-paper-50 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h2 className="text-lg font-semibold text-ink-950">{item.title}</h2>
                            <p className="mt-1 text-xs text-ink-400">{item.source} / {item.duration}</p>
                          </div>
                          <span className={`rounded-tag px-2.5 py-1 text-xs font-medium ${
                            item.deposited ? "bg-sage-50 text-sage-600" : "bg-seal-50 text-seal-600"
                          }`}>
                            {item.libraryState}
                          </span>
                        </div>
                        <p className="mt-4 text-sm leading-7 text-ink-600">{item.excerpt}</p>

                        {/* Candidates */}
                        {item.candidates.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {item.candidates.map((c) => (
                              <span key={c} className="rounded-tag bg-paper-0 px-2.5 py-1 text-xs text-ink-800">{c}</span>
                            ))}
                          </div>
                        )}

                        {/* Expand: view transcript + core points */}
                        {"transcriptText" in item && item.transcriptText && (
                          <>
                            <button
                              onClick={() => setExpandedMaterial(expanded ? null : item.id)}
                              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-seal-500 hover:text-seal-600"
                            >
                              {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                              {expanded ? "收起转写文本" : "查看转写文本"}
                            </button>

                            {expanded && (
                              <div className="mt-3 rounded-card border border-paper-200 bg-paper-0 p-4">
                                <p className="text-xs font-medium text-ink-400 mb-2">转写全文</p>
                                <p className="text-sm leading-7 text-ink-700 whitespace-pre-line">{item.transcriptText}</p>

                                {"corePoints" in item && (item.corePoints as Array<{point: string; evidence: string}>).length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-paper-200">
                                    <p className="text-xs font-medium text-ink-400 mb-2">提取的核心观点</p>
                                    <ul className="space-y-2">
                                      {(item.corePoints as Array<{point: string; evidence: string}>).map((cp, i) => (
                                        <li key={i} className="text-sm text-ink-700">
                                          <span className="font-medium">{cp.point}</span>
                                          <span className="text-ink-400"> — {cp.evidence}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* Actions */}
                        <div className="mt-5 flex flex-wrap gap-2">
                          <button className="inline-flex min-h-10 items-center gap-2 rounded-button border border-paper-200 bg-paper-0 px-4 text-sm font-medium text-ink-800 hover:bg-paper-50">
                            <FileText className="size-4" />
                            预览画像变化
                          </button>
                          {!item.deposited && (
                            <button className="inline-flex min-h-10 items-center gap-2 rounded-button bg-seal-500 px-4 text-sm font-medium text-paper-0 shadow-action hover:bg-seal-600">
                              <CheckCircle2 className="size-4" />
                              写入当前创作者画像
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>

        {/* ====== Right Column ====== */}
        <aside className="space-y-6">
          {/* Creator Selector + Profile (merged into one card) */}
          <section className="rounded-card border border-paper-200 bg-paper-0 p-2 shadow-sheet">
            <div className="rounded-[8px] bg-paper-0 p-5">
              {/* Header: selector + new button */}
              <div className="flex items-center justify-between gap-2 border-b border-paper-200 pb-4">
                <div>
                  <p className="text-xs font-medium text-seal-500">当前创作者</p>
                  <select
                    className="mt-2 h-10 w-full min-w-[200px] rounded-button border border-paper-200 bg-paper-0 px-3 text-sm text-ink-800 outline-none focus-visible:border-seal-500"
                    value={activePersonaId}
                    onChange={(e) => {
                      setActivePersonaId(e.target.value);
                      const p = localPersonas.find((x) => x.id === e.target.value);
                      if (p) setEditingPlatformRules({ ...p.platformRules });
                    }}
                  >
                    {localPersonas.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => { setShowNewCreator(true); setCreateError(null); }}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-button border border-paper-200 bg-paper-0 px-3 text-xs font-medium text-ink-800 hover:bg-paper-50"
                >
                  <Plus className="size-3.5" />
                  新建创作者
                </button>
              </div>

              {/* New creator inline form */}
              {showNewCreator && (
                <div className="mt-4 rounded-card border border-seal-500/20 bg-seal-50 p-4">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <p className="text-sm font-medium text-ink-950">新建创作者</p>
                    <button onClick={() => setShowNewCreator(false)}>
                      <X className="size-4 text-ink-400" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      className="h-9 w-full rounded-button border border-paper-200 bg-paper-0 px-3 text-sm outline-none focus-visible:border-seal-500"
                      placeholder="创作者名称 *"
                      value={newCreator.name}
                      onChange={(e) => setNewCreator((p) => ({ ...p, name: e.target.value }))}
                    />
                    <input
                      className="h-9 w-full rounded-button border border-paper-200 bg-paper-0 px-3 text-sm outline-none focus-visible:border-seal-500"
                      placeholder="人设定位（一句话描述）"
                      value={newCreator.positioning}
                      onChange={(e) => setNewCreator((p) => ({ ...p, positioning: e.target.value }))}
                    />
                    <input
                      className="h-9 w-full rounded-button border border-paper-200 bg-paper-0 px-3 text-sm outline-none focus-visible:border-seal-500"
                      placeholder="领域（如：考研 / 学习方法）"
                      value={newCreator.domain}
                      onChange={(e) => setNewCreator((p) => ({ ...p, domain: e.target.value }))}
                    />
                    <input
                      className="h-9 w-full rounded-button border border-paper-200 bg-paper-0 px-3 text-sm outline-none focus-visible:border-seal-500"
                      placeholder="语气特征（逗号分隔，如：直接, 温和, 有经验感）"
                      value={newCreator.tone}
                      onChange={(e) => setNewCreator((p) => ({ ...p, tone: e.target.value }))}
                    />
                    {createError && (
                      <p className="text-xs text-red-600">{createError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowNewCreator(false)}
                        className="inline-flex min-h-9 items-center rounded-button border border-paper-200 bg-paper-0 px-4 text-xs font-medium text-ink-800"
                      >
                        取消
                      </button>
                      <button
                        disabled={!newCreator.name.trim() || creating}
                        onClick={handleCreateCreator}
                        className="inline-flex min-h-9 items-center rounded-button bg-seal-500 px-4 text-xs font-medium text-paper-0 disabled:opacity-50"
                      >
                        {creating ? "创建中..." : "创建创作者"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Creator Profile Dimensions */}
              <div className="mt-5 grid gap-5">
                {/* Name + Positioning */}
                <div>
                  <h2 className="font-editorial text-[28px] font-semibold leading-tight text-ink-950">{activePersona.name}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-ink-600">{activePersona.positioning}</p>
                </div>

                {/* Domain */}
                {"domain" in activePersona && activePersona.domain && (
                  <ProfileBlock title="领域">
                    <p className="text-sm text-ink-800">{activePersona.domain}</p>
                  </ProfileBlock>
                )}

                {/* Tone */}
                <ProfileBlock title="语气特征">
                  <div className="flex flex-wrap gap-2">
                    {activePersona.tone.map((t) => (
                      <span key={t} className="rounded-tag bg-seal-50 px-2.5 py-1 text-xs font-medium text-seal-600">{t}</span>
                    ))}
                  </div>
                </ProfileBlock>

                {/* Beliefs */}
                <ProfileBlock title="高频观点">
                  <ol className="space-y-2">
                    {activePersona.beliefs.map((b, i) => (
                      <li key={b} className="flex gap-3 text-sm leading-6 text-ink-800">
                        <span className="mt-0.5 shrink-0 font-mono text-xs tabular text-ink-400">{String(i + 1).padStart(2, "0")}</span>
                        {b}
                      </li>
                    ))}
                  </ol>
                </ProfileBlock>

                {/* Cases + Patterns */}
                <div className="grid gap-4 md:grid-cols-2">
                  <ProfileBlock title="常用案例">
                    <div className="flex flex-wrap gap-2">
                      {activePersona.cases.map((c) => (
                        <span key={c} className="rounded-tag bg-paper-50 px-2.5 py-1 text-xs text-ink-800">{c}</span>
                      ))}
                    </div>
                  </ProfileBlock>
                  <ProfileBlock title="常用结构">
                    <div className="flex flex-wrap gap-2">
                      {activePersona.patterns.map((p) => (
                        <span key={p} className="rounded-tag bg-paper-50 px-2.5 py-1 text-xs text-ink-800">{p}</span>
                      ))}
                    </div>
                  </ProfileBlock>
                </div>

                {/* Title preference */}
                <ProfileBlock title="标题偏好">
                  <p className="text-sm text-ink-800">{activePersona.titlePreference}</p>
                </ProfileBlock>

                {/* Avoid phrases */}
                <ProfileBlock title="禁用表达">
                  <div className="flex flex-wrap gap-2">
                    {activePersona.avoidPhrases.map((a) => (
                      <span key={a} className="rounded-tag bg-paper-50 px-2.5 py-1 text-xs text-ink-600 line-through decoration-ink-300">{a}</span>
                    ))}
                  </div>
                </ProfileBlock>

                {/* Edit button */}
                <button className="inline-flex min-h-9 items-center gap-1.5 self-start rounded-button bg-seal-500 px-3 text-xs font-medium text-paper-0 hover:bg-seal-600">
                  <Pencil className="size-3.5" />
                  编辑档案
                </button>
              </div>
            </div>
          </section>

          {/* Platform Writing Rules */}
          <section className="rounded-card border border-paper-200 bg-paper-0 p-6 shadow-sheet">
            <div className="flex items-center justify-between gap-2">
              <SectionTitle title="平台写法规则" description="规则可编辑，生成时与创作者画像一起调用。" />
              <button
                onClick={() => {
                  if (!editingRules) setEditingPlatformRules({ ...activePersona.platformRules });
                  setEditingRules((v) => !v);
                }}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-button px-3 text-xs font-medium ${
                  editingRules
                    ? "bg-seal-500 text-paper-0"
                    : "border border-paper-200 bg-paper-0 text-ink-800 hover:bg-paper-50"
                }`}
              >
                <Pencil className="size-3.5" />
                {editingRules ? "完成编辑" : "编辑规则"}
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              {(Object.keys(platformMeta) as Platform[]).map((key) => {
                const meta = platformMeta[key];
                const rule = editingRules ? editingPlatformRules[key] : (activePersona.platformRules[key] || meta.rule);
                return (
                  <article key={key} className="rounded-card border border-paper-200 bg-paper-50 p-4">
                    <div className="flex items-center gap-2">
                      <meta.icon className="size-4 text-seal-500" />
                      <h3 className="text-sm font-medium text-ink-950">{meta.name}</h3>
                    </div>
                    {editingRules ? (
                      <textarea
                        className="mt-2 w-full min-h-[60px] resize-none rounded-card border border-paper-200 bg-paper-0 p-3 text-sm leading-6 outline-none focus-visible:border-seal-500"
                        value={rule}
                        onChange={(e) => setEditingPlatformRules((prev) => ({ ...prev, [key]: e.target.value }))}
                      />
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-ink-600">{rule}</p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

function ProfileBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-ink-400">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
