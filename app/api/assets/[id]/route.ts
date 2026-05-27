import { ensureMigrations } from "@/lib/db/migrate";
import { getDb } from "@/lib/db";
import { sourceAssets, transcripts, analyses, profileSuggestions } from "@/lib/db/schema";
import { json, jsonError, parseJsonField } from "@/lib/api-utils";
import { eq } from "drizzle-orm";

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

