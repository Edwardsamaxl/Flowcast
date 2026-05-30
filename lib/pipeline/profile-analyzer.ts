import { callDeepSeekChat } from "@/lib/server/deepseek";
import type {
  CreatorProfile,
  ProfileAnalysisResult,
} from "./types";
import { createPromptEngine } from "./prompt-engine";

export interface ProfileAnalyzer {
  analyze(
    transcript: string,
    currentProfile?: CreatorProfile
  ): Promise<ProfileAnalysisResult>;
}

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

export function createProfileAnalyzer(): ProfileAnalyzer {
  const promptEngine = createPromptEngine();

  return {
    async analyze(
      transcript: string,
      currentProfile?: CreatorProfile
    ): Promise<ProfileAnalysisResult> {
      const prompt = promptEngine.buildProfileSuggestionPrompt(
        transcript,
        currentProfile
      );

      const content = await callDeepSeekChat({
        responseFormat: "json_object",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: [
              "你是中文创作者的人物表达画像分析助手。",
              "你的任务是从视频转写中全面分析创作者的表达特征，并提出画像更新建议。",
              "建议分为两类：additions（新增）和 modifications（修改）。",
              "同时提取 insights（自由洞察），每条 insight 包含 content、tags、evidence。",
              "你必须只输出合法 JSON，不要 markdown 代码块，不要解释。",
              "JSON 必须包含：additions, modifications, insights, evidenceSegments。",
              "additions 和 modifications 数组项包含 dimension（7个核心维度之一）、type、field、value/from/to。",
              "如果转写文本为空或乱码，返回空数组，不要编造内容。",
            ].join("\n"),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const raw = parseJsonResponse<
        Partial<{
          additions: Array<Partial<ProfileAnalysisResult["additions"][number]>>;
          modifications: Array<
            Partial<ProfileAnalysisResult["modifications"][number]>
          >;
          insights: Array<
            Partial<ProfileAnalysisResult["insights"][number]>
          >;
          evidenceSegments: string[];
          evidence_segments: string[];
        }>
      >(content);

      const additions: ProfileAnalysisResult["additions"] = Array.isArray(
        raw.additions
      )
        ? raw.additions
            .map((a) => ({
              dimension: a.dimension,
              type: (a.type === "modification" ? "modification" : "addition") as
                | "addition"
                | "modification",
              field: a.field || "",
              value: a.value || "",
              from: a.from,
              to: a.to,
            }))
            .filter((a) => a.field)
        : [];

      const modifications: ProfileAnalysisResult["modifications"] = Array.isArray(
        raw.modifications
      )
        ? raw.modifications
            .map((m) => ({
              dimension: m.dimension,
              type: (m.type === "addition" ? "addition" : "modification") as
                | "addition"
                | "modification",
              field: m.field || "",
              from: m.from || "",
              to: m.to || "",
            }))
            .filter((m) => m.field)
        : [];

      const insights: ProfileAnalysisResult["insights"] = Array.isArray(
        raw.insights
      )
        ? raw.insights
            .map((i) => ({
              content: i.content || "",
              tags: Array.isArray(i.tags) ? i.tags : [],
              evidence: i.evidence,
            }))
            .filter((i) => i.content)
        : [];

      const evidenceSegments =
        raw.evidenceSegments || raw.evidence_segments || [];

      return {
        additions,
        modifications,
        insights,
        evidenceSegments,
      };
    },
  };
}
