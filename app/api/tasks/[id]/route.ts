import { ensureMigrations } from "@/lib/db/migrate";
import { getDb } from "@/lib/db";
import { rewriteTasks, generatedDrafts, feedbackMessages, sourceAssets, transcripts, analyses, creators, creatorProfiles, creatorInsights, profileVersions } from "@/lib/db/schema";
import { json, jsonError, parseJsonField } from "@/lib/api-utils";
import { eq, and, desc } from "drizzle-orm";
import { SUGGESTION_DRAFT } from "@/lib/repositories/version-manager";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();

  const [task] = await db.select().from(rewriteTasks).where(eq(rewriteTasks.id, id));
  if (!task) return jsonError("任务不存在", 404);

  // Load asset with transcript & analysis
  const [asset] = await db.select().from(sourceAssets).where(eq(sourceAssets.id, task.assetId));
  const [transcript] = asset ? await db.select().from(transcripts).where(eq(transcripts.assetId, asset.id)) : [null, null];
  const [analysis] = asset ? await db.select().from(analyses).where(eq(analyses.assetId, asset.id)) : [null, null];

  // Load latest pending suggestion draft for this asset's creator
  let profileSuggestion = null;
  if (asset && asset.creatorId) {
    const drafts = await db
      .select()
      .from(profileVersions)
      .where(
        and(
          eq(profileVersions.creatorId, asset.creatorId),
          eq(profileVersions.triggerType, SUGGESTION_DRAFT)
        )
      )
      .orderBy(desc(profileVersions.createdAt))
      .limit(1);
    const latest = drafts[0];
    if (latest) {
      const snapshot = parseJsonField(latest.snapshot, {} as Record<string, unknown>);
      if (snapshot && typeof snapshot === "object" && "suggestions" in snapshot) {
        profileSuggestion = {
          id: latest.id,
          suggestions: snapshot.suggestions,
          status: "pending",
        };
      }
    }
  }

  // Load creator profile with insights
  let creatorProfile = null;
  if (task.creatorId) {
    const [c] = await db.select().from(creators).where(eq(creators.id, task.creatorId));
    const [p] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.creatorId, task.creatorId));
    if (c && p) {
      const insightRows = await db
        .select()
        .from(creatorInsights)
        .where(eq(creatorInsights.creatorId, task.creatorId))
        .orderBy(creatorInsights.createdAt);

      creatorProfile = {
        id: c.id,
        name: c.name,
        positioning: p.positioning,
        tone: parseJsonField<string[]>(p.tone, []),
        beliefs: parseJsonField<string[]>(p.beliefs, []),
        structures: parseJsonField<string[]>(p.structures, []),
        avoidPhrases: parseJsonField<string[]>(p.avoidPhrases, []),
        titlePreference: p.titlePreference,
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

  // Load drafts
  const drafts = await db
    .select()
    .from(generatedDrafts)
    .where(eq(generatedDrafts.taskId, id));

  // Load feedback
  const feedback = await db
    .select()
    .from(feedbackMessages)
    .where(eq(feedbackMessages.taskId, id));

  return json({
    ...task,
    platforms: parseJsonField<string[]>(task.platforms, []),
    asset: asset
      ? {
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
        }
      : null,
    creatorProfile,
    drafts: drafts.map((d) => ({
      ...d,
      notes: parseJsonField<string[]>(d.notes, []),
      voiceAlignment: parseJsonField(d.voiceAlignment, null),
    })),
    feedback: feedback.map((f) => ({
      ...f,
      tags: parseJsonField<string[]>(f.tags, []),
    })),
  });
}
