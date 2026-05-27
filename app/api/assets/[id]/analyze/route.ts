import { ensureMigrations } from "@/lib/db/migrate";
import { getDb } from "@/lib/db";
import {
  sourceAssets,
  transcripts,
  analyses,
  creators,
  creatorProfiles,
  profileSuggestions,
} from "@/lib/db/schema";
import { uid, json, jsonError, now, parseJsonField } from "@/lib/api-utils";
import { eq } from "drizzle-orm";
import { analyzeTranscript, suggestCreatorProfileUpdates } from "@/lib/pipeline/llm";
import type { CreatorProfile, Platform } from "@/lib/pipeline/types";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();

  const [asset] = await db.select().from(sourceAssets).where(eq(sourceAssets.id, id));
  if (!asset) return jsonError("素材不存在", 404);

  if (asset.status !== "transcribed" && asset.status !== "failed") {
    return jsonError("素材当前状态不支持分析", 400);
  }

  const [transcript] = await db.select().from(transcripts).where(eq(transcripts.assetId, id));
  if (!transcript) return jsonError("素材尚未转写", 400);

  try {
    await db
      .update(sourceAssets)
      .set({ status: "analyzing", updatedAt: now() })
      .where(eq(sourceAssets.id, id));

    const analysis = await analyzeTranscript(transcript.fullText);

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

    // Generate creator profile suggestions if asset is linked to a creator
    if (asset.creatorId) {
      try {
        const [c] = await db.select().from(creators).where(eq(creators.id, asset.creatorId));
        const [p] = await db
          .select()
          .from(creatorProfiles)
          .where(eq(creatorProfiles.creatorId, asset.creatorId));
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
            platform_rules: parseJsonField<Record<string, string>>(
              p.platformRules,
              {}
            ) as Record<Platform, string>,
          };
          const suggestions = await suggestCreatorProfileUpdates({
            transcript: transcript.fullText,
            currentProfile,
          });

          const [existingSugg] = await db
            .select()
            .from(profileSuggestions)
            .where(eq(profileSuggestions.assetId, id));

          if (existingSugg) {
            await db
              .update(profileSuggestions)
              .set({
                suggestions: JSON.stringify(suggestions),
                status: "pending",
                updatedAt: now(),
              })
              .where(eq(profileSuggestions.id, existingSugg.id));
          } else {
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
        }
      } catch (suggErr) {
        console.error("Profile suggestion failed:", suggErr);
      }
    }

    return json({ status: "analyzed", analysis });
  } catch (err) {
    await db
      .update(sourceAssets)
      .set({ status: "failed", updatedAt: now() })
      .where(eq(sourceAssets.id, id));
    const message = err instanceof Error ? err.message : String(err);
    return jsonError(`分析失败: ${message}`, 500);
  }
}
