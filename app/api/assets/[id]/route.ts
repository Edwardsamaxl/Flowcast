import { ensureMigrations } from "@/lib/db/migrate";
import { getDb } from "@/lib/db";
import { sourceAssets, transcripts, analyses, creators, creatorProfiles, profileSuggestions } from "@/lib/db/schema";
import { uid, json, jsonError, now, parseJsonField } from "@/lib/api-utils";
import { eq } from "drizzle-orm";
import { getEnv } from "@/lib/server/env";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { unlink, readFile } from "node:fs/promises";
import { join } from "node:path";
import { analyzeTranscript, suggestCreatorProfileUpdates } from "@/lib/pipeline/llm";
import type { CreatorProfile, Platform } from "@/lib/pipeline/types";

const execFileAsync = promisify(execFile);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();

  const [asset] = await db.select().from(sourceAssets).where(eq(sourceAssets.id, id));
  if (!asset) return jsonError("素材不存在", 404);

  const [transcript] = await db.select().from(transcripts).where(eq(transcripts.assetId, id));
  const [analysis] = await db.select().from(analyses).where(eq(analyses.assetId, id));

  let profileSuggestion = null;
  if (asset.creatorId) {
    const [sugg] = await db
      .select()
      .from(profileSuggestions)
      .where(eq(profileSuggestions.assetId, id));
    if (sugg) {
      profileSuggestion = {
        ...sugg,
        suggestions: parseJsonField(sugg.suggestions, {}),
      };
    }
  }

  return json({
    ...asset,
    transcript: transcript
      ? { ...transcript, segments: parseJsonField(transcript.segments, []) }
      : null,
    analysis: analysis
      ? {
          ...analysis,
          corePoints: parseJsonField(analysis.corePoints, []),
          cases: parseJsonField<string[]>(analysis.cases, []),
          quotes: parseJsonField<string[]>(analysis.quotes, []),
          contentAngles: parseJsonField<string[]>(analysis.contentAngles, []),
          riskNotes: parseJsonField<string[]>(analysis.riskNotes, []),
        }
      : null,
    profileSuggestion,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();
  const env = getEnv();

  const [asset] = await db.select().from(sourceAssets).where(eq(sourceAssets.id, id));
  if (!asset) return jsonError("素材不存在", 404);

  try {
    await db.update(sourceAssets).set({ status: "transcribing", updatedAt: now() }).where(eq(sourceAssets.id, id));

    const transcriptText = await transcribeAsset(asset.filePath, env);

    const transcriptId = uid();
    await db.insert(transcripts).values({
      id: transcriptId,
      assetId: id,
      fullText: transcriptText,
      segments: "[]",
      createdAt: now(),
    });

    await db.update(sourceAssets).set({ status: "analyzing", updatedAt: now() }).where(eq(sourceAssets.id, id));

    const analysis = await analyzeTranscript(transcriptText);

    const analysisId = uid();
    await db.insert(analyses).values({
      id: analysisId,
      assetId: id,
      topic: analysis.topic,
      summary: analysis.summary,
      corePoints: JSON.stringify(analysis.core_points),
      cases: JSON.stringify(analysis.cases),
      quotes: JSON.stringify(analysis.quotes),
      contentAngles: JSON.stringify(analysis.content_angles),
      riskNotes: JSON.stringify(analysis.risk_notes),
      createdAt: now(),
    });

    await db.update(sourceAssets).set({ status: "analyzed", updatedAt: now() }).where(eq(sourceAssets.id, id));

    // Generate creator profile suggestions if asset is linked to a creator
    if (asset.creatorId) {
      try {
        const [c] = await db.select().from(creators).where(eq(creators.id, asset.creatorId));
        const [p] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.creatorId, asset.creatorId));
        if (c && p) {
          const currentProfile: CreatorProfile = {
            persona_id: c.id,
            name: c.name,
            positioning: p.positioning,
            domain: p.domain,
            tone: parseJsonField<string[]>(p.tone, []),
            beliefs: parseJsonField<string[]>(p.beliefs, []),
            cases: parseJsonField<string[]>(p.cases, []),
            common_patterns: parseJsonField<string[]>(p.commonPatterns, []),
            avoid_phrases: parseJsonField<string[]>(p.avoidPhrases, []),
            title_preference: p.titlePreference,
            platform_rules: parseJsonField<Record<string, string>>(p.platformRules, {}) as Record<Platform, string>,
          };
          const suggestions = await suggestCreatorProfileUpdates({
            transcript: transcriptText,
            currentProfile,
          });
          await db.insert(profileSuggestions).values({
            id: uid(),
            assetId: id,
            creatorId: asset.creatorId,
            suggestions: JSON.stringify(suggestions),
            status: "pending",
            createdAt: now(),
            updatedAt: now(),
          });
        }
      } catch (suggErr) {
        console.error("Profile suggestion failed:", suggErr);
        // Non-fatal: do not fail the whole analysis if suggestions fail
      }
    }

    return json({ transcript: transcriptText, analysis });
  } catch (err) {
    await db.update(sourceAssets).set({ status: "failed", updatedAt: now() }).where(eq(sourceAssets.id, id));
    const message = err instanceof Error ? err.message : String(err);
    return jsonError(`处理失败: ${message}`, 500);
  }
}

async function transcribeAsset(filePath: string, env: ReturnType<typeof getEnv>): Promise<string> {
  if (env.asrProvider === "openai" && env.openaiApiKey) {
    return transcribeWithOpenAI(filePath, env);
  }
  return transcribeWithFunASR(filePath, env);
}

async function transcribeWithFunASR(filePath: string, env: ReturnType<typeof getEnv>): Promise<string> {
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
    ]);

    return stdout.trim();
  } finally {
    await unlink(wavPath).catch(() => {});
  }
}

async function transcribeWithOpenAI(filePath: string, env: ReturnType<typeof getEnv>): Promise<string> {
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

    const data = await res.json() as { text: string };
    return data.text;
  } finally {
    await unlink(wavPath).catch(() => {});
  }
}
