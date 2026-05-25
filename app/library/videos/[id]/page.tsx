import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionTitle } from "@/components/ui";
import { transcripts } from "@/lib/data";

export default function VideoDetailPage({ params }: { params: { id: string } }) {
  const transcript = transcripts.find((item) => item.id === params.id) ?? transcripts[0];

  return (
    <AppShell eyebrow="视频详情" title={transcript.title} description="查看转录正文、提取观点和后续可生成状态。">
      <Link href="/library" className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-button bg-surface-0 px-3 text-sm shadow-ring transition-transform duration-150 ease-out active:scale-[0.96]">
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回资产库
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-card bg-surface-0 p-5 shadow-editor">
          <SectionTitle title="转录正文" />
          <div className="rounded-card bg-canvas-50 p-5 text-sm leading-7 text-ink-600 shadow-ring">
            <p>{transcript.excerpt}</p>
            <p className="mt-4">
              这段内容会在真实版本中来自 faster-whisper 转写结果，并保留时间戳、说话停顿和可疑转写片段。
            </p>
          </div>
        </section>
        <aside className="rounded-card bg-surface-0 p-5 shadow-ring">
          <SectionTitle title="提取资产" />
          <div className="flex flex-wrap gap-2">
            {transcript.signals.map((signal) => (
              <span key={signal} className="rounded-tag bg-calibrate-50 px-2.5 py-1 text-xs text-calibrate-600">
                {signal}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
