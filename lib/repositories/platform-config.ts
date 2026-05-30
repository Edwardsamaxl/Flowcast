import { eq, and, asc } from "drizzle-orm";
import { getDb, saveToDisk } from "@/lib/db";
import { ensureMigrations } from "@/lib/db/migrate";
import { userPlatformRules } from "@/lib/db/schema";
import { uid } from "@/lib/api-utils";

const PLATFORM_NAMES: Record<string, string> = {
  xiaohongshu: "小红书",
  douyin: "抖音",
  bilibili: "B站",
  zhihu: "知乎",
  x: "X",
};

const DEFAULT_RULES: Record<string, string> = {
  xiaohongshu:
    "短段落，强场景，标题直接点出痛点，转化要轻，不使用夸张承诺。",
  douyin:
    "口播节奏强，开头抓人，适合30-60秒短视频脚本，口语化，有互动感。",
  bilibili:
    "结构完整，信息密度高，适合长视频简介和动态文案，允许适度玩梗。",
  zhihu:
    "结论先行，结构完整，强调方法论和可信判断，弱化营销感。",
  x: "短句为主，观点密度高，开头抓人，口语化，适合连续观点输出。",
};

export type PlatformConfig = {
  id: string;
  platformKey: string;
  name: string;
  ruleTemplate: string;
  promptOverride: string;
  isActive: boolean;
  sortOrder: number;
};

export interface PlatformConfigRepository {
  loadPlatforms(userId: string): Promise<PlatformConfig[]>;
  getPlatformRule(
    userId: string,
    platformKey: string
  ): Promise<{ ruleTemplate: string; promptOverride: string } | null>;
  updatePlatform(
    userId: string,
    platformKey: string,
    changes: Partial<{
      ruleTemplate: string;
      promptOverride: string;
      isActive: boolean;
      sortOrder: number;
    }>
  ): Promise<void>;
  seedDefaultPlatforms(userId: string): Promise<void>;
}

function mapRow(row: typeof userPlatformRules.$inferSelect): PlatformConfig {
  return {
    id: row.id,
    platformKey: row.platformKey,
    name: PLATFORM_NAMES[row.platformKey] ?? row.platformKey,
    ruleTemplate: row.ruleTemplate,
    promptOverride: row.promptOverride,
    isActive: Boolean(row.isActive),
    sortOrder: row.sortOrder,
  };
}

export function createPlatformConfigRepository(): PlatformConfigRepository {
  return {
    async loadPlatforms(userId: string): Promise<PlatformConfig[]> {
      await ensureMigrations();
      const db = await getDb();

      const rows = await db
        .select()
        .from(userPlatformRules)
        .where(eq(userPlatformRules.userId, userId))
        .orderBy(asc(userPlatformRules.sortOrder));

      return rows.map(mapRow);
    },

    async getPlatformRule(
      userId: string,
      platformKey: string
    ): Promise<{ ruleTemplate: string; promptOverride: string } | null> {
      await ensureMigrations();
      const db = await getDb();

      const rows = await db
        .select()
        .from(userPlatformRules)
        .where(
          and(
            eq(userPlatformRules.userId, userId),
            eq(userPlatformRules.platformKey, platformKey)
          )
        )
        .limit(1);

      if (rows.length === 0) {
        return null;
      }

      return {
        ruleTemplate: rows[0].ruleTemplate,
        promptOverride: rows[0].promptOverride,
      };
    },

    async updatePlatform(
      userId: string,
      platformKey: string,
      changes: Partial<{
        ruleTemplate: string;
        promptOverride: string;
        isActive: boolean;
        sortOrder: number;
      }>
    ): Promise<void> {
      await ensureMigrations();
      const db = await getDb();

      const setClause: Record<string, unknown> = {
        updatedAt: Math.floor(Date.now() / 1000),
      };

      if (changes.ruleTemplate !== undefined) {
        setClause.ruleTemplate = changes.ruleTemplate;
      }
      if (changes.promptOverride !== undefined) {
        setClause.promptOverride = changes.promptOverride;
      }
      if (changes.isActive !== undefined) {
        setClause.isActive = changes.isActive ? 1 : 0;
      }
      if (changes.sortOrder !== undefined) {
        setClause.sortOrder = changes.sortOrder;
      }

      if (Object.keys(setClause).length === 1) {
        return;
      }

      await db
        .update(userPlatformRules)
        .set(setClause)
        .where(
          and(
            eq(userPlatformRules.userId, userId),
            eq(userPlatformRules.platformKey, platformKey)
          )
        );

      saveToDisk();
    },

    async seedDefaultPlatforms(userId: string): Promise<void> {
      await ensureMigrations();
      const db = await getDb();

      const existing = await db
        .select({ count: userPlatformRules.id })
        .from(userPlatformRules)
        .where(eq(userPlatformRules.userId, userId));

      if (existing.length > 0) {
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      let sortOrder = 0;

      for (const [platformKey, ruleTemplate] of Object.entries(DEFAULT_RULES)) {
        await db.insert(userPlatformRules).values({
          id: uid(),
          userId,
          platformKey,
          ruleTemplate,
          promptOverride: "",
          isActive: 1,
          sortOrder,
          createdAt: now,
          updatedAt: now,
        });
        sortOrder += 1;
      }

      saveToDisk();
    },
  };
}
