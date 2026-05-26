import { ensureMigrations } from "@/lib/db/migrate";
import { getDb } from "@/lib/db";
import { creators, creatorProfiles } from "@/lib/db/schema";
import { uid, json, jsonError, now, parseJsonField } from "@/lib/api-utils";
import { eq } from "drizzle-orm";

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

  return json({
    ...creator,
    profile: profile ? {
      ...profile,
      tone: parseJsonField<string[]>(profile.tone, []),
      beliefs: parseJsonField<string[]>(profile.beliefs, []),
      cases: parseJsonField<string[]>(profile.cases, []),
      commonPatterns: parseJsonField<string[]>(profile.commonPatterns, []),
      avoidPhrases: parseJsonField<string[]>(profile.avoidPhrases, []),
      platformRules: parseJsonField<Record<string, string>>(profile.platformRules, {}),
    } : null,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();
  const body = await req.json();

  const [creator] = await db.select().from(creators).where(eq(creators.id, id));
  if (!creator) return jsonError("创作者不存在", 404);

  if (body.name) {
    await db.update(creators).set({ name: body.name, updatedAt: now() }).where(eq(creators.id, id));
  }

  const [existingProfile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.creatorId, id));

  const profileValues = {
    positioning: body.positioning ?? existingProfile?.positioning ?? "",
    domain: body.domain ?? existingProfile?.domain ?? "",
    tone: JSON.stringify(body.tone ?? parseJsonField<string[]>(existingProfile?.tone ?? null, [])),
    beliefs: JSON.stringify(body.beliefs ?? parseJsonField<string[]>(existingProfile?.beliefs ?? null, [])),
    cases: JSON.stringify(body.cases ?? parseJsonField<string[]>(existingProfile?.cases ?? null, [])),
    commonPatterns: JSON.stringify(body.commonPatterns ?? parseJsonField<string[]>(existingProfile?.commonPatterns ?? null, [])),
    avoidPhrases: JSON.stringify(body.avoidPhrases ?? parseJsonField<string[]>(existingProfile?.avoidPhrases ?? null, [])),
    titlePreference: body.titlePreference ?? existingProfile?.titlePreference ?? "",
    platformRules: JSON.stringify(body.platformRules ?? parseJsonField<Record<string, string>>(existingProfile?.platformRules ?? null, {})),
    updatedAt: now(),
  };

  if (existingProfile) {
    await db.update(creatorProfiles).set(profileValues).where(eq(creatorProfiles.creatorId, id));
  } else {
    await db.insert(creatorProfiles).values({
      id: uid(),
      creatorId: id,
      ...profileValues,
      createdAt: now(),
    });
  }

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
  return json({ success: true });
}
