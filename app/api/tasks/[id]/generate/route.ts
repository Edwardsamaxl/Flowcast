import { ensureMigrations } from "@/lib/db/migrate";
import { getDb } from "@/lib/db";
import { rewriteTasks, generatedDrafts, transcripts, analyses, creators, creatorProfiles } from "@/lib/db/schema";
import { uid, json, jsonError, now, parseJsonField } from "@/lib/api-utils";
import { eq } from "drizzle-orm";
import { generatePlatformDraft } from "@/lib/pipeline/llm";
import type { Platform, VoiceProfile } from "@/lib/pipeline/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();

  const [task] = await db.select().from(rewriteTasks).where(eq(rewriteTasks.id, id));
  if (!task) return jsonError("任务不存在", 404);

  const platforms = parseJsonField<string[]>(task.platforms, []);
  if (platforms.length === 0) return jsonError("请先选择目标平台", 400);

  const [transcript] = await db.select().from(transcripts).where(eq(transcripts.assetId, task.assetId));
  if (!transcript) return jsonError("素材尚未转写", 400);

  const [analysis] = await db.select().from(analyses).where(eq(analyses.assetId, task.assetId));
  if (!analysis) return jsonError("素材尚未分析", 400);

  let voiceProfile: VoiceProfile | undefined;
  if (task.creatorId) {
    const [c] = await db.select().from(creators).where(eq(creators.id, task.creatorId));
    const [p] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.creatorId, task.creatorId));
    if (c && p) {
      voiceProfile = {
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
    }
  }

  const parsedAnalysis = {
    topic: analysis.topic,
    summary: analysis.summary,
    core_points: parseJsonField(analysis.corePoints, []),
    cases: parseJsonField<string[]>(analysis.cases, []),
    quotes: parseJsonField<string[]>(analysis.quotes, []),
    content_angles: parseJsonField<string[]>(analysis.contentAngles, []),
    risk_notes: parseJsonField<string[]>(analysis.riskNotes, []),
  };

  await db.update(rewriteTasks).set({ status: "generating", updatedAt: now() }).where(eq(rewriteTasks.id, id));

  const drafts = [];
  try {
    for (const platform of platforms) {
      const draft = await generatePlatformDraft({
        transcript: transcript.fullText,
        analysis: parsedAnalysis,
        platform: platform as Platform,
        voiceProfile,
      });

      const draftId = uid();
      await db.insert(generatedDrafts).values({
        id: draftId,
        taskId: id,
        platform,
        title: draft.title,
        content: draft.content,
        notes: JSON.stringify(draft.notes),
        voiceAlignment: draft.voice_alignment ? JSON.stringify(draft.voice_alignment) : null,
        status: "generated",
        createdAt: now(),
        updatedAt: now(),
      });

      drafts.push({ id: draftId, ...draft });
    }

    await db.update(rewriteTasks).set({ status: "completed", updatedAt: now() }).where(eq(rewriteTasks.id, id));
    return json({ drafts });
  } catch (err) {
    await db.update(rewriteTasks).set({ status: "failed", updatedAt: now() }).where(eq(rewriteTasks.id, id));
    const message = err instanceof Error ? err.message : String(err);
    return jsonError(`生成失败: ${message}`, 500);
  }
}
