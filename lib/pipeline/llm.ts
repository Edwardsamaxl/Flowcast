import { callDeepSeekChat } from "@/lib/server/deepseek";
import { createPromptEngine } from "@/lib/pipeline/prompt-engine";
import { createProfileAnalyzer } from "@/lib/pipeline/profile-analyzer";
import type {
  GeneratedPlatformDraft,
  Platform,
  TranscriptAnalysis,
  CreatorProfile,
  ProfileAnalysisResult,
} from "@/lib/pipeline/types";

const promptEngine = createPromptEngine();

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
          "usable_for_platforms 是平台标识符数组，根据内容适配性填写。",
          "如果转写文本为空或乱码，请返回空数组和空字符串，不要编造内容。"
        ].join("\n")
      },
      {
        role: "user",
        content: promptEngine.buildAnalysisPrompt(transcript)
      }
    ]
  });

  return parseJsonResponse<TranscriptAnalysis>(content);
}

/**
 * Analyze transcript and suggest profile updates.
 * Returns structured suggestions across 7 core dimensions + insights.
 */
export async function suggestCreatorProfileUpdates(params: {
  transcript: string;
  currentProfile?: CreatorProfile;
}): Promise<ProfileAnalysisResult> {
  const analyzer = createProfileAnalyzer();
  return analyzer.analyze(params.transcript, params.currentProfile);
}

/** @deprecated Use suggestCreatorProfileUpdates */
export const suggestVoiceProfileUpdates = suggestCreatorProfileUpdates;

export async function generatePlatformDraft(params: {
  transcript: string;
  analysis: TranscriptAnalysis;
  platform: Platform;
  voiceProfile?: CreatorProfile;
  platformRule?: { ruleTemplate: string; promptOverride?: string };
  feedback?: string[];
}): Promise<GeneratedPlatformDraft> {
  const rule = params.platformRule ?? { ruleTemplate: "" };

  const creatorProfile: CreatorProfile = params.voiceProfile ?? {
    id: "",
    creatorId: "",
    positioning: "",
    tone: [],
    beliefs: [],
    structures: [],
    avoid_phrases: [],
    title_preference: "",
    catchphrases: [],
    insights: [],
  };

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
          "platform 是目标平台标识符。",
          "title 是文案标题。",
          "content 是完整发布文案。",
          "notes 是字符串数组，说明改写时的关键决策。",
          "如果原始内容为空或乱码，返回空字符串和说明性 notes，不要编造内容。"
        ].join("\n")
      },
      {
        role: "user",
        content: promptEngine.buildRewritePrompt({
          transcript: params.transcript,
          analysis: params.analysis,
          platform: params.platform,
          creatorProfile,
          platformRule: rule,
          feedback: params.feedback,
        })
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
  platformRule?: { ruleTemplate: string; promptOverride?: string };
}): Promise<GeneratedPlatformDraft> {
  const rule = params.platformRule ?? { ruleTemplate: "" };

  const creatorProfile: CreatorProfile = params.voiceProfile ?? {
    id: "",
    creatorId: "",
    positioning: "",
    tone: [],
    beliefs: [],
    structures: [],
    avoid_phrases: [],
    title_preference: "",
    catchphrases: [],
    insights: [],
  };

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
        content: promptEngine.buildVoiceAlignedPrompt({
          transcript: params.transcript,
          analysis: params.analysis,
          platform: params.platform,
          creatorProfile,
          platformRule: rule,
        })
      }
    ]
  });

  return parseJsonResponse<GeneratedPlatformDraft>(content);
}
