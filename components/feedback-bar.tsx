"use client";

import { useState } from "react";
import { FeedbackTag } from "@/components/feedback-tag";

const feedbackTags = ["太 AI 味了", "不像我", "太长了", "太营销了", "更克制", "其他"];

export function FeedbackBar() {
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

  const handleToggle = (tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  return (
    <section className="sticky bottom-20 mt-6 rounded-card border border-paper-200 bg-paper-0 p-4 shadow-sheet lg:bottom-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-ink-950">这次改稿要记住什么？</p>
        {activeTags.size > 0 ? (
          <p className="text-xs text-seal-600">可选择写回人物画像</p>
        ) : null}
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {feedbackTags.map((tag) => (
          <FeedbackTag
            key={tag}
            label={tag}
            active={activeTags.has(tag)}
            onToggle={() => handleToggle(tag)}
          />
        ))}
      </div>
    </section>
  );
}
