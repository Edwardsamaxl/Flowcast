import { ensureMigrations } from "@/lib/db/migrate";
import { getDb, saveToDisk } from "@/lib/db";
import {
  sourceAssets,
  transcripts,
  analyses,
  creators,
  creatorProfiles,
  creatorInsights,
  profileVersions,
} from "@/lib/db/schema";
import { uid, json, jsonError, now, parseJsonField } from "@/lib/api-utils";
import { eq, and } from "drizzle-orm";
import { analyzeTranscript, suggestCreatorProfileUpdates } from "@/lib/pipeline/llm";
import type { CreatorProfile } from "@/lib/pipeline/types";
import { createVersionManager, SUGGESTION_DRAFT } from "@/lib/repositories/version-manager";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();

  const [asset] = await db.select().from(sourceAssets).where(eq(sourceAssets.id, id));
  if (!asset) return jsonError("素材不存在", 404);

  if (asset.status !== "transcribed" && asset.status !== "failed" && asset.status !== "analyzing") {
    return jsonError(`素材当前状态不支持分析（当前状态: ${asset.status}，需要先完成转写）`, 400);
  }

  const [transcript] = await db.select().from(transcripts).where(eq(transcripts.assetId, id));
  if (!transcript) return jsonError("素材尚未转写", 400);

  try {
    await db
      .update(sourceAssets)
      .set({ status: "analyzing", updatedAt: now() })
      .where(eq(sourceAssets.id, id));

    // Parallelize content analysis and profile suggestion loading
    const analysisPromise = analyzeTranscript(transcript.fullText);

    let profilePromise: Promise<
      | { additions: Array<{ field: string; value: string }>; modifications: Array<{ field: string; from: string; to: string }>; evidence_segments: string[] }
      | null
    > = Promise.resolve(null);

    if (asset.creatorId) {
      const [c] = await db.select().from(creators).where(eq(creators.id, asset.creatorId));
      if (c) {
        const [p] = await db
          .select()
          .from(creatorProfiles)
          .where(eq(creatorProfiles.creatorId, asset.creatorId));

        const insightRows = await db
          .select()
          .from(creatorInsights)
          .where(eq(creatorInsights.creatorId, asset.creatorId))
          .orderBy(creatorInsights.createdAt);

        const currentProfile: CreatorProfile | undefined = p
          ? {
              id: p.id,
              creatorId: asset.creatorId,
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
            }
          : undefined;

        profilePromise = suggestCreatorProfileUpdates({
          transcript: transcript.fullText,
          currentProfile,
        }).then((result) => ({
          additions: result.additions.map((a) => ({
            field: a.field,
            value: a.value || "",
          })),
          modifications: result.modifications.map((m) => ({
            field: m.field,
            from: m.from || "",
            to: m.to || "",
          })),
          evidence_segments: result.evidenceSegments,
        }));
      }
    }

    const [analysis, suggestions] = await Promise.all([analysisPromise, profilePromise]);

    const [existing] = await db.select().from(analyses).where(eq(analyses.assetId, id));
    if (existing) {
      await db
        .update(analyses)
        .set({
          topic: analysis.topic,
          summary: analysis.summary,
          corePoints: JSON.stringify(analysis.core_points),
          cases: JSON.stringify(analysis.cases),
          quotes: JSON.stringify(analysis.quotes),
          contentAngles: JSON.stringify(analysis.content_angles),
          riskNotes: JSON.stringify(analysis.risk_notes),
        })
        .where(eq(analyses.id, existing.id));
    } else {
      await db.insert(analyses).values({
        id: uid(),
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
    }

    await db
      .update(sourceAssets)
      .set({ status: "analyzed", updatedAt: now() })
      .where(eq(sourceAssets.id, id));

    // Store profile suggestions as transient drafts in profile_versions
    // (trigger_type='suggestion_draft', excluded from snapshot cap & restore).
    let suggestionsPayload: {
      additions: Array<{ field: string; value: string }>;
      modifications: Array<{ field: string; from: string; to: string }>;
      evidence_segments: string[];
    } | null = null;

    if (suggestions && asset.creatorId) {
      suggestionsPayload = suggestions;

      // Replace any existing draft for this creator so the "latest" lookup is unambiguous.
      await db
        .delete(profileVersions)
        .where(
          and(
            eq(profileVersions.creatorId, asset.creatorId),
            eq(profileVersions.triggerType, SUGGESTION_DRAFT)
          )
        );

      const versionManager = createVersionManager();
      await versionManager.createVersion(
        asset.creatorId,
        { suggestions: suggestionsPayload, sourceAssetId: id },
        {
          changeSummary: "分析素材生成的画像建议",
          sourceAssetId: id,
          triggerType: SUGGESTION_DRAFT,
        }
      );
    }

    saveToDisk();
    return json({ status: "analyzed", analysis, suggestions: suggestionsPayload });
  } catch (err) {
    await db
      .update(sourceAssets)
      .set({ status: "failed", updatedAt: now() })
      .where(eq(sourceAssets.id, id));
    saveToDisk();
    const message = err instanceof Error ? err.message : String(err);
    return jsonError(`分析失败: ${message}`, 500);
  }
}
