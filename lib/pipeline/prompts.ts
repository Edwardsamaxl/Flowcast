import type { Platform, VoiceProfile } from "@/lib/pipeline/types";

export const platformNames: Record<Platform, string> = {
  xiaohongshu: "小红书",
  zhihu: "知乎",
  x: "X"
};

export const defaultPlatformRules: Record<Platform, string> = {
  xiaohongshu: "短段落，强场景，标题直接点出痛点，转化要轻，不使用夸张承诺。",
  zhihu: "结论先行，结构完整，强调方法论和可信判断，弱化营销感。",
  x: "短句为主，观点密度高，开头抓人，适合连续观点输出。"
};

export function buildTranscriptAnalysisPrompt(transcript: string): string {
  return [
    "你是中文知识创作者的视频内容分析助手。",
    "请把下面的视频转写文本分析成严格 JSON，不要输出 Markdown。",
    "JSON 字段必须包含：topic, summary, core_points, cases, quotes, content_angles, risk_notes。",
    "core_points 每一项必须包含 point, evidence, usable_for_platforms。",
    "usable_for_platforms 只能从 xiaohongshu, zhihu, x 中选择。",
    "",
    "转写文本：",
    transcript
  ].join("\n");
}

export function buildVoiceProfileSuggestionPrompt(transcript: string, currentProfile?: VoiceProfile): string {
  return [
    "你是中文创作者的人物表达画像分析助手。",
    "你的任务是从视频转写中提出人物画像更新建议，而不是直接覆盖旧画像。",
    "请输出严格 JSON，不要输出 Markdown。",
    "JSON 字段必须包含：positioning_suggestions, tone_suggestions, belief_suggestions, case_suggestions, common_pattern_suggestions, avoid_phrase_suggestions, evidence_segments。",
    currentProfile ? `当前人物画像：${JSON.stringify(currentProfile)}` : "当前没有人物画像。",
    "",
    "视频转写：",
    transcript
  ].join("\n");
}

export function buildPlatformRewritePrompt(params: {
  transcript: string;
  analysis: unknown;
  platform: Platform;
  voiceProfile?: VoiceProfile;
}): string {
  const platformRule = params.voiceProfile?.platform_rules[params.platform] ?? defaultPlatformRules[params.platform];

  return [
    "你是中文知识创作者的多平台内容改写助手。",
    "请根据原始转写、内容分析、人物画像和平台规则，生成可直接编辑的发布稿。",
    "请输出严格 JSON，不要输出 Markdown。",
    "JSON 字段必须包含：platform, title, content, notes。",
    `目标平台：${platformNames[params.platform]} (${params.platform})`,
    `平台规则：${platformRule}`,
    params.voiceProfile ? `人物画像：${JSON.stringify(params.voiceProfile)}` : "人物画像：无。请保持自然、克制、清晰。",
    `内容分析：${JSON.stringify(params.analysis)}`,
    "",
    "原始转写：",
    params.transcript
  ].join("\n");
}

export function buildVoiceAlignedRewritePrompt(params: {
  transcript: string;
  analysis: unknown;
  platform: Platform;
  voiceProfile?: VoiceProfile;
}): string {
  const platformRule = params.voiceProfile?.platform_rules[params.platform] ?? defaultPlatformRules[params.platform];

  return [
    "你是中文知识创作者的视频内容流转助手。",
    "你的任务不是泛泛改写，而是先判断这条视频内容与所选人物画像的关系，再按目标平台写成可发布文案。",
    "请输出严格 JSON，不要输出 Markdown。",
    "JSON 字段必须包含：platform, title, content, notes, voice_alignment。",
    "voice_alignment 必须包含：matched_traits, conflicts, suggestions。",
    "matched_traits 表示视频内容与人物画像一致的观点、语气、结构或禁用表达遵守情况。",
    "conflicts 表示视频内容或生成稿可能与人物画像冲突的地方。",
    "suggestions 表示为了更像该人物，本次改写采用的调整。",
    `目标平台：${platformNames[params.platform]} (${params.platform})`,
    `平台规则：${platformRule}`,
    params.voiceProfile ? `人物画像：${JSON.stringify(params.voiceProfile)}` : "人物画像：无。请保持自然、克制、清晰。",
    `内容分析：${JSON.stringify(params.analysis)}`,
    "",
    "原始转写：",
    params.transcript
  ].join("\n");
}
