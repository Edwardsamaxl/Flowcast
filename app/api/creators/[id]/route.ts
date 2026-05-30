import { ensureMigrations } from "@/lib/db/migrate";
import { getDb, saveToDisk } from "@/lib/db";
import { creators, creatorProfiles, creatorInsights } from "@/lib/db/schema";
import { uid, json, jsonError, now, parseJsonField } from "@/lib/api-utils";
import { eq } from "drizzle-orm";
import { createVersionManager } from "@/lib/repositories/version-manager";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();

  const [creator] = await db.select().from(creators).where(eq(creators.id, id));
  if (!creator) return jsonError("创作者不存在", 404);

  const [profile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.creatorId, id));
  const insights = profile
    ? await db
        .select()
        .from(creatorInsights)
        .where(eq(creatorInsights.creatorId, id))
        .orderBy(creatorInsights.createdAt)
    : [];

  return json({
    ...creator,
    profile: profile
      ? {
          ...profile,
          tone: parseJsonField<string[]>(profile.tone, []),
          beliefs: parseJsonField<string[]>(profile.beliefs, []),
          structures: parseJsonField<string[]>(profile.structures, []),
          avoidPhrases: parseJsonField<string[]>(profile.avoidPhrases, []),
          catchphrases: parseJsonField<string[]>(profile.catchphrases, []),
          insights: insights.map((row) => ({
            id: row.id,
            content: row.content,
            tags: parseJsonField<string[]>(row.tags, []),
            sourceAssetId: row.sourceAssetId ?? undefined,
            createdAt: row.createdAt,
          })),
        }
      : null,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();
  const body = (await req.json()) as Record<string, unknown>;

  const [creator] = await db.select().from(creators).where(eq(creators.id, id));
  if (!creator) return jsonError("创作者不存在", 404);

  if (body.name && typeof body.name === "string") {
    await db.update(creators).set({ name: body.name, updatedAt: now() }).where(eq(creators.id, id));
  }

  const [existingProfile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.creatorId, id));

  const profileValues: Record<string, unknown> = {
    updatedAt: now(),
  };

  if (body.positioning !== undefined) profileValues.positioning = String(body.positioning);
  if (body.tone !== undefined) profileValues.tone = JSON.stringify(Array.isArray(body.tone) ? body.tone : []);
  if (body.beliefs !== undefined) profileValues.beliefs = JSON.stringify(Array.isArray(body.beliefs) ? body.beliefs : []);
  if (body.structures !== undefined) profileValues.structures = JSON.stringify(Array.isArray(body.structures) ? body.structures : []);
  if (body.avoidPhrases !== undefined) profileValues.avoidPhrases = JSON.stringify(Array.isArray(body.avoidPhrases) ? body.avoidPhrases : []);
  if (body.titlePreference !== undefined) profileValues.titlePreference = String(body.titlePreference);
  if (body.catchphrases !== undefined) profileValues.catchphrases = JSON.stringify(Array.isArray(body.catchphrases) ? body.catchphrases : []);

  if (existingProfile) {
    await db.update(creatorProfiles).set(profileValues).where(eq(creatorProfiles.creatorId, id));
  } else {
    const insertValues: typeof creatorProfiles.$inferInsert = {
      id: uid(),
      creatorId: id,
      positioning: profileValues.positioning as string ?? "",
      tone: (profileValues.tone as string) ?? "[]",
      beliefs: (profileValues.beliefs as string) ?? "[]",
      structures: (profileValues.structures as string) ?? "[]",
      avoidPhrases: (profileValues.avoidPhrases as string) ?? "[]",
      titlePreference: (profileValues.titlePreference as string) ?? "",
      catchphrases: (profileValues.catchphrases as string) ?? "[]",
      createdAt: now(),
      updatedAt: now(),
    };
    await db.insert(creatorProfiles).values(insertValues);
  }

  // Snapshot the new state whenever any profile dimension was supplied
  // (updatedAt is always present, so >1 means actual profile fields changed).
  const profileFieldsChanged = Object.keys(profileValues).length > 1;
  if (profileFieldsChanged) {
    const [updated] = await db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.creatorId, id));
    if (updated) {
      const insightRows = await db
        .select()
        .from(creatorInsights)
        .where(eq(creatorInsights.creatorId, id))
        .orderBy(creatorInsights.createdAt);

      const snapshot = {
        profile: {
          positioning: updated.positioning,
          tone: parseJsonField<string[]>(updated.tone, []),
          beliefs: parseJsonField<string[]>(updated.beliefs, []),
          structures: parseJsonField<string[]>(updated.structures, []),
          avoidPhrases: parseJsonField<string[]>(updated.avoidPhrases, []),
          titlePreference: updated.titlePreference,
          catchphrases: parseJsonField<string[]>(updated.catchphrases, []),
        },
        insights: insightRows.map((row) => ({
          id: row.id,
          content: row.content,
          tags: parseJsonField<string[]>(row.tags, []),
          sourceAssetId: row.sourceAssetId ?? undefined,
          createdAt: row.createdAt,
        })),
      };

      await createVersionManager().createVersion(id, snapshot, {
        changeSummary: "画像更新",
        triggerType: "manual_edit",
      });
    }
  }

  saveToDisk();
  return json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();

  await db.delete(creators).where(eq(creators.id, id));
  saveToDisk();
  return json({ success: true });
}
