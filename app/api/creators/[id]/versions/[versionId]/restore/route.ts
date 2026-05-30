import { ensureMigrations } from "@/lib/db/migrate";
import { getDb, saveToDisk } from "@/lib/db";
import { profileVersions, creatorProfiles, creatorInsights } from "@/lib/db/schema";
import { uid, json, jsonError, now, parseJsonField } from "@/lib/api-utils";
import { eq, and } from "drizzle-orm";
import { createVersionManager, SUGGESTION_DRAFT } from "@/lib/repositories/version-manager";

export async function POST(
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

  if (rows[0].triggerType === SUGGESTION_DRAFT) {
    return jsonError("该记录是建议草稿，不可用于回滚", 400);
  }

  const snapshot = parseJsonField<{
    profile?: {
      positioning?: string;
      tone?: string[];
      beliefs?: string[];
      structures?: string[];
      avoidPhrases?: string[];
      titlePreference?: string;
      catchphrases?: string[];
    };
    insights?: Array<{ id?: string; content: string; tags?: string[]; sourceAssetId?: string; createdAt?: number }>;
  }>(rows[0].snapshot, {});

  if (!snapshot.profile) {
    return jsonError("快照结构异常：缺少 profile 字段", 422);
  }

  const profileSnap = snapshot.profile;

  // Update creator_profiles
  await db
    .update(creatorProfiles)
    .set({
      positioning: profileSnap.positioning || "",
      tone: JSON.stringify(profileSnap.tone || []),
      beliefs: JSON.stringify(profileSnap.beliefs || []),
      structures: JSON.stringify(profileSnap.structures || []),
      avoidPhrases: JSON.stringify(profileSnap.avoidPhrases || []),
      titlePreference: profileSnap.titlePreference || "",
      catchphrases: JSON.stringify(profileSnap.catchphrases || []),
      updatedAt: now(),
    })
    .where(eq(creatorProfiles.creatorId, id));

  // Replace insights: delete old, insert from snapshot
  await db
    .delete(creatorInsights)
    .where(eq(creatorInsights.creatorId, id));

  for (const insight of snapshot.insights || []) {
    await db.insert(creatorInsights).values({
      id: insight.id || uid(),
      creatorId: id,
      content: insight.content,
      tags: JSON.stringify(insight.tags || []),
      sourceAssetId: insight.sourceAssetId ?? null,
      createdAt: insight.createdAt || now(),
    });
  }

  // Record the restore as a new manual_edit snapshot (handles 5-cap automatically)
  await createVersionManager().createVersion(
    id,
    {
      profile: {
        positioning: profileSnap.positioning || "",
        tone: profileSnap.tone || [],
        beliefs: profileSnap.beliefs || [],
        structures: profileSnap.structures || [],
        avoidPhrases: profileSnap.avoidPhrases || [],
        titlePreference: profileSnap.titlePreference || "",
        catchphrases: profileSnap.catchphrases || [],
      },
      insights: snapshot.insights || [],
    },
    {
      changeSummary: `恢复到版本 ${versionId}`,
      triggerType: "manual_edit",
    }
  );

  saveToDisk();
  return json({ success: true, restoredFrom: versionId });
}
