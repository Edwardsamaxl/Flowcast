import { eq, and, asc, ne } from "drizzle-orm";
import { getDb, saveToDisk } from "@/lib/db";
import { ensureMigrations } from "@/lib/db/migrate";
import { profileVersions } from "@/lib/db/schema";
import { uid, parseJsonField } from "@/lib/api-utils";

export type VersionTriggerType =
  | "auto_write"
  | "manual_edit"
  | "feedback_refine"
  | "suggestion_draft";

export const SUGGESTION_DRAFT: VersionTriggerType = "suggestion_draft";

export type ProfileVersion = {
  id: string;
  creatorId: string;
  snapshot: unknown;
  changeSummary: string;
  sourceAssetId?: string;
  triggerType: VersionTriggerType;
  createdAt: number;
};

export interface VersionManager {
  createVersion(
    creatorId: string,
    snapshot: unknown,
    meta: {
      changeSummary: string;
      sourceAssetId?: string;
      triggerType: VersionTriggerType;
    }
  ): Promise<ProfileVersion>;
  listVersions(
    creatorId: string,
    options?: { includeDrafts?: boolean }
  ): Promise<ProfileVersion[]>;
  restoreVersion(
    creatorId: string,
    versionId: string
  ): Promise<unknown>;
  deleteOldestIfNeeded(creatorId: string, maxVersions?: number): Promise<void>;
}

function mapRow(row: typeof profileVersions.$inferSelect): ProfileVersion {
  return {
    id: row.id,
    creatorId: row.creatorId,
    snapshot: parseJsonField<unknown>(row.snapshot, {}),
    changeSummary: row.changeSummary,
    sourceAssetId: row.sourceAssetId ?? undefined,
    triggerType: row.triggerType as VersionTriggerType,
    createdAt: row.createdAt,
  };
}

export function createVersionManager(): VersionManager {
  return {
    async createVersion(
      creatorId: string,
      snapshot: unknown,
      meta: {
        changeSummary: string;
        sourceAssetId?: string;
        triggerType: VersionTriggerType;
      }
    ): Promise<ProfileVersion> {
      await ensureMigrations();
      const db = await getDb();

      // Drafts are not subject to the 5-version cap on real snapshots.
      if (meta.triggerType !== SUGGESTION_DRAFT) {
        await this.deleteOldestIfNeeded(creatorId, 5);
      }

      const version: typeof profileVersions.$inferInsert = {
        id: uid(),
        creatorId,
        snapshot: JSON.stringify(snapshot),
        changeSummary: meta.changeSummary,
        sourceAssetId: meta.sourceAssetId ?? null,
        triggerType: meta.triggerType,
        createdAt: Math.floor(Date.now() / 1000),
      };

      await db.insert(profileVersions).values(version);
      saveToDisk();

      return mapRow(version as typeof profileVersions.$inferSelect);
    },

    async listVersions(
      creatorId: string,
      options?: { includeDrafts?: boolean }
    ): Promise<ProfileVersion[]> {
      await ensureMigrations();
      const db = await getDb();

      const whereExpr = options?.includeDrafts
        ? eq(profileVersions.creatorId, creatorId)
        : and(
            eq(profileVersions.creatorId, creatorId),
            ne(profileVersions.triggerType, SUGGESTION_DRAFT)
          );

      const rows = await db
        .select()
        .from(profileVersions)
        .where(whereExpr)
        .orderBy(asc(profileVersions.createdAt));

      return rows.map(mapRow);
    },

    async restoreVersion(
      creatorId: string,
      versionId: string
    ): Promise<unknown> {
      await ensureMigrations();
      const db = await getDb();

      const rows = await db
        .select()
        .from(profileVersions)
        .where(
          and(
            eq(profileVersions.creatorId, creatorId),
            eq(profileVersions.id, versionId)
          )
        )
        .limit(1);

      if (rows.length === 0) {
        throw new Error(`Version ${versionId} not found for creator ${creatorId}`);
      }

      const row = rows[0];
      if (row.triggerType === SUGGESTION_DRAFT) {
        throw new Error(`Version ${versionId} is a suggestion draft, not restorable`);
      }

      return mapRow(row).snapshot;
    },

    async deleteOldestIfNeeded(
      creatorId: string,
      maxVersions = 5
    ): Promise<void> {
      await ensureMigrations();
      const db = await getDb();

      const rows = await db
        .select({ id: profileVersions.id, createdAt: profileVersions.createdAt })
        .from(profileVersions)
        .where(
          and(
            eq(profileVersions.creatorId, creatorId),
            ne(profileVersions.triggerType, SUGGESTION_DRAFT)
          )
        )
        .orderBy(asc(profileVersions.createdAt));

      if (rows.length < maxVersions) {
        return;
      }

      const toDelete = rows.slice(0, rows.length - maxVersions + 1);

      for (const row of toDelete) {
        await db
          .delete(profileVersions)
          .where(
            and(
              eq(profileVersions.creatorId, creatorId),
              eq(profileVersions.id, row.id)
            )
          );
      }

      saveToDisk();
    },
  };
}
