"use client";

import { useState, useRef } from "react";
import { CheckCircle2, FileText, UploadCloud, Pencil, Plus, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionTitle } from "@/components/ui";
import { personas, sourceVideos, platformMeta } from "@/lib/data";
import type { Platform } from "@/lib/pipeline/types";

export default function LibraryPage() {
  // Mock creator profile (from data.ts)
  const [activePersonaId, setActivePersonaId] = useState(personas[0].id);
  const activePersona = personas.find((p) => p.id === activePersonaId) || personas[0];

  // Editable platform rules
  const [editingRules, setEditingRules] = useState(false);
  const [platformRules, setPlatformRules] = useState<Record<Platform, string>>(
    { ...activePersona.platformRules }
  );

  // New creator modal
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

  // Expanded material (for viewing transcript)
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);

  // Upload
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <AppShell
      eyebrow="资产库"
      title="管理创作者画像"
      description="上传视频后先解析，不自动写入创作者画像。用户确认候选观点、语气和结构后，才会更新当前创作者资产。"
    >
      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        {/* ====== Left: Material List ====== */}
        <section className="space-y-6">
          {/* Upload */}
          <div className="rounded-card border border-paper-200 bg-paper-0 p-2 shadow-sheet">
            <div className="rounded-[8px] bg-paper-0 p-5">
              <SectionTitle
                kicker="画像素材"
                title="上传视频并解析为画像候选"
                description="这里的上传目的是建立或更新某位创作者的长期表达资产。默认只解析，等待用户确认写入。"
              />
              <input ref={fileInputRef} type="file" accept="video/*" className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-4 flex min-h-36 w-full flex-col items-center justify-center rounded-card border border-dashed border-paper-200 bg-paper-50 px-4 text-center transition-[background-color,transform] duration-300 active:scale-[0.98] hover:bg-paper-0 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="size-7 animate-spin text-seal-500" />
                    <span className="mt-3 text-sm font-medium">正在上传...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-7 text-seal-500" />
                    <span className="mt-3 text-sm font-medium">拖入视频或点击上传</span>
                    <span className="mt-1 text-xs text-ink-400">上传后进入转写和解析，不会自动写入画像</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Material List */}
          <div>
            <SectionTitle title="素材列表" description="点击素材可查看转写文本和可写入候选项。" />
            <div className="space-y-3">
              {sourceVideos.map((item) => {
                const expanded = expandedMaterial === item.id;
                return (
                  <article key={item.id} className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
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
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.candidates.map((c) => (
                        <span key={c} className="rounded-tag bg-paper-50 px-2.5 py-1 text-xs text-ink-800">{c}</span>
                      ))}
                    </div>

                    {/* Expand: view transcript + core points */}
                    <button
                      onClick={() => setExpandedMaterial(expanded ? null : item.id)}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-seal-500 hover:text-seal-600"
                    >
                      {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                      {expanded ? "收起转写文本" : "查看转写文本"}
                    </button>

                    {expanded && "transcriptText" in item && (
                      <div className="mt-3 rounded-card border border-paper-200 bg-paper-50 p-4">
                        <p className="text-xs font-medium text-ink-400 mb-2">转写全文</p>
                        <p className="text-sm leading-7 text-ink-700 whitespace-pre-line">{item.transcriptText as string}</p>

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
              })}
            </div>
          </div>
        </section>

        {/* ====== Right: Creator Profile ====== */}
        <aside className="space-y-6">
          {/* Creator Selector */}
          <section className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-seal-500">当前创作者</p>
              <button
                onClick={() => setShowNewCreator(true)}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-button border border-paper-200 bg-paper-0 px-3 text-xs font-medium text-ink-800 hover:bg-paper-50"
              >
                <Plus className="size-3.5" />
                新建创作者
              </button>
            </div>

            <select
              className="mt-3 h-10 w-full rounded-button border border-paper-200 bg-paper-0 px-3 text-sm text-ink-800 outline-none focus-visible:border-seal-500"
              value={activePersonaId}
              onChange={(e) => setActivePersonaId(e.target.value)}
            >
              {personas.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* New creator modal */}
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
                    placeholder="人设定位"
                    value={newCreator.positioning}
                    onChange={(e) => setNewCreator((p) => ({ ...p, positioning: e.target.value }))}
                  />
                  <input
                    className="h-9 w-full rounded-button border border-paper-200 bg-paper-0 px-3 text-sm outline-none focus-visible:border-seal-500"
                    placeholder="领域"
                    value={newCreator.domain}
                    onChange={(e) => setNewCreator((p) => ({ ...p, domain: e.target.value }))}
                  />
                  <input
                    className="h-9 w-full rounded-button border border-paper-200 bg-paper-0 px-3 text-sm outline-none focus-visible:border-seal-500"
                    placeholder="语气特征（逗号分隔）"
                    value={newCreator.tone}
                    onChange={(e) => setNewCreator((p) => ({ ...p, tone: e.target.value }))}
                  />
                  <textarea
                    className="min-h-20 w-full resize-none rounded-card border border-paper-200 bg-paper-0 p-3 text-sm outline-none focus-visible:border-seal-500"
                    placeholder="高频观点（每行一个）"
                    value={newCreator.beliefs}
                    onChange={(e) => setNewCreator((p) => ({ ...p, beliefs: e.target.value }))}
                  />
                  <button
                    disabled={!newCreator.name.trim()}
                    className="inline-flex min-h-9 items-center rounded-button bg-seal-500 px-4 text-xs font-medium text-paper-0 disabled:opacity-50"
                  >
                    创建创作者
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* ====== Creator Profile (11 dimensions) ====== */}
          <section className="rounded-card border border-paper-200 bg-paper-0 p-2 shadow-sheet">
            <div className="rounded-[8px] bg-paper-0 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-paper-200 pb-4">
                <div>
                  <p className="text-xs font-medium text-seal-500">创作者画像</p>
                  <h2 className="mt-2 font-editorial text-[28px] font-semibold leading-tight text-ink-950">{activePersona.name}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-ink-600">{activePersona.positioning}</p>
                </div>
                <button className="inline-flex min-h-9 items-center gap-1.5 rounded-button bg-seal-500 px-3 text-xs font-medium text-paper-0 hover:bg-seal-600">
                  <Pencil className="size-3.5" />
                  编辑档案
                </button>
              </div>

              <div className="mt-5 grid gap-5">
                {/* 领域 */}
                {"domain" in activePersona && activePersona.domain && (
                  <ProfileBlock title="领域">
                    <p className="text-sm text-ink-800">{activePersona.domain}</p>
                  </ProfileBlock>
                )}

                {/* 语气特征 */}
                <ProfileBlock title="语气特征">
                  <div className="flex flex-wrap gap-2">
                    {activePersona.tone.map((t) => (
                      <span key={t} className="rounded-tag bg-seal-50 px-2.5 py-1 text-xs font-medium text-seal-600">{t}</span>
                    ))}
                  </div>
                </ProfileBlock>

                {/* 高频观点 */}
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

                {/* 常用案例 + 常用结构 */}
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

                {/* 标题偏好 */}
                <ProfileBlock title="标题偏好">
                  <p className="text-sm text-ink-800">{activePersona.titlePreference}</p>
                </ProfileBlock>

                {/* 禁用表达 */}
                <ProfileBlock title="禁用表达">
                  <div className="flex flex-wrap gap-2">
                    {activePersona.avoidPhrases.map((a) => (
                      <span key={a} className="rounded-tag bg-paper-50 px-2.5 py-1 text-xs text-ink-600 line-through decoration-ink-300">{a}</span>
                    ))}
                  </div>
                </ProfileBlock>
              </div>
            </div>
          </section>

          {/* ====== Platform Writing Rules (EDITABLE) ====== */}
          <section className="rounded-card border border-paper-200 bg-paper-0 p-6 shadow-sheet">
            <div className="flex items-center justify-between gap-2">
              <SectionTitle title="平台写法规则" description="规则可编辑，生成时与创作者画像一起调用。" />
              <button
                onClick={() => setEditingRules((v) => !v)}
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
                const rule = platformRules[key] || meta.rule;
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
                        onChange={(e) => setPlatformRules((prev) => ({ ...prev, [key]: e.target.value }))}
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
