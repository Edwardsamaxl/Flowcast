"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import type { Creator } from "@/lib/hooks/use-creators";

export function CreatorProfile({ creator, onEdit }: { creator: Creator; onEdit?: () => void }) {
  const profile = creator.profile;
  const [editing, setEditing] = useState(false);

  if (!profile) {
    return (
      <section className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet text-center">
        <p className="text-sm text-ink-400">该创作者尚未建立画像</p>
        <p className="mt-2 text-xs text-ink-400">上传视频素材开始构建</p>
      </section>
    );
  }

  return (
    <section className="rounded-card border border-paper-200 bg-paper-0 p-2 shadow-sheet">
      <div className="rounded-[8px] bg-paper-0 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-paper-200 pb-4">
          <div>
            <p className="text-xs font-medium text-seal-500">创作者画像</p>
            <h2 className="mt-2 font-editorial text-[28px] font-semibold leading-tight text-ink-950">{creator.name}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ink-600">{profile.positioning}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEditing((v) => !v)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-button bg-seal-500 px-3 text-xs font-medium text-paper-0 transition-[background-color,transform] duration-300 active:scale-[0.98] hover:bg-seal-600"
            >
              {editing ? <X className="size-3.5" /> : <Pencil className="size-3.5" />}
              {editing ? "取消编辑" : "编辑档案"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-5">
          {profile.tone.length > 0 && (
            <ProfileBlock title="语气特征">
              <div className="flex flex-wrap gap-2">
                {profile.tone.map((item) => (
                  <span key={item} className="rounded-tag bg-seal-50 px-2.5 py-1 text-xs font-medium text-seal-600">
                    {item}
                  </span>
                ))}
              </div>
            </ProfileBlock>
          )}

          {profile.beliefs.length > 0 && (
            <ProfileBlock title="高频观点">
              <ol className="space-y-2">
                {profile.beliefs.map((item, index) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-ink-800">
                    <span className="mt-0.5 shrink-0 font-mono text-xs tabular text-ink-400">{String(index + 1).padStart(2, "0")}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </ProfileBlock>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {profile.commonPatterns.length > 0 && (
              <ProfileBlock title="常用结构">
                <div className="flex flex-wrap gap-2">
                  {profile.commonPatterns.map((item) => (
                    <span key={item} className="rounded-tag bg-paper-50 px-2.5 py-1 text-xs text-ink-800">
                      {item}
                    </span>
                  ))}
                </div>
              </ProfileBlock>
            )}

            {profile.avoidPhrases.length > 0 && (
              <ProfileBlock title="禁用表达">
                <div className="flex flex-wrap gap-2">
                  {profile.avoidPhrases.map((item) => (
                    <span key={item} className="rounded-tag bg-paper-50 px-2.5 py-1 text-xs text-ink-600">
                      {item}
                    </span>
                  ))}
                </div>
              </ProfileBlock>
            )}
          </div>

          {editing && (
            <div className="rounded-card border border-seal-500/30 bg-seal-50 p-4">
              <p className="text-sm font-medium text-ink-950">编辑态</p>
              <p className="mt-1 text-sm leading-6 text-ink-600">编辑功能将在后续版本完善。</p>
              <button className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-button bg-seal-500 px-3 text-xs font-medium text-paper-0">
                <Check className="size-3.5" />
                保存档案
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
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
