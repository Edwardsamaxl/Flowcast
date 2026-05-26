import { ensureMigrations } from "@/lib/db/migrate";
import { getDb } from "@/lib/db";
import { rewriteTasks, generatedDrafts, feedbackMessages, sourceAssets, transcripts, analyses, creators, creatorProfiles } from "@/lib/db/schema";
import { json, jsonError, parseJsonField } from "@/lib/api-utils";
import { eq } from "drizzle-orm";

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

  // Load creator profile
  let creatorProfile = null;
  if (task.creatorId) {
    const [c] = await db.select().from(creators).where(eq(creators.id, task.creatorId));
    const [p] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.creatorId, task.creatorId));
    if (c && p) {
      creatorProfile = {
        id: c.id,
        name: c.name,
        positioning: p.positioning,
        domain: p.domain,
        tone: parseJsonField<string[]>(p.tone, []),
        beliefs: parseJsonField<string[]>(p.beliefs, []),
        cases: parseJsonField<string[]>(p.cases, []),
        commonPatterns: parseJsonField<string[]>(p.commonPatterns, []),
        avoidPhrases: parseJsonField<string[]>(p.avoidPhrases, []),
        titlePreference: p.titlePreference,
        platformRules: parseJsonField<Record<string, string>>(p.platformRules, {}),
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
