import { getEnv, requireEnv } from "@/lib/server/env";

type DeepSeekMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type DeepSeekChatOptions = {
  messages: DeepSeekMessage[];
  model?: string;
  temperature?: number;
  responseFormat?: "json_object";
};

type DeepSeekChatResponse = {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
};

export async function callDeepSeekChat(options: DeepSeekChatOptions): Promise<string> {
  const env = getEnv();
  const apiKey = requireEnv("deepseekApiKey", env.deepseekApiKey);

  const response = await fetch(`${env.deepseekBaseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: options.model ?? env.deepseekModel,
      messages: options.messages,
      temperature: options.temperature ?? 0.4,
      response_format: options.responseFormat ? { type: options.responseFormat } : undefined
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as DeepSeekChatResponse;
  const content = data.choices[0]?.message.content;

  if (!content) {
    throw new Error("DeepSeek response did not include message content.");
  }

  return content;
}
