import {
  BookOpenText,
  History,
  Home,
  LibraryBig,
  MessageSquareQuote,
  PenLine,
  Radio,
  UploadCloud
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Platform = "xiaohongshu" | "zhihu" | "x";

export const navItems: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/", label: "首页", icon: Home },
  { href: "/library", label: "资产库", icon: LibraryBig },
  { href: "/create", label: "拆解内容", icon: PenLine },
  { href: "/history", label: "历史", icon: History }
];

export const personas = [
  {
    id: "persona-default",
    name: "默认人物",
    status: "当前使用",
    positioning: "用亲身经验帮助普通学生制定可执行的备考策略",
    domain: "考研 / 学习方法 / 个人成长",
    tone: ["直接", "温和", "有经验感", "不制造焦虑"],
    beliefs: [
      "学习计划必须能落地，否则再完美也没有用。",
      "普通学生更需要稳定执行，而不是追求极限方法。",
      "真正的效率感来自可重复，而不是某一天的爆发。"
    ],
    cases: ["30 天复盘表", "低状态学习日", "资料过载后的最小闭环"],
    patterns: ["先指出误区", "解释为什么", "给具体方法", "留下行动建议"],
    avoidPhrases: ["宝子们", "干货满满", "狠狠收藏", "逆袭上岸", "闭眼冲"],
    titlePreference: "克制、明确，直接点出问题，不用夸张承诺"
  }
];

export const sourceVideos = [
  {
    id: "v-20260521",
    title: "普通人考研最容易高估自己的执行力",
    source: "直播回放",
    duration: "42:18",
    status: "已解析，待确认",
    libraryState: "待写入画像",
    deposited: false,
    excerpt:
      "很多同学不是计划做得不够漂亮，而是把一天当成理想机器来安排。真正能落地的计划，要从你最差状态也能完成的版本开始。",
    signals: ["执行力误区", "学习计划", "普通学生"],
    candidates: ["稳定执行优先于极限方法", "低状态学习日", "计划要能落地"]
  },
  {
    id: "v-20260518",
    title: "为什么资料越多，越容易不开始",
    source: "课程录屏",
    duration: "31:04",
    status: "已写入画像",
    libraryState: "已写入画像",
    deposited: true,
    excerpt:
      "资料不是安全感，完成一轮最小闭环才是安全感。先让自己看到进度，再谈优化方法。",
    signals: ["资料焦虑", "最小闭环", "备考节奏"],
    candidates: ["资料不是安全感", "先完成一轮闭环", "用进度替代焦虑"]
  },
  {
    id: "v-20260513",
    title: "职场新人不要把复盘写成检讨书",
    source: "短视频口播",
    duration: "06:47",
    status: "转写完成",
    libraryState: "未写入",
    deposited: false,
    excerpt:
      "复盘不是证明自己有多努力，也不是承认自己多失败。它只回答三个问题：哪里失真，为什么失真，下次怎么提前发现。",
    signals: ["复盘", "职场沟通", "判断标准"],
    candidates: ["复盘不是检讨", "提前发现失真", "用问题定位替代情绪归因"]
  }
];

export const platformRules: Record<Platform, { name: string; rule: string; icon: LucideIcon }> = {
  xiaohongshu: {
    name: "小红书",
    rule: "短段落、强场景，标题直接点出痛点，转化要轻，不使用夸张承诺。",
    icon: MessageSquareQuote
  },
  zhihu: {
    name: "知乎",
    rule: "结论先行，结构完整，强调方法论和可信判断，弱化营销感。",
    icon: BookOpenText
  },
  x: {
    name: "X",
    rule: "短句为主，观点密度高，开头抓人，适合连续观点输出。",
    icon: Radio
  }
};

export const flowSteps = [
  { title: "上传视频", detail: "本地视频、直播回放、课程录屏", icon: UploadCloud },
  { title: "解析表达", detail: "提取观点、案例、语气和结构", icon: LibraryBig },
  { title: "确认写入", detail: "用户确认后才进入人物画像", icon: BookOpenText },
  { title: "多平台流转", detail: "生成小红书、知乎、X 可编辑稿件", icon: PenLine }
];

export const generatedDraft = {
  title: "普通人考研最容易高估的，不是努力，是执行力",
  platform: "小红书",
  body:
    "很多人做计划的时候，默认自己每天都精神很好、时间完整、没有临时任务。\n\n问题是，备考不是在理想状态里发生的。\n\n你真正要做的不是把计划排满，而是先设计一个“最差状态也能完成”的版本。比如今天只能学 90 分钟，那这 90 分钟里最不能丢的是什么？先把它保住。\n\n计划能落地，比计划看起来厉害重要得多。",
  notes: ["标题还可以再克制一点。", "可以补一个真实学生案例。", "当前反馈只影响本稿，未写回画像。"]
};

export const historyTasks = [
  {
    id: "task-20260525-01",
    title: generatedDraft.title,
    source: sourceVideos[0].title,
    persona: personas[0].name,
    platforms: ["小红书", "知乎"],
    status: "已生成",
    hasFeedback: true,
    deposited: false,
    updatedAt: "2026-05-25 15:18"
  },
  {
    id: "task-20260524-02",
    title: "资料越多，越容易不开始",
    source: sourceVideos[1].title,
    persona: personas[0].name,
    platforms: ["知乎"],
    status: "已沉淀",
    hasFeedback: true,
    deposited: true,
    updatedAt: "2026-05-24 21:06"
  },
  {
    id: "task-20260523-03",
    title: "复盘不是检讨书",
    source: sourceVideos[2].title,
    persona: "无画像",
    platforms: ["X"],
    status: "草稿",
    hasFeedback: false,
    deposited: false,
    updatedAt: "2026-05-23 19:44"
  }
];
