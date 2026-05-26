type EnvConfig = {
  deepseekApiKey?: string;
  deepseekBaseUrl: string;
  deepseekModel: string;
  asrProvider: "funasr" | "openai";
  ffmpegPath: string;
  funasrModelDir?: string;
  openaiApiKey?: string;
  openaiTranscribeModel: string;
  appStorageDir: string;
  maxUploadMb: number;
  databaseUrl?: string;
};

function numberFromEnv(value: string | undefined, fallback: number): number {
  if (!value) return fallback;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getEnv(): EnvConfig {
  const asrProvider = process.env.ASR_PROVIDER === "openai" ? "openai" : "funasr";

  return {
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
    deepseekModel: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
    asrProvider,
    ffmpegPath: process.env.FFMPEG_PATH ?? "ffmpeg",
    funasrModelDir: process.env.FUNASR_MODEL_DIR,
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiTranscribeModel: process.env.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-mini-transcribe",
    appStorageDir: process.env.APP_STORAGE_DIR ?? "./storage",
    maxUploadMb: numberFromEnv(process.env.MAX_UPLOAD_MB, 500),
    databaseUrl: process.env.DATABASE_URL
  };
}

export function requireEnv(name: keyof EnvConfig, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${String(name)}`);
  }

  return value;
}
