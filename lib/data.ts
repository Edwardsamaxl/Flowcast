import {
  BookOpenText,
  FilePenLine,
  LibraryBig,
  MessageSquareQuote,
  PenLine,
  Radio,
  ShieldCheck,
  Sparkles,
  UploadCloud
} from "lucide-react";

export type Platform = "xiaohongshu" | "zhihu" | "x";

export const navItems = [
  { href: "/", label: "编辑台", icon: Sparkles },
  { href: "/library", label: "资产库", icon: LibraryBig },
  { href: "/create", label: "创作", icon: PenLine },
  { href: "/calibrate", label: "校准", icon: FilePenLine },
  { href: "/drafts", label: "草稿", icon: BookOpenText }
];

export const stats = [
  { label: "已转录内容", value: "12", helper: "小时口播与课程" },
  { label: "可复用观点", value: "46", helper: "条方法论与判断" },
  { label: "平均改稿时间", value: "8.6", helper: "分钟 / 篇" }
];

export const transcripts = [
  {
    id: "v-20260521",
    title: "普通人考研最容易高估自己的执行力",
    source: "直播回放",
    duration: "42:18",
    status: "已生成画像",
    excerpt:
      "很多同学不是计划做得不够漂亮，而是把一天当成理想机器来安排。真正能落地的计划，要从你最差状态也能完成的版本开始。",
    signals: ["执行力误区", "学习计划", "普通学生"]
  },
  {
    id: "v-20260518",
    title: "为什么资料越多，越容易不开始",
    source: "课程录屏",
    duration: "31:04",
    status: "转写完成",
    excerpt:
      "资料不是安全感，完成一轮最小闭环才是安全感。先让自己看到进度，再谈优化方法。",
    signals: ["资料焦虑", "最小闭环", "备考节奏"]
  },
  {
    id: "v-20260513",
    title: "职场新人不要把复盘写成检讨书",
    source: "短视频口播",
    duration: "06:47",
    status: "待校准",
    excerpt:
      "复盘不是证明自己有多努力，也不是承认自己多失败。它只回答三个问题：哪里失真，为什么失真，下次怎么提前发现。",
    signals: ["复盘", "职场沟通", "判断标准"]
  }
];

export const voiceProfile = {
  persona: "考研陪伴型学姐",
  positioning: "用亲身经验帮助普通学生制定可执行的备考策略",
  tone: ["直接", "温和", "有经验感", "不制造焦虑"],
  beliefs: [
    "学习计划必须能落地，否则再完美也没有用",
    "普通学生更需要稳定执行，而不是追求极限方法",
    "真正的效率感来自可重复，而不是某一天的爆发"
  ],
  avoidPhrases: ["宝子们", "干货满满", "狠狠收藏", "逆袭上岸", "闭眼冲"],
  patterns: ["先指出误区", "解释为什么", "给具体方法", "留下行动建议"]
};

export const platformRules: Record<Platform, { name: string; rule: string; icon: typeof BookOpenText }> = {
  xiaohongshu: {
    name: "小红书",
    rule: "短段落，强场景，标题直接点出痛点，转化要轻。",
    icon: MessageSquareQuote
  },
  zhihu: {
    name: "知乎",
    rule: "结论先行，强调方法论和可信度，弱化营销感。",
    icon: BookOpenText
  },
  x: {
    name: "X",
    rule: "开头抓人，短句为主，口语化，适合观点输出。",
    icon: Radio
  }
};

export const workflow = [
  { title: "上传长内容", detail: "本地视频、直播回放或课程录屏", icon: UploadCloud },
  { title: "沉淀表达资产", detail: "观点、案例、禁用词和转化方式", icon: LibraryBig },
  { title: "拆成平台内容", detail: "小红书、知乎、X 三种版本", icon: PenLine },
  { title: "反馈让它更像你", detail: "把改稿偏好写回表达画像", icon: ShieldCheck }
];

export const generatedDraft = {
  title: "普通人考研最容易高估的，不是努力，是执行力",
  platform: "小红书",
  body:
    "很多人做计划的时候，默认自己每天都精神很好、时间完整、没有临时任务。\n\n问题是，备考不是在理想状态里发生的。\n\n你真正要做的不是把计划排满，而是先设计一个“最差状态也能完成”的版本。比如今天只能学 90 分钟，那这 90 分钟里最不能丢的是什么？先把它保住。\n\n计划能落地，比计划看起来厉害重要得多。",
  warnings: [
    "标题可以再克制一点，避免“最容易高估”显得判断过重。",
    "第二段已经调到执行力观点，但还可以加入一个真实学生案例。",
    "CTA 暂时为空，适合在真实发布前按资料包策略补一句。"
  ]
};

export const draftList = [
  {
    id: "d-20260525-01",
    title: generatedDraft.title,
    platform: "小红书",
    source: transcripts[0].title,
    status: "已校准",
    feedbackTags: ["更克制", "不像我"],
    createdAt: "2026-05-25 15:18"
  },
  {
    id: "d-20260524-02",
    title: "资料越多，越容易不开始",
    platform: "知乎",
    source: transcripts[1].title,
    status: "待反馈",
    feedbackTags: ["太长了"],
    createdAt: "2026-05-24 21:06"
  },
  {
    id: "d-20260523-03",
    title: "复盘不是检讨书",
    platform: "X",
    source: transcripts[2].title,
    status: "草稿",
    feedbackTags: [],
    createdAt: "2026-05-23 19:44"
  }
];
