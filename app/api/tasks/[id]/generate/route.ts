import { ensureMigrations } from "@/lib/db/migrate";
import { getDb, saveToDisk } from "@/lib/db";
import { rewriteTasks, generatedDrafts, transcripts, analyses, creators, creatorProfiles, creatorInsights, feedbackMessages, userPlatformRules } from "@/lib/db/schema";
import { uid, json, jsonError, now, parseJsonField } from "@/lib/api-utils";
import { eq } from "drizzle-orm";
import { generatePlatformDraft } from "@/lib/pipeline/llm";
import type { Platform, CreatorProfile } from "@/lib/pipeline/types";

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

  let creatorProfile: CreatorProfile | undefined;
  let userId = "default";
  if (task.creatorId) {
    const [c] = await db.select().from(creators).where(eq(creators.id, task.creatorId));
    const [p] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.creatorId, task.creatorId));
    if (c && p) {
      userId = c.userId || "default";
      const insightRows = await db
        .select()
        .from(creatorInsights)
        .where(eq(creatorInsights.creatorId, task.creatorId))
        .orderBy(creatorInsights.createdAt);

      creatorProfile = {
        id: p.id,
        creatorId: task.creatorId,
        positioning: p.positioning,
        tone: parseJsonField<string[]>(p.tone, []),
        beliefs: parseJsonField<string[]>(p.beliefs, []),
        structures: parseJsonField<string[]>(p.structures, []),
        avoid_phrases: parseJsonField<string[]>(p.avoidPhrases, []),
        title_preference: p.titlePreference,
        catchphrases: parseJsonField<string[]>(p.catchphrases, []),
        insights: insightRows.map((row) => ({
          id: row.id,
          content: row.content,
          tags: parseJsonField<string[]>(row.tags, []),
          sourceAssetId: row.sourceAssetId ?? undefined,
          createdAt: row.createdAt,
        })),
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

  // Load previous feedback for this task to pass into the prompt
  const feedbackRows = await db
    .select()
    .from(feedbackMessages)
    .where(eq(feedbackMessages.taskId, id));
  const draftFeedback = feedbackRows
    .filter((f) => f.scope === "current_draft")
    .map((f) => {
      const tags = parseJsonField<string[]>(f.tags, []);
      return tags.length > 0 ? `[${tags.join(", ")}] ${f.message}` : f.message;
    })
    .filter((m) => m.trim().length > 0);

  // Load platform rules from userPlatformRules
  const platformRuleRows = await db
    .select()
    .from(userPlatformRules)
    .where(eq(userPlatformRules.userId, userId));

  const platformRuleMap = new Map<
    string,
    { ruleTemplate: string; promptOverride: string }
  >();
  for (const row of platformRuleRows) {
    platformRuleMap.set(row.platformKey, {
      ruleTemplate: row.ruleTemplate,
      promptOverride: row.promptOverride,
    });
  }

  await db.update(rewriteTasks).set({ status: "generating", updatedAt: now() }).where(eq(rewriteTasks.id, id));

  const drafts = [];
  try {
    for (const platform of platforms) {
      const rule = platformRuleMap.get(platform);
      const draft = await generatePlatformDraft({
        transcript: transcript.fullText,
        analysis: parsedAnalysis,
        platform: platform as Platform,
        voiceProfile: creatorProfile,
        platformRule: rule
          ? { ruleTemplate: rule.ruleTemplate, promptOverride: rule.promptOverride }
          : undefined,
        feedback: draftFeedback.length > 0 ? draftFeedback : undefined,
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
    saveToDisk();
    return json({ drafts });
  } catch (err) {
    await db.update(rewriteTasks).set({ status: "failed", updatedAt: now() }).where(eq(rewriteTasks.id, id));
    saveToDisk();
    const message = err instanceof Error ? err.message : String(err);
    return jsonError(`生成失败: ${message}`, 500);
  }
}
