import { ensureMigrations } from "@/lib/db/migrate";
import { getDb } from "@/lib/db";
import { profileVersions } from "@/lib/db/schema";
import { json, jsonError, parseJsonField } from "@/lib/api-utils";
import { eq, and } from "drizzle-orm";
import { SUGGESTION_DRAFT } from "@/lib/repositories/version-manager";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  await ensureMigrations();
  const { id, versionId } = await params;
  const db = await getDb();

  const rows = await db
    .select()
    .from(profileVersions)
    .where(
      and(
        eq(profileVersions.creatorId, id),
        eq(profileVersions.id, versionId)
      )
    )
    .limit(1);

  if (rows.length === 0) {
    return jsonError("Version not found", 404);
  }

  const row = rows[0];
  if (row.triggerType === SUGGESTION_DRAFT) {
    return jsonError("该记录是建议草稿，不属于画像版本", 404);
  }
  return json({
    id: row.id,
    snapshot: parseJsonField(row.snapshot, { profile: {}, insights: [] }),
    changeSummary: row.changeSummary,
    triggerType: row.triggerType,
    sourceAssetId: row.sourceAssetId,
    createdAt: row.createdAt,
  });
}
