import { callDeepSeekChat } from "@/lib/server/deepseek";
import {
  buildPlatformRewritePrompt,
  buildTranscriptAnalysisPrompt,
  buildVoiceAlignedRewritePrompt,
  buildVoiceProfileSuggestionPrompt
} from "@/lib/pipeline/prompts";
import type {
  GeneratedPlatformDraft,
  Platform,
  TranscriptAnalysis,
  VoiceProfile,
  VoiceProfileSuggestions
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

export async function suggestVoiceProfileUpdates(params: {
  transcript: string;
  currentProfile?: VoiceProfile;
}): Promise<VoiceProfileSuggestions> {
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
        content: buildVoiceProfileSuggestionPrompt(params.transcript, params.currentProfile)
      }
    ]
  });

  return parseJsonResponse<VoiceProfileSuggestions>(content);
}

export async function generatePlatformDraft(params: {
  transcript: string;
  analysis: TranscriptAnalysis;
  platform: Platform;
  voiceProfile?: VoiceProfile;
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
  voiceProfile?: VoiceProfile;
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
