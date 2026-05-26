import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionTitle } from "@/components/ui";
import { sourceVideos } from "@/lib/data";

export default function VideoDetailPage({ params }: { params: { id: string } }) {
  const video = sourceVideos.find((item) => item.id === params.id) ?? sourceVideos[0];

  return (
    <AppShell eyebrow="视频详情" title={video.title} description="查看转写文本、解析候选项，并确认是否写入当前人物画像。">
      <Link href="/library" className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-button border border-paper-200 bg-paper-0 px-3 text-sm font-medium text-ink-800 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]">
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回资产库
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
          <SectionTitle title="转写文本" />
          <div className="rounded-card border border-paper-200 bg-paper-50 p-5 text-sm leading-7 text-ink-600">
            <p>{video.excerpt}</p>
            <p className="mt-4">
              后续真实版本会展示完整转写、时间戳、说话停顿和可疑转写片段。
            </p>
          </div>
        </section>
        <aside className="rounded-card border border-paper-200 bg-paper-0 p-5 shadow-sheet">
          <SectionTitle title="可写入候选项" description={video.libraryState} />
          <div className="flex flex-wrap gap-2">
            {video.candidates.map((signal) => (
              <span key={signal} className="rounded-tag bg-seal-50 px-2.5 py-1 text-xs text-seal-600">
                {signal}
              </span>
            ))}
          </div>
          <button className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-button bg-seal-500 px-4 text-sm font-medium text-paper-0 shadow-action">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            写入当前人物画像
          </button>
        </aside>
      </div>
    </AppShell>
  );
}
