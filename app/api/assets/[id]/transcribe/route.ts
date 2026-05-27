import { ensureMigrations } from "@/lib/db/migrate";
import { getDb } from "@/lib/db";
import { sourceAssets, transcripts } from "@/lib/db/schema";
import { uid, json, jsonError, now } from "@/lib/api-utils";
import { eq } from "drizzle-orm";
import { getEnv } from "@/lib/server/env";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { unlink, readFile } from "node:fs/promises";
import { join } from "node:path";

const execFileAsync = promisify(execFile);

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();
  const env = getEnv();

  const [asset] = await db.select().from(sourceAssets).where(eq(sourceAssets.id, id));
  if (!asset) return jsonError("素材不存在", 404);

  if (asset.status !== "uploaded" && asset.status !== "failed") {
    return jsonError("素材当前状态不支持转写", 400);
  }

  try {
    await db
      .update(sourceAssets)
      .set({ status: "transcribing", updatedAt: now() })
      .where(eq(sourceAssets.id, id));

    const transcriptText = await transcribeAsset(asset.filePath, env);

    const [existing] = await db
      .select()
      .from(transcripts)
      .where(eq(transcripts.assetId, id));

    if (existing) {
      await db
        .update(transcripts)
        .set({ fullText: transcriptText, segments: "[]" })
        .where(eq(transcripts.id, existing.id));
    } else {
      await db.insert(transcripts).values({
        id: uid(),
        assetId: id,
        fullText: transcriptText,
        segments: "[]",
        createdAt: now(),
      });
    }

    await db
      .update(sourceAssets)
      .set({ status: "transcribed", updatedAt: now() })
      .where(eq(sourceAssets.id, id));

    return json({ status: "transcribed", transcript: transcriptText });
  } catch (err) {
    await db
      .update(sourceAssets)
      .set({ status: "failed", updatedAt: now() })
      .where(eq(sourceAssets.id, id));
    const message = err instanceof Error ? err.message : String(err);
    return jsonError(`转写失败: ${message}`, 500);
  }
}

async function transcribeAsset(
  filePath: string,
  env: ReturnType<typeof getEnv>
): Promise<string> {
  if (env.asrProvider === "openai" && env.openaiApiKey) {
    return transcribeWithOpenAI(filePath, env);
  }
  return transcribeWithFunASR(filePath, env);
}

async function transcribeWithFunASR(
  filePath: string,
  env: ReturnType<typeof getEnv>
): Promise<string> {
  const wavPath = filePath.replace(/\.[^.]+$/, ".wav");
  const { stderr } = await execFileAsync(env.ffmpegPath, [
    "-i", filePath,
    "-vn",
    "-acodec", "pcm_s16le",
    "-ar", "16000",
    "-ac", "1",
    "-y",
    wavPath,
  ]);

  if (stderr) {
    console.error("FFmpeg stderr:", stderr);
  }

  try {
    const scriptPath = join(process.cwd(), "scripts", "transcribe.py");
    const { stdout } = await execFileAsync("python", [
      scriptPath,
      "--audio", wavPath,
      "--model-dir", env.funasrModelDir || "",
    ], { env: { ...process.env, PYTHONIOENCODING: "utf-8" } });

    return stdout.trim();
  } finally {
    await unlink(wavPath).catch(() => {});
  }
}

async function transcribeWithOpenAI(
  filePath: string,
  env: ReturnType<typeof getEnv>
): Promise<string> {
  const wavPath = filePath.replace(/\.[^.]+$/, ".wav");
  await execFileAsync(env.ffmpegPath, [
    "-i", filePath,
    "-vn",
    "-acodec", "pcm_s16le",
    "-ar", "16000",
    "-ac", "1",
    "-y",
    wavPath,
  ]);

  try {
    const audioBuffer = await readFile(wavPath);
    const blob = new Blob([audioBuffer], { type: "audio/wav" });
    const formData = new FormData();
    formData.append("file", blob, "audio.wav");
    formData.append("model", env.openaiTranscribeModel);
    formData.append("language", "zh");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.openaiApiKey}` },
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`OpenAI Whisper error: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as { text: string };
    return data.text;
  } finally {
    await unlink(wavPath).catch(() => {});
  }
}
