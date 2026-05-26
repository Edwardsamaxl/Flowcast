import { NextRequest } from "next/server";
import { ensureMigrations } from "@/lib/db/migrate";
import { getDb } from "@/lib/db";
import { rewriteTasks, creators } from "@/lib/db/schema";
import { uid, json, jsonError, now, parseJsonField } from "@/lib/api-utils";
import { eq, desc, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  await ensureMigrations();
  const db = await getDb();

  const url = new URL(req.url);
  const creatorId = url.searchParams.get("creator_id");
  const status = url.searchParams.get("status");

  const rows = await db.select().from(rewriteTasks).orderBy(desc(rewriteTasks.updatedAt));

  // Filter in memory for dynamic conditions (avoids drizzle conditional where type issues)
  const filteredRows = rows.filter((r) => {
    if (creatorId && r.creatorId !== creatorId) return false;
    if (status && r.status !== status) return false;
    return true;
  });

  const creatorIds = Array.from(new Set(filteredRows.map((r) => r.creatorId).filter(Boolean))) as string[];
  const creatorMap = new Map<string, string>();
  if (creatorIds.length > 0) {
    const creatorRows = await db
      .select({ id: creators.id, name: creators.name })
      .from(creators)
      .where(inArray(creators.id, creatorIds));
    for (const c of creatorRows) {
      creatorMap.set(c.id, c.name);
    }
  }

  const result = filteredRows.map((row) => ({
    ...row,
    platforms: parseJsonField<string[]>(row.platforms, []),
    creatorName: row.creatorId ? creatorMap.get(row.creatorId) || null : null,
  }));

  return json(result);
}

export async function POST(req: Request) {
  await ensureMigrations();
  const db = await getDb();
  const body = await req.json() as {
    assetId: string;
    creatorId?: string;
    title?: string;
    platforms?: string[];
  };

  if (!body.assetId) return jsonError("缺少 assetId", 400);

  const taskId = uid();
  await db.insert(rewriteTasks).values({
    id: taskId,
    assetId: body.assetId,
    creatorId: body.creatorId || null,
    title: body.title || "未命名任务",
    platforms: JSON.stringify(body.platforms || []),
    status: "draft",
    createdAt: now(),
    updatedAt: now(),
  });

  return json({ taskId }, 201);
}
