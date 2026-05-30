import { ensureMigrations } from "@/lib/db/migrate";
import { getDb, saveToDisk } from "@/lib/db";
import { profileVersions } from "@/lib/db/schema";
import { json, jsonError, parseJsonField } from "@/lib/api-utils";
import { eq, and, desc } from "drizzle-orm";
import { SUGGESTION_DRAFT } from "@/lib/repositories/version-manager";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();

  const drafts = await db
    .select()
    .from(profileVersions)
    .where(
      and(
        eq(profileVersions.creatorId, id),
        eq(profileVersions.triggerType, SUGGESTION_DRAFT)
      )
    )
    .orderBy(desc(profileVersions.createdAt));

  return json(
    drafts.map((v) => ({
      id: v.id,
      sourceAssetId: v.sourceAssetId,
      snapshot: parseJsonField(v.snapshot, {}),
      createdAt: v.createdAt,
    }))
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureMigrations();
  const { id } = await params;
  const db = await getDb();

  const body = (await req.json()) as {
    suggestionId?: string;
    versionId?: string;
    action: "apply" | "ignore";
  };

  const draftId = body.suggestionId ?? body.versionId;
  if (!draftId) return jsonError("缺少 suggestionId", 400);

  const [draft] = await db
    .select()
    .from(profileVersions)
    .where(
      and(
        eq(profileVersions.creatorId, id),
        eq(profileVersions.id, draftId),
        eq(profileVersions.triggerType, SUGGESTION_DRAFT)
      )
    );

  if (!draft) return jsonError("建议草稿不存在", 404);

  // Both apply and ignore consume the draft. The actual profile write +
  // snapshot is performed by PUT /api/creators/[id] before this call.
  await db
    .delete(profileVersions)
    .where(eq(profileVersions.id, draftId));

  saveToDisk();
  return json({ success: true, action: body.action });
}
