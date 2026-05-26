import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

/* ---- Douyin inline SVG ---- */

function DouyinLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 28" fill="none" className={className} aria-label="抖音">
      <path
        d="M99.5 2h6l.1.5c.2 3 1.3 5.8 3.2 8.1l.4.4-.2.5c-1 4-1 8 .3 11.7l.7 1.9c-.8-.2-1.5-.5-2.2-1v8.8c0 3-1.2 5.7-3.4 7.7-2.2 2-5.1 3.2-8.1 3.2-2.2 0-4.2-.7-5.8-2 2-2.5 2.4-5.8 1.5-8.8-.5-1.8-1.7-3.2-3.3-4-1.7-.8-3.6-.9-5.3-.1v-.1c-1.1-1.2-1.8-2.8-1.8-4.5 0-1.8.7-3.5 2-4.7 2-1.8 4.6-2.8 7.3-2.8.4 0 .8 0 1.2.1v6h-.1c-.4 0-.8 0-1.1.2-1 .2-1.9.9-2.3 1.8h-.1c-.3.7-.5 1.5.2 2.2.4.5 1 .8 1.6.8.8 0 1.5-.4 2-1 .7-.8 1-1.8 1-3V2h5.5ZM18.9 1.8c1.1.9 2.4 1.6 3.8 1.8v4.2c-1.3-.2-2.5-.6-3.8-1.3v5.2c0 2.9-1.1 5.7-3 7.7-1.7 1.8-3.9 2.8-6.1 2.8-1 0-2-.3-3-.8 1.7-2 2-4.6 1.2-7-.5-1.3-1.4-2.5-2.8-3-1.4-.7-3.2-.7-4.5.2v-.1c-1-1-1.5-2.3-1.5-3.7 0-1.5.6-2.9 1.7-3.9 1.7-1.5 3.8-2.3 6.1-2.3h.7v5h-.1c-.2 0-.5 0-.7.1-.9.2-1.6.9-1.8 1.7h-.1c-.2.7 0 1.4.4 2 .3.4.8.7 1.3.7.8 0 1.5-.3 2-.9.5-.7.8-1.4.8-2.3V1.8h4.9Z"
        fill="#111"
      />
      <path
        d="M21.3 0c-.2.8-.5 1.6-.9 2.3.1 0 .2.1.2.2.4.3.8.7 1.2 1-.2-.7-.3-1.4-.5-2.1V0Z"
        fill="#20D7D7"
      />
    </svg>
  );
}

/* ---- Data ---- */

const logos = [
  { name: "小红书", src: "/logos/xiaohongshu.svg" },
  { name: "抖音", component: DouyinLogo },
  { name: "B站", src: "/logos/bilibili.svg" },
  { name: "X", src: "/logos/x.svg" },
  { name: "知乎", src: "/logos/zhihu.svg" },
];

/* ---- Page ---- */

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper-0 text-ink-950">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-paper-200 bg-paper-0/90 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1180px] items-center px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-ink-950 font-editorial text-base font-semibold text-paper-0">
              流
            </span>
            <span className="font-editorial text-lg font-semibold">流转</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-[880px] px-6 pb-24 pt-24 text-center sm:pt-32 lg:pt-40">
        <p className="mx-auto inline-flex rounded-full border border-seal-500/15 bg-seal-50 px-4 py-1.5 text-[12px] font-medium tracking-[0.1em] text-seal-600">
          跨模态的专属内容知识库与流转引擎
        </p>

        <h1 className="mx-auto mt-8 max-w-4xl font-editorial text-[44px] font-semibold leading-[1.07] tracking-[-0.01em] text-ink-950 sm:text-[68px] lg:text-[84px]">
          让视频、音频、图文、文本自由<span className="text-seal-500">流转</span>
        </h1>

        <p className="mx-auto mt-8 max-w-[580px] text-[17px] leading-[1.8] text-ink-500">
          把长视频、直播回放、课程录屏、口播、图文和文章
          转成适合不同平台发布的内容版本
        </p>
        <p className="mx-auto mt-3 max-w-[580px] text-[15px] leading-[1.7] text-ink-400">
          当前先开放视频转文字链路，并通过创作者画像保留你的观点、语气和表达方式
        </p>

        {/* CTAs */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            href="/library"
            className="group inline-flex items-center gap-4 rounded-2xl bg-seal-500 px-8 py-5 text-left shadow-action transition-all duration-500 ease-out hover:bg-seal-600 active:scale-[0.98]"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-paper-0/15 text-paper-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </span>
            <span className="text-left">
              <span className="block text-[15px] font-semibold leading-tight text-paper-0">
                创建创作者画像
              </span>
              <span className="mt-0.5 block text-[13px] leading-snug text-paper-0/65">
                让 AI 用你的语气和观点来写
              </span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-paper-0/40 transition-transform duration-500 group-hover:translate-x-1" aria-hidden="true" />
          </Link>

          <Link
            href="/create"
            className="group inline-flex items-center gap-4 rounded-2xl bg-ink-950 px-8 py-5 text-left shadow-action transition-all duration-500 ease-out hover:bg-ink-800 active:scale-[0.98]"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-paper-0/10 text-paper-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </span>
            <span className="text-left">
              <span className="block text-[15px] font-semibold leading-tight text-paper-0">
                拆解一条内容
              </span>
              <span className="mt-0.5 block text-[13px] leading-snug text-paper-0/55">
                上传视频，流转出多平台文字稿件
              </span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-paper-0/30 transition-transform duration-500 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Platform logos */}
      <section className="mx-auto max-w-[880px] px-6 pb-20">
        <p className="mb-10 text-center text-[12px] font-medium tracking-[0.15em] text-ink-300">
          覆盖平台
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {logos.map((item) => (
            <div key={item.name} className="flex h-7 items-center" title={item.name}>
              {item.component ? (
                <item.component className="h-full w-auto opacity-40 transition-opacity duration-500 hover:opacity-100" />
              ) : (
                <img
                  src={item.src!}
                  alt={item.name}
                  className="h-full w-auto opacity-40 transition-opacity duration-500 hover:opacity-100"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="border-y border-paper-200 bg-[#faf7f0] px-6 py-24">
        <div className="mx-auto max-w-[880px]">
          <h2 className="text-center font-editorial text-[28px] font-semibold text-ink-950 sm:text-[34px]">
            从内容到稿件，一条完整的流转链路
          </h2>
          <div className="mt-14 flex flex-wrap items-start justify-center gap-2 sm:gap-3">
            {["内容上传", "转写解析", "用户确认", "画像沉淀", "多平台输出"].map((label, i) => (
              <div key={label} className="flex items-center gap-2 sm:gap-3">
                <span className="rounded-xl border border-paper-200 bg-paper-0 px-5 py-4 text-[14px] font-semibold text-ink-900 shadow-hairline">
                  {label}
                </span>
                {i < 4 && (
                  <span className="hidden text-ink-300 sm:block">
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* "像本人写" comparison */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-[880px]">
          <h2 className="text-center font-editorial text-[28px] font-semibold text-ink-950 sm:text-[34px]">
            不只是改写，而是像本人写
          </h2>
          <p className="mx-auto mt-5 max-w-[560px] text-center text-[15px] leading-relaxed text-ink-500">
            创作者画像记录你的语气、观点、禁用表达和写法偏好，让生成的内容保留你的表达特征
          </p>
          <div className="mx-auto mt-14 grid max-w-[680px] gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-red-100 bg-[#fef5f5] p-7">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-red-400">
                普通 AI 改写
              </p>
              <p className="mt-4 text-[14px] leading-[1.8] text-ink-600">
                宝子们，今天必须分享这个超级干货的学习方法，真的狠狠收藏了！考研人必备，学会了效率直接翻倍，千万不要错过！
              </p>
            </div>
            <div className="rounded-2xl border border-sage-100 bg-[#f6f8f3] p-7">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-sage-500">
                流转 + 创作者画像
              </p>
              <p className="mt-4 text-[14px] leading-[1.8] text-ink-600">
                学习计划最重要的不是完美，而是能落地。我见过的逆袭案例，都不是因为用了什么极限方法，而是把一套合理策略坚持到了最后
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-modal vision */}
      <section className="border-y border-paper-200 bg-[#faf7f0] px-6 py-24">
        <div className="mx-auto max-w-[880px]">
          <h2 className="text-center font-editorial text-[28px] font-semibold text-ink-950 sm:text-[34px]">
            多模态流转版图
          </h2>
          <p className="mx-auto mt-5 max-w-[560px] text-center text-[15px] leading-relaxed text-ink-500">
            当前先从视频转文字开始，后续逐步开放更多流转方向
          </p>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { type: "视频", status: "可用", statusColor: "text-seal-500", desc: "上传长视频、直播回放或课程录屏，转写成文字流转到多平台" },
              { type: "音频", status: "稍后接入", statusColor: "text-amber-500", desc: "上传口播音频、播客或课程录音，与视频共享转写管线" },
              { type: "图文", status: "稍后接入", statusColor: "text-sage-500", desc: "从既有图文提炼观点并改写到其他平台" },
              { type: "文本", status: "稍后接入", statusColor: "text-sage-500", desc: "从文章、笔记、提纲出发，流转到多个平台" },
            ].map((item) => (
              <article key={item.type} className="rounded-2xl border border-paper-200 bg-paper-0 p-5 shadow-hairline">
                <h3 className="text-[16px] font-semibold text-ink-950">
                  {item.type}
                  <span className={`ml-2 text-[12px] font-medium ${item.statusColor}`}>{item.status}</span>
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-500">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12">
        <div className="mx-auto max-w-[880px] text-center text-[13px] text-ink-400">
          流转 Flowcast — 让创作者把一份内容，流转成多个平台都能发布的版本
        </div>
      </footer>
    </main>
  );
}
