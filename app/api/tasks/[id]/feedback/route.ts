import { ensureMigrations } from "@/lib/db/migrate";
import { getDb, saveToDisk } from "@/lib/db";
import { rewriteTasks, feedbackMessages, generatedDrafts } from "@/lib/db/schema";
import { uid, json, jsonError, now, parseJsonField } from "@/lib/api-utils";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();

  const [task] = await db.select().from(rewriteTasks).where(eq(rewriteTasks.id, id));
  if (!task) return jsonError("任务不存在", 404);

  const body = await req.json() as {
    tags?: string[];
    message?: string;
    scope?: "current_draft" | "creator_profile" | "voice_profile";
    draftId?: string;
  };

  const feedbackId = uid();
  await db.insert(feedbackMessages).values({
    id: feedbackId,
    taskId: id,
    draftId: body.draftId || null,
    scope: body.scope || "current_draft",
    tags: JSON.stringify(body.tags || []),
    message: body.message || "",
    createdAt: now(),
  });

  saveToDisk();
  return json({ feedbackId }, 201);
}
