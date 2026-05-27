import {
  BookOpenText,
  History,
  LibraryBig,
  MessageSquareQuote,
  PenLine,
  Radio,
  UploadCloud,
  Video,
  Monitor,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Platform } from "@/lib/pipeline/types";

// ---- Navigation ----

export const navItems: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/library", label: "资产库", icon: LibraryBig },
  { href: "/create", label: "流转工作台", icon: PenLine },
  { href: "/history", label: "历史", icon: History },
];

// ---- Platform Meta (MVP: 5 platforms) ----

export const platformMeta: Record<Platform, { name: string; rule: string; icon: LucideIcon }> = {
  xiaohongshu: { name: "小红书", rule: "短段落、强场景，标题直接点出痛点，转化要轻，不使用夸张承诺。", icon: MessageSquareQuote },
  douyin: { name: "抖音", rule: "口播节奏强，开头抓人，适合30-60秒短视频脚本，口语化，有互动感。", icon: Video },
  bilibili: { name: "B站", rule: "结构完整，信息密度高，适合长视频简介和动态文案，允许适度玩梗。", icon: Monitor },
  zhihu: { name: "知乎", rule: "结论先行，结构完整，强调方法论和可信判断，弱化营销感。", icon: BookOpenText },
  x: { name: "X", rule: "短句为主，观点密度高，开头抓人，口语化，适合连续观点输出。", icon: Radio },
};

export const platformOptions: Array<{ key: Platform; name: string }> = [
  { key: "xiaohongshu", name: "小红书" },
  { key: "douyin", name: "抖音" },
  { key: "bilibili", name: "B站" },
  { key: "zhihu", name: "知乎" },
  { key: "x", name: "X" },
];

// ---- Flow steps (landing page) ----

export const flowSteps = [
  { title: "内容上传", detail: "上传视频、音频、图文或文本", icon: UploadCloud },
  { title: "转写解析", detail: "提取观点、案例、语气和结构", icon: LibraryBig },
  { title: "用户确认", detail: "确认画像更新后写入创作者资产", icon: BookOpenText },
  { title: "多平台输出", detail: "生成各平台可编辑稿件", icon: PenLine },
];

// ---- Feedback Tags ----

export const feedbackTagOptions = [
  "太 AI 味了",
  "不像我",
  "太长了",
  "太营销了",
  "语气不对",
  "不适合这个平台",
  "标题太夸张",
  "结构太散",
];

// ====================================================================
// MOCK DATA — 开发阶段使用，接入 API 后可移除
// ====================================================================

// ---- Mock Creator Profiles ----

export const personas = [
  {
    id: "persona-kanyan",
    name: "考研陪伴型学姐",
    status: "当前使用" as const,
    positioning: "用亲身经验帮助普通学生制定可执行的备考策略",
    domain: "考研 / 学习方法 / 个人成长",
    tone: ["直接", "温和", "有经验感", "不制造焦虑"],
    beliefs: [
      "学习计划必须能落地，否则再完美也没有用。",
      "普通学生更需要稳定执行，而不是追求极限方法。",
      "真正的效率感来自可重复，而不是某一天的爆发。",
      "资料不是安全感，完成一轮最小闭环才是安全感。",
    ],
    cases: ["30 天复盘表", "低状态学习日", "资料过载后的最小闭环"],
    patterns: ["先指出误区", "解释为什么", "给具体方法", "留下行动建议"],
    avoidPhrases: ["宝子们", "干货满满", "狠狠收藏", "逆袭上岸", "闭眼冲"],
    titlePreference: "克制、明确，直接点出问题，不用夸张承诺",
    platformRules: {
      xiaohongshu: "短段落，强场景，标题直接点出痛点，转化要轻。不用「宝子们」开头，用具体问题开头。",
      douyin: "口播节奏快，开头3秒抓人。先抛反常识观点，再解释，最后给方法。",
      bilibili: "结构完整但不要学术。允许适度玩梗和自嘲，但仍要保持专业可信。",
      zhihu: "结论先行。用「大多数人以为...但实际是...」结构。强调方法论可复现。",
      x: "一句话抓人。观点密度高。不用营销词汇，用真实经历开头。",
    } as Record<Platform, string>,
  },
];

// ---- Mock Source Assets (videos uploaded to library) ----

export const sourceVideos = [
  {
    id: "v-20260521",
    title: "普通人考研最容易高估自己的执行力",
    duration: "42:18",
    status: "已解析，待确认" as const,
    libraryState: "待写入画像" as const,
    deposited: false,
    excerpt:
      "很多同学不是计划做得不够漂亮，而是把一天当成理想机器来安排。真正能落地的计划，要从你最差状态也能完成的版本开始。",
    signals: ["执行力误区", "学习计划", "普通学生"],
    candidates: ["稳定执行优先于极限方法", "低状态学习日", "计划要能落地"],
    transcriptText: `今天聊一个很多考研同学都会踩的坑：高估自己的执行力。

我见过太多同学做计划，把一天排得满满当当：早上六点起床背单词，上午刷数学，下午专业课，晚上英语真题，睡前还要复盘。这个计划看起来特别漂亮，但问题是——它是按你最理想的状态设计的。

你默认自己每天都精神很好、时间完整、没有临时任务、不会累。但备考不是在理想状态里发生的。

你真正要做的不是把计划排满，而是先设计一个"最差状态也能完成"的版本。比如今天只能学90分钟，那这90分钟里最不能丢的是什么？先把它保住。

我一直在强调一个观点：计划能落地，比计划看起来厉害重要得多。稳定执行优先于极限方法。`,
    corePoints: [
      { point: "大多数人做计划时高估了自己的执行力", evidence: "按理想状态排满日程，忽略了真实世界的干扰" },
      { point: "好的计划从最差状态开始设计", evidence: "先保住最不能丢的90分钟" },
      { point: "稳定执行优先于极限方法", evidence: "可重复的节奏比某天的爆发更重要" },
    ],
  },
  {
    id: "v-20260518",
    title: "为什么资料越多，越容易不开始",
    duration: "31:04",
    status: "已写入画像" as const,
    libraryState: "已写入画像" as const,
    deposited: true,
    excerpt:
      "资料不是安全感，完成一轮最小闭环才是安全感。先让自己看到进度，再谈优化方法。",
    signals: ["资料焦虑", "最小闭环", "备考节奏"],
    candidates: ["资料不是安全感", "先完成一轮闭环", "用进度替代焦虑"],
    transcriptText: `你有没有过这种经历：想考研，先花三天搜集所有经验帖、资料包、网盘链接。搜集完觉得差不多了，但又看到一个帖子说"这几本书必看"，于是又去下载。反复几次之后，你已经花了一周在搜集资料上，但一页书都没翻开。

这不是执行力的问题，这是用"搜集资料"来替代"真正开始"。

资料不是安全感，完成一轮最小闭环才是安全感。你不需要把所有可能的资料都准备好再开始。你需要的是：先拿起一本最核心的书，看完第一章，做对应的题，发现哪里不会，再去针对性地找资料。`,
    corePoints: [
      { point: "搜集资料是一种合理化的拖延行为", evidence: "用搜集替代行动，获得虚假的安全感" },
      { point: "最小闭环优先于资料完备", evidence: "先完成一轮再定位缺口" },
    ],
  },
  {
    id: "v-20260513",
    title: "职场新人不要把复盘写成检讨书",
    duration: "06:47",
    status: "转写完成" as const,
    libraryState: "未写入" as const,
    deposited: false,
    excerpt:
      "复盘不是证明自己有多努力，也不是承认自己多失败。它只回答三个问题：哪里失真，为什么失真，下次怎么提前发现。",
    signals: ["复盘", "职场沟通", "判断标准"],
    candidates: ["复盘不是检讨", "提前发现失真", "用问题定位替代情绪归因"],
    transcriptText: `复盘是职场里最容易做错的一件事。很多人把复盘写成了检讨书——"我哪里做得不好，我为什么没做好，我下次一定改"。这根本不是复盘，这是自我攻击。

真正的复盘只回答三个问题：第一，预期和实际之间哪里出现了偏差？第二，这个偏差的根本原因是什么——是信息不充分、判断失误、还是执行问题？第三，下一次在哪个节点可以提前发现这个偏差？

复盘不是证明你有多努力，也不是承认你多失败。它是一个定位系统。`,
    corePoints: [
      { point: "复盘不是检讨书，是定位系统", evidence: "大部分人把复盘写成了自我攻击" },
      { point: "复盘只需回答三个问题", evidence: "哪里失真、为什么失真、下次怎么提前发现" },
    ],
  },
];

// ---- Mock Generated Draft ----

export const generatedDraft = {
  title: "普通人考研最容易高估的，不是努力，是执行力",
  platform: "小红书" as const,
  body:
    "很多人做计划的时候，默认自己每天都精神很好、时间完整、没有临时任务。\n\n问题是，备考不是在理想状态里发生的。\n\n你真正要做的不是把计划排满，而是先设计一个「最差状态也能完成」的版本。比如今天只能学 90 分钟，那这 90 分钟里最不能丢的是什么？先把它保住。\n\n计划能落地，比计划看起来厉害重要得多。",
  notes: ["标题还可以再克制一点。", "可以补一个真实学生案例。", "当前反馈只影响本稿，未写回画像。"],
};

// ---- Mock History Tasks ----

export const historyTasks = [
  {
    id: "task-20260525-01",
    title: generatedDraft.title,
    persona: personas[0].name,
    platforms: ["小红书", "知乎"] as string[],
    status: "已生成" as const,
    hasFeedback: true,
    deposited: false,
    updatedAt: "2026-05-25 15:18",
  },
  {
    id: "task-20260524-02",
    title: "资料越多，越容易不开始",
    persona: personas[0].name,
    platforms: ["知乎"] as string[],
    status: "已沉淀" as const,
    hasFeedback: true,
    deposited: true,
    updatedAt: "2026-05-24 21:06",
  },
  {
    id: "task-20260523-03",
    title: "复盘不是检讨书",
    persona: "无画像" as const,
    platforms: ["X"] as string[],
    status: "草稿" as const,
    hasFeedback: false,
    deposited: false,
    updatedAt: "2026-05-23 19:44",
  },
];
