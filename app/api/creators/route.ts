import { ensureMigrations } from "@/lib/db/migrate";
import { getDb } from "@/lib/db";
import { creators, creatorProfiles } from "@/lib/db/schema";
import { uid, json, jsonError, now, parseJsonField } from "@/lib/api-utils";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  await ensureMigrations();
  const db = await getDb();
  const rows = await db.select().from(creators).orderBy(desc(creators.updatedAt));

  const result = await Promise.all(
    rows.map(async (c) => {
      const [profile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.creatorId, c.id));
      return {
        ...c,
        profile: profile ? {
          ...profile,
          tone: parseJsonField<string[]>(profile.tone, []),
          beliefs: parseJsonField<string[]>(profile.beliefs, []),
          cases: parseJsonField<string[]>(profile.cases, []),
          commonPatterns: parseJsonField<string[]>(profile.commonPatterns, []),
          avoidPhrases: parseJsonField<string[]>(profile.avoidPhrases, []),
          platformRules: parseJsonField<Record<string, string>>(profile.platformRules, {}),
        } : null,
      };
    })
  );

  return json(result);
}

export async function POST(req: Request) {
  await ensureMigrations();
  const db = await getDb();
  const body = await req.json() as {
    name: string;
    positioning: string;
    domain: string;
    tone: string[];
    beliefs: string[];
    cases: string[];
    commonPatterns: string[];
    avoidPhrases: string[];
    titlePreference: string;
    platformRules: Record<string, string>;
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
    domain: body.domain || "",
    tone: JSON.stringify(body.tone || []),
    beliefs: JSON.stringify(body.beliefs || []),
    cases: JSON.stringify(body.cases || []),
    commonPatterns: JSON.stringify(body.commonPatterns || []),
    avoidPhrases: JSON.stringify(body.avoidPhrases || []),
    titlePreference: body.titlePreference || "",
    platformRules: JSON.stringify(body.platformRules || {}),
    createdAt: now(),
    updatedAt: now(),
  });

  return json({ creatorId, profileId }, 201);
}
