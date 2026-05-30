import { ensureMigrations } from "@/lib/db/migrate";
import { getDb, saveToDisk } from "@/lib/db";
import {
  sourceAssets,
  transcripts,
  creators,
  creatorProfiles,
  creatorInsights,
  profileVersions,
} from "@/lib/db/schema";
import { json, jsonError, parseJsonField } from "@/lib/api-utils";
import { eq, and } from "drizzle-orm";
import { suggestCreatorProfileUpdates } from "@/lib/pipeline/llm";
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

  if (!asset.creatorId) {
    return jsonError("素材未绑定创作者", 400);
  }

  const [transcript] = await db.select().from(transcripts).where(eq(transcripts.assetId, id));
  if (!transcript) return jsonError("素材尚未转写", 400);

  const [c] = await db.select().from(creators).where(eq(creators.id, asset.creatorId));
  if (!c) return jsonError("创作者不存在", 404);

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

  const result = await suggestCreatorProfileUpdates({
    transcript: transcript.fullText,
    currentProfile,
  });

  const suggestionsPayload = {
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
  };

  // Replace any existing draft for this creator so the latest is unambiguous.
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
      changeSummary: "重新生成画像建议",
      sourceAssetId: id,
      triggerType: SUGGESTION_DRAFT,
    }
  );

  saveToDisk();
  return json({ suggestions: suggestionsPayload });
}
