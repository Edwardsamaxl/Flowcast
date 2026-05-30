import { ensureMigrations } from "@/lib/db/migrate";
import { getDb } from "@/lib/db";
import { profileVersions, creatorProfiles, creatorInsights } from "@/lib/db/schema";
import { json, jsonError, parseJsonField } from "@/lib/api-utils";
import { eq, and, asc, ne } from "drizzle-orm";
import { createVersionManager, SUGGESTION_DRAFT } from "@/lib/repositories/version-manager";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();

  const rows = await db
    .select()
    .from(profileVersions)
    .where(
      and(
        eq(profileVersions.creatorId, id),
        ne(profileVersions.triggerType, SUGGESTION_DRAFT)
      )
    )
    .orderBy(asc(profileVersions.createdAt));

  return json(
    rows.map((row) => ({
      id: row.id,
      changeSummary: row.changeSummary,
      triggerType: row.triggerType,
      createdAt: row.createdAt,
    }))
  );
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();

  // Load current profile state
  const [profile] = await db
    .select()
    .from(creatorProfiles)
    .where(eq(creatorProfiles.creatorId, id));

  if (!profile) {
    return jsonError("Creator profile not found", 404);
  }

  const insights = await db
    .select()
    .from(creatorInsights)
    .where(eq(creatorInsights.creatorId, id))
    .orderBy(creatorInsights.createdAt);

  const snapshot = {
    profile: {
      positioning: profile.positioning,
      tone: parseJsonField<string[]>(profile.tone, []),
      beliefs: parseJsonField<string[]>(profile.beliefs, []),
      structures: parseJsonField<string[]>(profile.structures, []),
      avoidPhrases: parseJsonField<string[]>(profile.avoidPhrases, []),
      titlePreference: profile.titlePreference,
      catchphrases: parseJsonField<string[]>(profile.catchphrases, []),
    },
    insights: insights.map((i) => ({
      id: i.id,
      content: i.content,
      tags: parseJsonField<string[]>(i.tags, []),
      sourceAssetId: i.sourceAssetId ?? undefined,
      createdAt: i.createdAt,
    })),
  };

  const version = await createVersionManager().createVersion(id, snapshot, {
    changeSummary: "手动创建快照",
    triggerType: "manual_edit",
  });

  return json({ id: version.id, success: true });
}
