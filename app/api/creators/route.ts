import { ensureMigrations } from "@/lib/db/migrate";
import { getDb, saveToDisk } from "@/lib/db";
import { creators, creatorProfiles, creatorInsights } from "@/lib/db/schema";
import { uid, json, jsonError, now, parseJsonField } from "@/lib/api-utils";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  await ensureMigrations();
  const db = await getDb();
  const rows = await db.select().from(creators).orderBy(desc(creators.updatedAt));

  const result = await Promise.all(
    rows.map(async (c) => {
      const [profile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.creatorId, c.id));
      const insights = profile
        ? await db
            .select()
            .from(creatorInsights)
            .where(eq(creatorInsights.creatorId, c.id))
            .orderBy(creatorInsights.createdAt)
        : [];
      return {
        ...c,
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
      };
    })
  );

  return json(result);
}

export async function POST(req: Request) {
  await ensureMigrations();
  const db = await getDb();
  const body = (await req.json()) as {
    name: string;
    positioning?: string;
    tone?: string[];
    beliefs?: string[];
    structures?: string[];
    avoidPhrases?: string[];
    titlePreference?: string;
    catchphrases?: string[];
  };

  const creatorId = uid();
  const profileId = uid();

  await db.insert(creators).values({
    id: creatorId,
    name: body.name || "未命名创作者",
    createdAt: now(),
    updatedAt: now(),
  });

  await db.insert(creatorProfiles).values({
    id: profileId,
    creatorId,
    positioning: body.positioning || "",
    tone: JSON.stringify(body.tone || []),
    beliefs: JSON.stringify(body.beliefs || []),
    structures: JSON.stringify(body.structures || []),
    avoidPhrases: JSON.stringify(body.avoidPhrases || []),
    titlePreference: body.titlePreference || "",
    catchphrases: JSON.stringify(body.catchphrases || []),
    createdAt: now(),
    updatedAt: now(),
  });

  saveToDisk();
  return json({ creatorId, profileId }, 201);
}
