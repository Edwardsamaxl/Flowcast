import { ensureMigrations } from "@/lib/db/migrate";
import { getDb, saveToDisk } from "@/lib/db";
import { userPlatformRules } from "@/lib/db/schema";
import { json, jsonError, now } from "@/lib/api-utils";
import { eq, and } from "drizzle-orm";

const PLATFORM_NAMES: Record<string, string> = {
  xiaohongshu: "小红书",
  douyin: "抖音",
  bilibili: "B站",
  zhihu: "知乎",
  x: "X",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();

  const rows = await db
    .select()
    .from(userPlatformRules)
    .where(
      and(
        eq(userPlatformRules.userId, "default"),
        eq(userPlatformRules.platformKey, id)
      )
    )
    .limit(1);

  if (rows.length === 0) {
    return jsonError("Platform rule not found", 404);
  }

  const row = rows[0];
  return json({
    id: row.id,
    platformKey: row.platformKey,
    name: PLATFORM_NAMES[row.platformKey] ?? row.platformKey,
    ruleTemplate: row.ruleTemplate,
    promptOverride: row.promptOverride,
    isActive: Boolean(row.isActive),
    sortOrder: row.sortOrder,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();
  const body = (await req.json()) as {
    ruleTemplate?: string;
    promptOverride?: string;
    isActive?: boolean;
    sortOrder?: number;
  };

  const rows = await db
    .select()
    .from(userPlatformRules)
    .where(
      and(
        eq(userPlatformRules.userId, "default"),
        eq(userPlatformRules.platformKey, id)
      )
    )
    .limit(1);

  if (rows.length === 0) {
    return jsonError("Platform rule not found", 404);
  }

  const setClause: Record<string, unknown> = { updatedAt: now() };
  if (body.ruleTemplate !== undefined) setClause.ruleTemplate = body.ruleTemplate;
  if (body.promptOverride !== undefined) setClause.promptOverride = body.promptOverride;
  if (body.isActive !== undefined) setClause.isActive = body.isActive ? 1 : 0;
  if (body.sortOrder !== undefined) setClause.sortOrder = body.sortOrder;

  await db
    .update(userPlatformRules)
    .set(setClause)
    .where(eq(userPlatformRules.id, rows[0].id));

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

  await db
    .delete(userPlatformRules)
    .where(
      and(
        eq(userPlatformRules.userId, "default"),
        eq(userPlatformRules.platformKey, id)
      )
    );

  saveToDisk();
  return json({ success: true });
}
