import { eq, and } from "drizzle-orm";
import { getDb, saveToDisk } from "@/lib/db";
import { ensureMigrations } from "@/lib/db/migrate";
import { creatorProfiles, creatorInsights } from "@/lib/db/schema";
import { uid, parseJsonField } from "@/lib/api-utils";

export type CreatorInsight = {
  id: string;
  content: string;
  tags: string[];
  sourceAssetId?: string;
  createdAt: number;
};

export type FullCreatorProfile = {
  id: string;
  creatorId: string;
  positioning: string;
  tone: string[];
  beliefs: string[];
  structures: string[];
  avoidPhrases: string[];
  titlePreference: string;
  catchphrases: string[];
  insights: CreatorInsight[];
  createdAt: number;
  updatedAt: number;
};

export interface CreatorProfileRepository {
  loadProfile(creatorId: string): Promise<FullCreatorProfile | null>;
  updateProfile(
    creatorId: string,
    changes: Partial<Omit<FullCreatorProfile, "insights">>
  ): Promise<void>;
  addInsight(
    creatorId: string,
    insight: { content: string; tags: string[]; sourceAssetId?: string }
  ): Promise<CreatorInsight>;
  removeInsight(creatorId: string, insightId: string): Promise<void>;
  updateInsight(
    creatorId: string,
    insightId: string,
    changes: Partial<{ content: string; tags: string[] }>
  ): Promise<void>;
}

function mapProfileRow(row: typeof creatorProfiles.$inferSelect): Omit<FullCreatorProfile, "insights"> {
  return {
    id: row.id,
    creatorId: row.creatorId,
    positioning: row.positioning,
    tone: parseJsonField<string[]>(row.tone, []),
    beliefs: parseJsonField<string[]>(row.beliefs, []),
    structures: parseJsonField<string[]>(row.structures, []),
    avoidPhrases: parseJsonField<string[]>(row.avoidPhrases, []),
    titlePreference: row.titlePreference,
    catchphrases: parseJsonField<string[]>(row.catchphrases, []),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapInsightRow(row: typeof creatorInsights.$inferSelect): CreatorInsight {
  return {
    id: row.id,
    content: row.content,
    tags: parseJsonField<string[]>(row.tags, []),
    sourceAssetId: row.sourceAssetId ?? undefined,
    createdAt: row.createdAt,
  };
}

export function createCreatorProfileRepository(): CreatorProfileRepository {
  return {
    async loadProfile(creatorId: string): Promise<FullCreatorProfile | null> {
      await ensureMigrations();
      const db = await getDb();

      const profileRows = await db
        .select()
        .from(creatorProfiles)
        .where(eq(creatorProfiles.creatorId, creatorId))
        .limit(1);

      if (profileRows.length === 0) {
        return null;
      }

      const profile = mapProfileRow(profileRows[0]);

      const insightRows = await db
        .select()
        .from(creatorInsights)
        .where(eq(creatorInsights.creatorId, creatorId))
        .orderBy(creatorInsights.createdAt);

      return {
        ...profile,
        insights: insightRows.map(mapInsightRow),
      };
    },

    async updateProfile(
      creatorId: string,
      changes: Partial<Omit<FullCreatorProfile, "insights">>
    ): Promise<void> {
      await ensureMigrations();
      const db = await getDb();

      const setClause: Record<string, unknown> = {
        updatedAt: Math.floor(Date.now() / 1000),
      };

      if (changes.positioning !== undefined) {
        setClause.positioning = changes.positioning;
      }
      if (changes.tone !== undefined) {
        setClause.tone = JSON.stringify(changes.tone);
      }
      if (changes.beliefs !== undefined) {
        setClause.beliefs = JSON.stringify(changes.beliefs);
      }
      if (changes.structures !== undefined) {
        setClause.structures = JSON.stringify(changes.structures);
      }
      if (changes.avoidPhrases !== undefined) {
        setClause.avoidPhrases = JSON.stringify(changes.avoidPhrases);
      }
      if (changes.titlePreference !== undefined) {
        setClause.titlePreference = changes.titlePreference;
      }
      if (changes.catchphrases !== undefined) {
        setClause.catchphrases = JSON.stringify(changes.catchphrases);
      }

      await db
        .update(creatorProfiles)
        .set(setClause)
        .where(eq(creatorProfiles.creatorId, creatorId));

      saveToDisk();
    },

    async addInsight(
      creatorId: string,
      insight: { content: string; tags: string[]; sourceAssetId?: string }
    ): Promise<CreatorInsight> {
      await ensureMigrations();
      const db = await getDb();

      const newInsight: typeof creatorInsights.$inferInsert = {
        id: uid(),
        creatorId,
        content: insight.content,
        tags: JSON.stringify(insight.tags),
        sourceAssetId: insight.sourceAssetId ?? null,
        createdAt: Math.floor(Date.now() / 1000),
      };

      await db.insert(creatorInsights).values(newInsight);
      saveToDisk();

      return mapInsightRow(newInsight as typeof creatorInsights.$inferSelect);
    },

    async removeInsight(creatorId: string, insightId: string): Promise<void> {
      await ensureMigrations();
      const db = await getDb();

      await db
        .delete(creatorInsights)
        .where(
          and(
            eq(creatorInsights.creatorId, creatorId),
            eq(creatorInsights.id, insightId)
          )
        );

      saveToDisk();
    },

    async updateInsight(
      creatorId: string,
      insightId: string,
      changes: Partial<{ content: string; tags: string[] }>
    ): Promise<void> {
      await ensureMigrations();
      const db = await getDb();

      const setClause: Record<string, unknown> = {};

      if (changes.content !== undefined) {
        setClause.content = changes.content;
      }
      if (changes.tags !== undefined) {
        setClause.tags = JSON.stringify(changes.tags);
      }

      if (Object.keys(setClause).length === 0) {
        return;
      }

      await db
        .update(creatorInsights)
        .set(setClause)
        .where(
          and(
            eq(creatorInsights.creatorId, creatorId),
            eq(creatorInsights.id, insightId)
          )
        );

      saveToDisk();
    },
  };
}
