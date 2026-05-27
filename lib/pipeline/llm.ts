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
        content: "你只输出严格 JSON。不要解释，不要使用 Markdown。"
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
        content: "你只输出严格 JSON。不要解释，不要使用 Markdown。"
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
        content: "你只输出严格 JSON。不要解释，不要使用 Markdown。"
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
        content: "你只输出严格 JSON。不要解释，不要使用 Markdown。"
      },
      {
        role: "user",
        content: buildVoiceAlignedRewritePrompt(params)
      }
    ]
  });

  return parseJsonResponse<GeneratedPlatformDraft>(content);
}
