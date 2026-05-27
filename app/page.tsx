import Link from "next/link";
import { ArrowRight, Check, Upload, Workflow } from "lucide-react";
import { LogoImage } from "@/components/logo-image";

const platforms = [
  { name: "小红书", logo: "/logos/小红书.png" },
  { name: "知乎", logo: "/logos/知乎.png" },
  { name: "X", logo: "/logos/X.jpeg" },
  { name: "抖音", logo: "/logos/抖音.png" },
  { name: "B 站", logo: "/logos/Bilibili.png" },
];

const flowCards = [
  {
    no: "01",
    title: "内容上传",
    body: "短视频、口播\n图文观点、文本素材",
    visual: "upload",
  },
  {
    no: "02",
    title: "转写解析",
    body: "从原始内容里\n抽出观点和结构",
    visual: "wave",
  },
  {
    no: "03",
    title: "用户确认",
    body: "只给变化建议\n确认后进入画像",
    visual: "confirm",
  },
  {
    no: "04",
    title: "画像沉淀",
    body: "定位、观点、语气\n结构、禁用表达",
    visual: "radar",
  },
  {
    no: "05",
    title: "多平台输出",
    body: "同一观点\n变成不同平台版本",
    visual: "platforms",
  },
];

const platformSamples = [
  ["小红书", "/logos/小红书.png", "标题直接\n场景强\n短段落种草"],
  ["抖音", "/logos/抖音.png", "前三秒抓人\n口语推进\n结尾落行动"],
  ["B 站", "/logos/Bilibili.png", "结构完整\n适合动态\n适合简介"],
  ["知乎", "/logos/知乎.png", "结论先行\n解释原因\n论证感更强"],
  ["X", "/logos/X.jpeg", "短句观点串\n节奏更快\n适合转发"],
];

const faqs = [
  [
    "为什么当前先开放视频转文字",
    "视频是创作者最常见的表达入口，尤其是短视频和口播，观点更集中，转写解析后更适合快速流转成多个平台版本",
  ],
  [
    "为什么暂时不支持文转视频",
    "文生视频能力的稳定性、可控性和成片质量还不足以支撑严肃创作者的日常发布，Flowcast 会先把内容理解、画像沉淀和文字流转链路做好",
  ],
  [
    "音频、图文、文本什么时候支持",
    "这些形态都在产品版图内，当前还在开发中，页面展示方向和边界，但不会把它们包装成已经完整可用",
  ],
  [
    "上传内容会自动写入创作者画像吗",
    "不会，系统只会提出画像变化建议，用户确认后才会写入创作者画像",
  ],
  [
    "是否会自动发布到平台",
    "暂不支持自动发布，当前重点是生成可编辑、可复制、可沉淀的多平台内容版本",
  ],
];

function LogoMark() {
  return (
    <span className="relative grid size-10 place-items-center rounded-full border border-seal-500/20 text-seal-600">
      <span className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-seal-500" />
      <span className="absolute left-1/2 top-1/2 h-8 w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-seal-500" />
    </span>
  );
}

function FlowVisual({ type }: { type: string }) {
  if (type === "upload") {
    return (
      <div className="mx-auto grid h-28 w-full place-items-center rounded-card border border-dashed border-paper-200 bg-paper-0">
        <div className="text-center">
          <Upload className="mx-auto size-8 text-seal-500" strokeWidth={1.8} />
          <p className="mt-3 text-[12px] leading-relaxed text-ink-500">短视频 / 口播 / 图文观点</p>
        </div>
      </div>
    );
  }

  if (type === "wave") {
    return (
      <div className="flex h-28 items-center justify-center">
        <div className="flex items-center gap-1">
          {[10, 18, 26, 42, 30, 52, 24, 36, 18, 28, 12].map((height, index) => (
            <span key={index} className="w-1 rounded-full bg-seal-500/75" style={{ height }} />
          ))}
        </div>
      </div>
    );
  }

  if (type === "confirm") {
    return (
      <div className="mx-auto grid h-28 max-w-[190px] gap-2">
        {["观点提炼", "语气风格", "表达结构"].map((item) => (
          <div key={item} className="flex items-center justify-between rounded-button border border-paper-200 bg-paper-0 px-3 py-2 text-[12px] text-ink-700">
            <span>{item}</span>
            <Check className="size-3.5 text-seal-500" strokeWidth={2} aria-hidden="true" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "radar") {
    return (
      <div className="relative mx-auto h-28 w-36">
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-seal-500/18" />
        <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-seal-500/25" />
        <div className="absolute left-1/2 top-4 h-20 w-px -translate-x-1/2 bg-seal-500/20" />
        <div className="absolute left-5 top-1/2 h-px w-28 -translate-y-1/2 bg-seal-500/20" />
        <div className="absolute left-[43px] top-[34px] h-[54px] w-[58px] rotate-12 border border-seal-500 bg-seal-500/10" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid h-28 max-w-[176px] gap-1.5">
      {platforms.map((platform) => (
        <div key={platform.name} className="flex min-w-0 items-center gap-2 rounded-button border border-paper-200 bg-paper-0 px-2.5 py-1">
          <LogoImage src={platform.logo} alt={platform.name} className={platform.name === "B 站" ? "h-3 w-5 shrink-0" : "size-4 shrink-0"} />
          <span className="truncate text-[11px] font-medium text-ink-700">{platform.name}</span>
          <span className="ml-auto h-1.5 w-9 shrink-0 rounded-full bg-paper-200" />
        </div>
      ))}
    </div>
  );
}

function FlowCard({ card, isLast }: { card: (typeof flowCards)[number]; isLast: boolean }) {
  return (
    <div className="relative">
      <article className="min-h-[236px] rounded-[10px] border border-paper-200 bg-paper-0 p-5 shadow-sheet">
        <div className="flex items-baseline gap-3">
          <span className="font-editorial text-[17px] font-semibold text-seal-600">{card.no}</span>
          <h3 className="whitespace-nowrap font-editorial text-[19px] font-semibold leading-tight text-ink-950">{card.title}</h3>
        </div>
        <div className="mt-5">
          <FlowVisual type={card.visual} />
        </div>
        <p className="mt-4 whitespace-pre-line text-center text-[13px] leading-relaxed text-ink-600">{card.body}</p>
      </article>
      {!isLast ? (
        <div className="absolute left-full top-1/2 z-10 hidden w-[58px] -translate-y-1/2 items-center lg:flex">
          <span className="h-px flex-1 bg-seal-500" />
          <span className="size-3 rounded-full border-2 border-seal-500 bg-paper-0" />
        </div>
      ) : null}
    </div>
  );
}

function SectionTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="mx-auto max-w-[760px] text-center">
      <p className="font-editorial text-[13px] font-semibold tracking-[0.16em] text-seal-600">{eyebrow}</p>
      <h2 className="mt-3 font-editorial text-[34px] font-semibold leading-tight text-ink-950 sm:text-[42px]">{title}</h2>
      {body ? <p className="mt-4 text-[15px] leading-[1.8] text-ink-600">{body}</p> : null}
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-[100dvh] bg-paper-0 text-ink-950">
      <header className="mx-auto flex h-[76px] max-w-[1440px] items-center px-6 lg:px-14">
        <Link href="/" className="flex items-center gap-3" aria-label="Flowcast 首页">
          <LogoMark />
          <span className="font-editorial text-[24px] font-semibold leading-none text-ink-950">流转 Flowcast</span>
        </Link>
      </header>

      <section className="px-6 pb-14 pt-10 lg:px-14">
        <div className="mx-auto max-w-[1320px] text-center">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-paper-200 bg-paper-0 px-6 py-3 text-[15px] font-semibold text-seal-600 shadow-sheet">
            <span className="grid size-6 place-items-center rounded-full bg-seal-500/10 text-seal-600">
              <Workflow className="size-3.5" strokeWidth={2} aria-hidden="true" />
            </span>
            跨模态的专属内容知识库与流转引擎
          </p>
          <h1 className="mx-auto mt-7 max-w-[1120px] font-editorial text-[46px] font-semibold leading-[1.08] tracking-tight text-ink-950 sm:text-[68px] lg:text-[78px]">
            让视频、音频、图文、文本自由<span className="text-seal-500">流转</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[760px] text-[18px] leading-[1.85] text-ink-600">
            把已有内容沉淀成创作者画像，再根据你的观点、语气和结构，流转成适合不同平台发布的内容版本
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/library" className="inline-flex min-w-[220px] items-center justify-center gap-3 rounded-button bg-seal-500 px-7 py-4 text-[16px] font-semibold text-paper-0 shadow-action">
              创建创作者画像
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
            </Link>
            <Link href="/create" className="inline-flex min-w-[220px] items-center justify-center gap-3 rounded-button border border-seal-500/55 bg-paper-0 px-7 py-4 text-[16px] font-semibold text-ink-950">
              进入流转工作台
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-[14px] text-ink-500">
            <span>支持平台：</span>
            {platforms.map((platform) => (
              <span key={platform.name} className="inline-flex items-center gap-2 rounded-full border border-paper-200 bg-paper-0 px-3 py-2 shadow-hairline">
                <LogoImage src={platform.logo} alt={platform.name} className={platform.name === "B 站" ? "h-4 w-7" : "size-5"} />
                <span className="font-medium text-ink-700">{platform.name}</span>
              </span>
            ))}
          </div>
        </div>

        <div id="flow" className="mx-auto mt-14 max-w-[1240px]">
          <SectionTitle
            eyebrow="流转路径"
            title="内容上传、转写解析、画像沉淀、多平台输出"
            body="从上传到解析、确认、沉淀、输出，用户能看见内容正在跨平台转换"
          />
          <div className="mx-auto mt-10 grid gap-8 lg:grid-cols-5">
            {flowCards.map((card, index) => (
              <FlowCard key={card.no} card={card} isLast={index === flowCards.length - 1} />
            ))}
          </div>
        </div>
      </section>

      <section id="platforms" className="border-y border-paper-200 bg-[#fbf7ef] px-6 py-16 lg:px-14">
        <SectionTitle
          eyebrow="平台输出"
          title="同一份观点，按平台语境改写"
          body="重点不是只展示平台 Logo，而是让用户看到同一份内容在不同平台中的表达差异"
        />
        <div className="mx-auto mt-10 grid max-w-[1120px] gap-4 md:grid-cols-2 lg:grid-cols-5">
          {platformSamples.map(([name, logo, sample]) => (
            <article key={name} className="rounded-[10px] border border-paper-200 bg-paper-0 p-5 shadow-sheet">
              <div className="flex h-10 items-center">
                <LogoImage src={logo} alt={name} className="max-h-9 w-auto max-w-[112px]" />
              </div>
              <p className="mt-5 whitespace-pre-line text-[14px] leading-[1.85] text-ink-700">{sample}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="persona" className="border-y border-paper-200 bg-paper-0 px-6 py-16 lg:px-14">
        <SectionTitle
          eyebrow="创作者画像"
          title="不是泛 AI 文案，是带创作者画像的输出"
          body="系统调用创作者画像中的定位、观点、语气和结构，让流转后的内容尽量保留创作者本人的表达特征"
        />
        <div className="mx-auto mt-10 grid max-w-[920px] gap-5 md:grid-cols-2">
          <article className="rounded-[10px] border border-paper-200 bg-paper-0 p-6 shadow-sheet">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-paper-200 text-[12px] font-bold text-ink-500">AI</span>
              <h3 className="font-editorial text-[18px] font-semibold text-ink-700">普通 AI 文案</h3>
            </div>
            <div className="mt-5 space-y-3">
              {["通用表达，缺少个人语气", "标准结构，不区分平台习惯", "可能使用创作者明确避免的词汇", "观点表述偏向平均，缺少判断力度"].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-paper-300" />
                  <p className="text-[14px] leading-relaxed text-ink-500">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="relative rounded-[10px] border border-seal-500/25 bg-paper-0 p-6 shadow-sheet">
            <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-seal-500 px-3 py-1 text-[12px] font-semibold text-white">
              <Check className="size-3" strokeWidth={2.5} aria-hidden="true" />
              调用创作者画像
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-seal-500/10 text-[12px] font-bold text-seal-600">我</span>
              <h3 className="font-editorial text-[18px] font-semibold text-ink-950">画像驱动输出</h3>
            </div>
            <div className="mt-5 space-y-3">
              {["保留创作者观点和个人判断", "匹配语气和常用表达结构", "自动避开创作者禁用表达", "按平台规则调整，而非统一改写"].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-seal-500" strokeWidth={2} aria-hidden="true" />
                  <p className="text-[14px] leading-relaxed text-ink-700">{item}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="faq" className="px-6 py-16 lg:px-14">
        <SectionTitle eyebrow="常见问题" title="边界说明" />
        <div className="mx-auto mt-10 max-w-[920px] divide-y divide-paper-200 border-y border-paper-200">
          {faqs.map(([question, answer]) => (
            <article key={question} className="py-5">
              <h3 className="font-editorial text-[21px] font-semibold text-ink-950">{question}</h3>
              <p className="mt-3 text-[15px] leading-[1.85] text-ink-600">{answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
