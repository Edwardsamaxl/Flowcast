import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ---- Users ----

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---- Creators ----

export const creators = sqliteTable("creators", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .default("default")
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---- Creator Profiles ----
// Core dimensions (structured). Positioning includes domain. Beliefs includes cases.

export const creatorProfiles = sqliteTable("creator_profiles", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  positioning: text("positioning").notNull().default(""),
  tone: text("tone").notNull().default("[]"),
  beliefs: text("beliefs").notNull().default("[]"),
  structures: text("structures").notNull().default("[]"),
  avoidPhrases: text("avoid_phrases").notNull().default("[]"),
  titlePreference: text("title_preference").notNull().default(""),
  catchphrases: text("catchphrases").notNull().default("[]"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---- Creator Insights ----
// Open-ended insights (the "flesh" of the profile). Free text with tags.

export const creatorInsights = sqliteTable("creator_insights", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  content: text("content").notNull().default(""),
  tags: text("tags").notNull().default("[]"),
  sourceAssetId: text("source_asset_id"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---- Profile Versions ----
// Full JSON snapshots of profile + insights at a point in time. Max 5 per creator.

export const profileVersions = sqliteTable("profile_versions", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  snapshot: text("snapshot").notNull().default("{}"),
  changeSummary: text("change_summary").notNull().default(""),
  sourceAssetId: text("source_asset_id"),
  triggerType: text("trigger_type").notNull().default("manual_edit"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---- User Platform Rules ----
// Per-user editable platform rules. All creators under a user share these rules.

export const userPlatformRules = sqliteTable("user_platform_rules", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  platformKey: text("platform_key").notNull(),
  ruleTemplate: text("rule_template").notNull().default(""),
  promptOverride: text("prompt_override").notNull().default(""),
  isActive: integer("is_active").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
}, (table) => [
  uniqueIndex("user_platform_unique").on(table.userId, table.platformKey),
]);

// ---- Source Assets ----

export const sourceAssets = sqliteTable("source_assets", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id"),
  type: text("type").notNull(),
  title: text("title").notNull().default(""),
  filePath: text("file_path").notNull().default(""),
  duration: text("duration").notNull().default(""),
  status: text("status").notNull().default("uploaded"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---- Transcripts ----

export const transcripts = sqliteTable("transcripts", {
  id: text("id").primaryKey(),
  assetId: text("asset_id")
    .notNull()
    .references(() => sourceAssets.id, { onDelete: "cascade" }),
  fullText: text("full_text").notNull().default(""),
  segments: text("segments").notNull().default("[]"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---- Analyses ----

export const analyses = sqliteTable("analyses", {
  id: text("id").primaryKey(),
  assetId: text("asset_id")
    .notNull()
    .references(() => sourceAssets.id, { onDelete: "cascade" }),
  topic: text("topic").notNull().default(""),
  summary: text("summary").notNull().default(""),
  corePoints: text("core_points").notNull().default("[]"),
  cases: text("cases").notNull().default("[]"),
  quotes: text("quotes").notNull().default("[]"),
  contentAngles: text("content_angles").notNull().default("[]"),
  riskNotes: text("risk_notes").notNull().default("[]"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---- Rewrite Tasks ----

export const rewriteTasks = sqliteTable("rewrite_tasks", {
  id: text("id").primaryKey(),
  assetId: text("asset_id")
    .notNull()
    .references(() => sourceAssets.id, { onDelete: "cascade" }),
  creatorId: text("creator_id"),
  title: text("title").notNull().default(""),
  platforms: text("platforms").notNull().default("[]"),
  status: text("status").notNull().default("draft"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---- Generated Drafts ----

export const generatedDrafts = sqliteTable("generated_drafts", {
  id: text("id").primaryKey(),
  taskId: text("task_id")
    .notNull()
    .references(() => rewriteTasks.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  title: text("title").notNull().default(""),
  content: text("content").notNull().default(""),
  notes: text("notes").notNull().default("[]"),
  voiceAlignment: text("voice_alignment"),
  status: text("status").notNull().default("draft"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---- Feedback Messages ----

export const feedbackMessages = sqliteTable("feedback_messages", {
  id: text("id").primaryKey(),
  taskId: text("task_id")
    .notNull()
    .references(() => rewriteTasks.id, { onDelete: "cascade" }),
  draftId: text("draft_id"),
  scope: text("scope").notNull().default("current_draft"),
  tags: text("tags").notNull().default("[]"),
  message: text("message").notNull().default(""),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// Note: profile_suggestions table removed in v2 — suggestions are now transient.
