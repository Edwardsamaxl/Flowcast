import { ensureMigrations } from "@/lib/db/migrate";
import { getDb, saveToDisk } from "@/lib/db";
import { sourceAssets, transcripts, analyses, profileVersions } from "@/lib/db/schema";
import { json, jsonError, parseJsonField } from "@/lib/api-utils";
import { eq, and, desc } from "drizzle-orm";
import { unlink } from "node:fs/promises";
import { SUGGESTION_DRAFT } from "@/lib/repositories/version-manager";

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

  // Load latest pending suggestion draft for this asset's creator
  let profileSuggestion = null;
  if (asset.creatorId) {
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();

  const [asset] = await db.select().from(sourceAssets).where(eq(sourceAssets.id, id));
  if (!asset) return jsonError("素材不存在", 404);

  await db.delete(sourceAssets).where(eq(sourceAssets.id, id));

  if (asset.filePath) {
    try {
      await unlink(asset.filePath);
    } catch {
      // ignore file not found
    }
  }

  saveToDisk();
  return json({ success: true });
}
