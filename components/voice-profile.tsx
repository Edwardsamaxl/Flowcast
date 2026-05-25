"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { voiceProfile } from "@/lib/data";
import { cn } from "@/lib/utils";

export function VoiceProfile() {
  const [editing, setEditing] = useState(false);
  const [persona, setPersona] = useState(voiceProfile.persona);
  const [positioning, setPositioning] = useState(voiceProfile.positioning);
  const [tone, setTone] = useState(voiceProfile.tone);
  const [beliefs, setBeliefs] = useState(voiceProfile.beliefs);
  const [avoidPhrases, setAvoidPhrases] = useState(voiceProfile.avoidPhrases);

  const handleSave = () => {
    setEditing(false);
  };

  const handleCancel = () => {
    setPersona(voiceProfile.persona);
    setPositioning(voiceProfile.positioning);
    setTone(voiceProfile.tone);
    setBeliefs(voiceProfile.beliefs);
    setAvoidPhrases(voiceProfile.avoidPhrases);
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "rounded-card bg-surface-0 p-6 shadow-editor transition-opacity duration-200",
        editing ? "opacity-100" : "opacity-100"
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.012em] text-ink-950">
          声纹画像
        </h2>
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-button bg-calibrate-500 px-3 text-xs font-medium text-white shadow-action transition-[background-color,transform] duration-150 ease-out active:scale-[0.96] [@media(hover:hover)]:hover:bg-calibrate-600"
            >
              <Check className="size-3.5" aria-hidden="true" />
              保存
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-button bg-surface-50 px-3 text-xs font-medium text-ink-600 shadow-ring transition-[background-color,transform] duration-150 ease-out active:scale-[0.96] [@media(hover:hover)]:hover:bg-surface-100"
            >
              <X className="size-3.5" aria-hidden="true" />
              取消
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-button px-3 text-xs font-medium text-ink-600 transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96] [@media(hover:hover)]:hover:bg-surface-50 [@media(hover:hover)]:hover:text-ink-950"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            编辑
          </button>
        )}
      </div>

      {editing ? (
        /* Edit mode */
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-ink-800">人设定位</span>
              <input
                className="mt-2 w-full rounded-button bg-surface-0 px-3 py-2 text-sm shadow-ring outline-none focus-visible:ring-2 focus-visible:ring-calibrate-500/25"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink-800">定位说明</span>
              <input
                className="mt-2 w-full rounded-button bg-surface-0 px-3 py-2 text-sm shadow-ring outline-none focus-visible:ring-2 focus-visible:ring-calibrate-500/25"
                value={positioning}
                onChange={(e) => setPositioning(e.target.value)}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-ink-800">语气特征（逗号分隔）</span>
            <input
              className="mt-2 w-full rounded-button bg-surface-0 px-3 py-2 text-sm shadow-ring outline-none focus-visible:ring-2 focus-visible:ring-calibrate-500/25"
              value={tone.join("，")}
              onChange={(e) => setTone(e.target.value.split("，").map((s) => s.trim()).filter(Boolean))}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-800">高频观点（每行一条）</span>
            <textarea
              className="mt-2 w-full resize-none rounded-button bg-surface-0 p-3 text-sm leading-6 shadow-ring outline-none focus-visible:ring-2 focus-visible:ring-calibrate-500/25"
              rows={5}
              value={beliefs.join("\n")}
              onChange={(e) => setBeliefs(e.target.value.split("\n").filter(Boolean))}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-800">禁用表达（每行一条）</span>
            <textarea
              className="mt-2 w-full resize-none rounded-button bg-surface-0 p-3 text-sm leading-6 shadow-ring outline-none focus-visible:ring-2 focus-visible:ring-calibrate-500/25"
              rows={4}
              value={avoidPhrases.join("\n")}
              onChange={(e) => setAvoidPhrases(e.target.value.split("\n").filter(Boolean))}
            />
          </label>
        </div>
      ) : (
        /* Read-only mode */
        <div className="space-y-5">
          <div>
            <p className="text-2xl font-semibold tracking-[-0.012em]">{persona}</p>
            <p className="mt-1 text-sm leading-6 text-ink-600">{positioning}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-ink-400">语气特征</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tone.map((item) => (
                <span
                  key={item}
                  className="rounded-tag bg-calibrate-50 px-2.5 py-1 text-xs font-medium text-calibrate-600"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-ink-400">高频观点</p>
            <ol className="mt-2 space-y-1.5">
              {beliefs.map((item, index) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-6 text-ink-800">
                  <span className="mt-0.5 shrink-0 font-mono text-xs tabular text-ink-400">{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-xs font-medium text-ink-400">禁用表达</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {avoidPhrases.map((item) => (
                <span
                  key={item}
                  className="rounded-tag bg-surface-50 px-2 py-0.5 text-xs text-ink-600 [@media(hover:hover)]:hover:line-through"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
