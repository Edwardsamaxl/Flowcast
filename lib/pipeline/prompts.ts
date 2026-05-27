import type { Platform, CreatorProfile } from "@/lib/pipeline/types";

export const platformNames: Record<Platform, string> = {
  xiaohongshu: "小红书",
  douyin: "抖音",
  bilibili: "B站",
  zhihu: "知乎",
  x: "X",
};

export const defaultPlatformRules: Record<Platform, string> = {
  xiaohongshu: "短段落，强场景，标题直接点出痛点，转化要轻，不使用夸张承诺。",
  douyin: "口播节奏强，开头抓人，适合30-60秒短视频脚本，口语化，有互动感。",
  bilibili: "结构完整，信息密度高，适合长视频简介和动态文案，允许适度玩梗。",
  zhihu: "结论先行，结构完整，强调方法论和可信判断，弱化营销感。",
  x: "短句为主，观点密度高，开头抓人，口语化，适合连续观点输出。",
};

export const allPlatforms: Platform[] = ["xiaohongshu", "douyin", "bilibili", "zhihu", "x"];

export function buildTranscriptAnalysisPrompt(transcript: string): string {
  return [
    "你是中文知识创作者的视频内容分析助手。",
    "请把下面的视频转写文本分析成严格 JSON，不要输出 Markdown。",
    "JSON 字段必须包含：topic, summary, core_points, cases, quotes, content_angles, risk_notes。",
    "core_points 每一项必须包含 point, evidence, usable_for_platforms。",
    `usable_for_platforms 只能从以下平台中选择：${allPlatforms.join(", ")}。`,
    "",
    "转写文本：",
    transcript
  ].join("\n");
}

export function buildCreatorProfileSuggestionPrompt(transcript: string, currentProfile?: CreatorProfile): string {
  const example = {
    additions: [
      { field: "语气", value: "喜欢用反问句引发思考" },
      { field: "高频观点", value: "长期主义比短期爆发更重要" }
    ],
    modifications: [
      { field: "定位", from: "互联网运营专家", to: "SaaS 增长顾问" }
    ],
    evidence_segments: ["原文片段1", "原文片段2"]
  };

  return [
    "你是中文创作者的人物表达画像分析助手。",
    "你的任务是从视频转写中分析创作者表达特征，并提出画像更新建议。",
    "建议分为两类：",
    "  - additions：当前画像中没有的新特征（如新的语气、新的高频观点、新的常用案例）",
    "  - modifications：当前画像中已有但需要调整的特征（如定位微调、语气修正）",
    "请输出严格 JSON，不要输出 Markdown。",
    `输出格式示例：${JSON.stringify(example, null, 2)}`,
    currentProfile ? `当前创作者画像（请基于此判断哪些是 additions，哪些是 modifications）：${JSON.stringify(currentProfile)}` : "当前没有创作者画像，所有建议都放入 additions。",
    "",
    "视频转写：",
    transcript
  ].join("\n");
}

/** @deprecated Use buildCreatorProfileSuggestionPrompt */
export const buildVoiceProfileSuggestionPrompt = buildCreatorProfileSuggestionPrompt;

export function buildPlatformRewritePrompt(params: {
  transcript: string;
  analysis: unknown;
  platform: Platform;
  voiceProfile?: CreatorProfile;
  feedback?: string[];
}): string {
  const platformRule = params.voiceProfile?.platform_rules[params.platform] ?? defaultPlatformRules[params.platform];

  const example = {
    platform: params.platform,
    title: "示例标题",
    content: "示例文案内容...",
    notes: ["选择这个角度是因为...", "平台适配点：..."]
  };

  const lines = [
    "你是中文知识创作者的多平台内容改写助手。",
    "请根据原始转写、内容分析、人物画像和平台规则，生成可直接编辑的发布稿。",
    "请输出严格 JSON，不要输出 Markdown。",
    "JSON 字段必须包含：platform, title, content, notes。",
    `输出格式示例：${JSON.stringify(example, null, 2)}`,
    `目标平台：${platformNames[params.platform]} (${params.platform})`,
    `平台规则：${platformRule}`,
    params.voiceProfile ? `人物画像：${JSON.stringify(params.voiceProfile)}` : "人物画像：无。请保持自然、克制、清晰。",
    `内容分析：${JSON.stringify(params.analysis)}`,
  ];

  if (params.feedback && params.feedback.length > 0) {
    lines.push("");
    lines.push("用户反馈（请在改写时优先处理以下反馈）：");
    params.feedback.forEach((f, i) => lines.push(`${i + 1}. ${f}`));
  }

  lines.push("");
  lines.push("原始转写：");
  lines.push(params.transcript);

  return lines.join("\n");
}

export function buildVoiceAlignedRewritePrompt(params: {
  transcript: string;
  analysis: unknown;
  platform: Platform;
  voiceProfile?: CreatorProfile;
}): string {
  const platformRule = params.voiceProfile?.platform_rules[params.platform] ?? defaultPlatformRules[params.platform];

  const example = {
    platform: params.platform,
    title: "示例标题",
    content: "示例文案内容...",
    notes: ["选择这个角度是因为..."],
    voice_alignment: {
      matched_traits: ["语气一致", "观点一致"],
      conflicts: ["案例与画像定位略有偏差"],
      suggestions: ["改用画像中的常用案例以增强一致性"]
    }
  };

  return [
    "你是中文知识创作者的视频内容流转助手。",
    "你的任务不是泛泛改写，而是先判断这条视频内容与所选人物画像的关系，再按目标平台写成可发布文案。",
    "请输出严格 JSON，不要输出 Markdown。",
    "JSON 字段必须包含：platform, title, content, notes, voice_alignment。",
    `输出格式示例：${JSON.stringify(example, null, 2)}`,
    "voice_alignment 必须包含：matched_traits, conflicts, suggestions（均为字符串数组）。",
    `目标平台：${platformNames[params.platform]} (${params.platform})`,
    `平台规则：${platformRule}`,
    params.voiceProfile ? `人物画像：${JSON.stringify(params.voiceProfile)}` : "人物画像：无。请保持自然、克制、清晰。",
    `内容分析：${JSON.stringify(params.analysis)}`,
    "",
    "原始转写：",
    params.transcript
  ].join("\n");
}
