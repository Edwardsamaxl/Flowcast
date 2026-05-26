import { access, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    args.set(argv[index], argv[index + 1]);
  }
  return args;
}

async function loadEnv(filePath) {
  const content = await readFile(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = valueParts.join("=");
    }
  }
}

async function firstExistingEnvFile() {
  for (const candidate of [".env.local", ".env"]) {
    const absolutePath = path.resolve(candidate);
    try {
      await access(absolutePath);
      return absolutePath;
    } catch {
      // Try the next conventional env file.
    }
  }

  throw new Error("Missing .env.local or .env in the project root.");
}

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("DeepSeek response did not contain JSON.");
    return JSON.parse(match[0]);
  }
}

const args = parseArgs(process.argv.slice(2));
const transcriptPath = args.get("--transcript");
const outPath = args.get("--out");

if (!transcriptPath || !outPath) {
  throw new Error("Usage: node scripts/analyze-transcript.mjs --transcript <txt> --out <json>");
}

await loadEnv(await firstExistingEnvFile());

const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey) {
  throw new Error("Missing DEEPSEEK_API_KEY in .env.local");
}

const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
const transcript = await readFile(transcriptPath, "utf8");

const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "你是中文知识创作者的视频内容分析助手。你只输出严格 JSON。"
      },
      {
        role: "user",
        content: [
          "请分析下面的视频转写文本，输出 JSON。",
          "字段必须包含：topic, summary, core_points, cases, quotes, content_angles, risk_notes。",
          "core_points 每一项包含 point, evidence, usable_for_platforms。usable_for_platforms 只能包含 xiaohongshu, zhihu, x。",
          "",
          "转写文本：",
          transcript
        ].join("\n")
      }
    ]
  })
});

if (!response.ok) {
  throw new Error(`DeepSeek request failed: ${response.status} ${await response.text()}`);
}

const data = await response.json();
const content = data.choices?.[0]?.message?.content;
if (!content) {
  throw new Error("DeepSeek response did not include content.");
}

const analysis = extractJson(content);
await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, JSON.stringify(analysis, null, 2), "utf8");

console.log(JSON.stringify(analysis, null, 2));
