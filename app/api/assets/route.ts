import { NextRequest } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { getEnv } from "@/lib/server/env";
import { ensureMigrations } from "@/lib/db/migrate";
import { getDb } from "@/lib/db";
import { sourceAssets } from "@/lib/db/schema";
import { uid, json, jsonError, now, parseJsonField } from "@/lib/api-utils";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  await ensureMigrations();
  const db = await getDb();
  const rows = await db.select().from(sourceAssets).orderBy(desc(sourceAssets.createdAt));
  return json(rows);
}

export async function POST(req: NextRequest) {
  ensureMigrations();
  const env = getEnv();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = (formData.get("type") as string) || "video";
  const title = (formData.get("title") as string) || file?.name || "未命名素材";
  const source = (formData.get("source") as string) || "";

  if (!file) return jsonError("缺少文件", 400);

  const buffer = Buffer.from(await file.arrayBuffer());
  const assetId = uid();
  const ext = file.name.split(".").pop() || "mp4";
  const fileName = `${assetId}.${ext}`;
  const storageDir = join(env.appStorageDir, "assets");
  await mkdir(storageDir, { recursive: true });
  const filePath = join(storageDir, fileName);
  await writeFile(filePath, buffer);

  const db = await getDb();
  const asset = {
    id: assetId,
    type,
    title,
    source,
    filePath,
    status: "uploaded",
    createdAt: now(),
    updatedAt: now(),
  };

  await db.insert(sourceAssets).values(asset);
  return json(asset, 201);
}
