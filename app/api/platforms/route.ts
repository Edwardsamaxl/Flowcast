import { ensureMigrations } from "@/lib/db/migrate";
import { getDb, saveToDisk } from "@/lib/db";
import { userPlatformRules } from "@/lib/db/schema";
import { uid, json, jsonError, now } from "@/lib/api-utils";
import { eq, and, asc } from "drizzle-orm";

const PLATFORM_NAMES: Record<string, string> = {
  xiaohongshu: "小红书",
  douyin: "抖音",
  bilibili: "B站",
  zhihu: "知乎",
  x: "X",
};

export async function GET() {
  await ensureMigrations();
  const db = await getDb();

  const rows = await db
    .select()
    .from(userPlatformRules)
    .where(eq(userPlatformRules.userId, "default"))
    .orderBy(asc(userPlatformRules.sortOrder));

  return json(
    rows.map((row) => ({
      id: row.id,
      platformKey: row.platformKey,
      name: PLATFORM_NAMES[row.platformKey] ?? row.platformKey,
      ruleTemplate: row.ruleTemplate,
      promptOverride: row.promptOverride,
      isActive: Boolean(row.isActive),
      sortOrder: row.sortOrder,
    }))
  );
}

export async function POST(req: Request) {
  await ensureMigrations();
  const db = await getDb();
  const body = (await req.json()) as {
    platformKey: string;
    ruleTemplate?: string;
    promptOverride?: string;
    isActive?: boolean;
    sortOrder?: number;
  };

  if (!body.platformKey) {
    return jsonError("platformKey is required", 400);
  }

  const existing = await db
    .select()
    .from(userPlatformRules)
    .where(
      and(
        eq(userPlatformRules.userId, "default"),
        eq(userPlatformRules.platformKey, body.platformKey)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(userPlatformRules)
      .set({
        ruleTemplate: body.ruleTemplate ?? existing[0].ruleTemplate,
        promptOverride: body.promptOverride ?? existing[0].promptOverride,
        isActive: body.isActive !== undefined ? (body.isActive ? 1 : 0) : existing[0].isActive,
        sortOrder: body.sortOrder ?? existing[0].sortOrder,
        updatedAt: now(),
      })
      .where(eq(userPlatformRules.id, existing[0].id));
  } else {
    await db.insert(userPlatformRules).values({
      id: uid(),
      userId: "default",
      platformKey: body.platformKey,
      ruleTemplate: body.ruleTemplate || "",
      promptOverride: body.promptOverride || "",
      isActive: body.isActive !== undefined ? (body.isActive ? 1 : 0) : 1,
      sortOrder: body.sortOrder ?? 0,
      createdAt: now(),
      updatedAt: now(),
    });
  }

  saveToDisk();
  return json({ success: true });
}
