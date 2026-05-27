import { callDeepSeekChat } from "@/lib/server/deepseek";
import {
  buildPlatformRewritePrompt,
  buildTranscriptAnalysisPrompt,
  buildVoiceAlignedRewritePrompt,
  buildCreatorProfileSuggestionPrompt
} from "@/lib/pipeline/prompts";
import type {
  GeneratedPlatformDraft,
  Platform,
  TranscriptAnalysis,
  CreatorProfile,
  CreatorProfileSuggestions
} from "@/lib/pipeline/types";

function parseJsonResponse<T>(content: string): T {
  try {
    return JSON.parse(content) as T;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("Model response was not valid JSON.");
    }

    return JSON.parse(match[0]) as T;
  }
}

export async function analyzeTranscript(transcript: string): Promise<TranscriptAnalysis> {
  const content = await callDeepSeekChat({
    responseFormat: "json_object",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: [
          "你是中文知识创作者的视频内容分析助手。",
          "你的任务是将视频转写文本分析成结构化数据。",
          "你必须只输出合法 JSON，不要 markdown 代码块，不要解释。",
          "JSON 必须包含以下字段：topic, summary, core_points, cases, quotes, content_angles, risk_notes。",
          "core_points 每一项必须包含 point, evidence, usable_for_platforms。",
          "usable_for_platforms 只能是：xiaohongshu, douyin, bilibili, zhihu, x。",
          "如果转写文本为空或乱码，请返回空数组和空字符串，不要编造内容。"
        ].join("\n")
      },
      {
        role: "user",
        content: buildTranscriptAnalysisPrompt(transcript)
      }
    ]
  });

  return parseJsonResponse<TranscriptAnalysis>(content);
}

export async function suggestCreatorProfileUpdates(params: {
  transcript: string;
  currentProfile?: CreatorProfile;
}): Promise<CreatorProfileSuggestions> {
  const content = await callDeepSeekChat({
    responseFormat: "json_object",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: [
          "你是中文创作者的人物表达画像分析助手。",
          "你的任务是从视频转写中分析创作者表达特征，并提出画像更新建议。",
          "建议分为两类：",
          "  - additions：当前画像中没有的新特征（新增）",
          "  - modifications：当前画像中已有但需要调整的特征（修改）",
          "你必须只输出合法 JSON，不要 markdown 代码块，不要解释。",
          "JSON 必须包含：additions, modifications, evidence_segments。",
          "additions 和 modifications 都是数组，每一项包含 field（字段名）和 value（内容）。",
          "modifications 每一项额外包含 from（原值）和 to（建议值）。",
          "如果转写文本为空或乱码，返回空数组，不要编造内容。"
        ].join("\n")
      },
      {
        role: "user",
        content: buildCreatorProfileSuggestionPrompt(params.transcript, params.currentProfile)
      }
    ]
  });

  return parseJsonResponse<CreatorProfileSuggestions>(content);
}

/** @deprecated Use suggestCreatorProfileUpdates */
export const suggestVoiceProfileUpdates = suggestCreatorProfileUpdates;

export async function generatePlatformDraft(params: {
  transcript: string;
  analysis: TranscriptAnalysis;
  platform: Platform;
  voiceProfile?: CreatorProfile;
  feedback?: string[];
}): Promise<GeneratedPlatformDraft> {
  const content = await callDeepSeekChat({
    responseFormat: "json_object",
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content: [
          "你是中文知识创作者的多平台内容改写助手。",
          "你根据原始视频转写、内容分析、创作者画像和目标平台规则，生成可直接发布的文案。",
          "你必须只输出合法 JSON，不要 markdown 代码块，不要解释。",
          "JSON 必须包含：platform, title, content, notes。",
          "platform 是目标平台标识符（如 xiaohongshu）。",
          "title 是文案标题。",
          "content 是完整发布文案。",
          "notes 是字符串数组，说明改写时的关键决策（如为什么选这个角度、如何适配平台）。",
          "如果原始内容为空或乱码，返回空字符串和说明性 notes，不要编造内容。"
        ].join("\n")
      },
      {
        role: "user",
        content: buildPlatformRewritePrompt(params)
      }
    ]
  });

  return parseJsonResponse<GeneratedPlatformDraft>(content);
}

export async function generateVoiceAlignedDraft(params: {
  transcript: string;
  analysis: TranscriptAnalysis;
  platform: Platform;
  voiceProfile?: CreatorProfile;
}): Promise<GeneratedPlatformDraft> {
  const content = await callDeepSeekChat({
    responseFormat: "json_object",
    temperature: 0.45,
    messages: [
      {
        role: "system",
        content: [
          "你是中文知识创作者的视频内容流转助手。",
          "你的任务是先判断视频内容与所选人物画像的关系，再按目标平台写成可发布文案。",
          "你必须只输出合法 JSON，不要 markdown 代码块，不要解释。",
          "JSON 必须包含：platform, title, content, notes, voice_alignment。",
          "voice_alignment 必须包含：matched_traits, conflicts, suggestions（均为字符串数组）。",
          "如果原始内容为空或乱码，返回空字符串和说明性 notes，不要编造内容。"
        ].join("\n")
      },
      {
        role: "user",
        content: buildVoiceAlignedRewritePrompt(params)
      }
    ]
  });

  return parseJsonResponse<GeneratedPlatformDraft>(content);
}
