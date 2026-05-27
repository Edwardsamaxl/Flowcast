import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ---- Creators (personas) ----

export const creators = sqliteTable("creators", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const creatorProfiles = sqliteTable("creator_profiles", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  positioning: text("positioning").notNull().default(""),
  domain: text("domain").notNull().default(""),
  tone: text("tone").notNull().default("[]"),           // JSON array
  beliefs: text("beliefs").notNull().default("[]"),      // JSON array
  cases: text("cases").notNull().default("[]"),          // JSON array
  commonPatterns: text("common_patterns").notNull().default("[]"), // JSON array
  avoidPhrases: text("avoid_phrases").notNull().default("[]"),     // JSON array
  titlePreference: text("title_preference").notNull().default(""),
  platformRules: text("platform_rules").notNull().default("{}"),   // JSON object
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---- Source Assets (uploaded videos / audio / images / text) ----

export const sourceAssets = sqliteTable("source_assets", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id"), // nullable — asset may not be tied to a creator yet
  type: text("type").notNull(),   // "video" | "audio" | "image" | "text"
  title: text("title").notNull().default(""),
  source: text("source").notNull().default(""),  // "直播回放", "课程录屏", etc.
  filePath: text("file_path").notNull().default(""),
  duration: text("duration").notNull().default(""),
  status: text("status").notNull().default("uploaded"),
  // uploaded | extracting_audio | transcribing | transcribed | analyzing | analyzed | failed
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
  segments: text("segments").notNull().default("[]"), // JSON
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---- Analyses (LLM analysis of transcript) ----

export const analyses = sqliteTable("analyses", {
  id: text("id").primaryKey(),
  assetId: text("asset_id")
    .notNull()
    .references(() => sourceAssets.id, { onDelete: "cascade" }),
  topic: text("topic").notNull().default(""),
  summary: text("summary").notNull().default(""),
  corePoints: text("core_points").notNull().default("[]"),    // JSON
  cases: text("cases").notNull().default("[]"),               // JSON
  quotes: text("quotes").notNull().default("[]"),             // JSON
  contentAngles: text("content_angles").notNull().default("[]"), // JSON
  riskNotes: text("risk_notes").notNull().default("[]"),      // JSON
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---- Rewrite Tasks (a content transformation job) ----

export const rewriteTasks = sqliteTable("rewrite_tasks", {
  id: text("id").primaryKey(),
  assetId: text("asset_id")
    .notNull()
    .references(() => sourceAssets.id, { onDelete: "cascade" }),
  creatorId: text("creator_id"), // nullable
  title: text("title").notNull().default(""),
  platforms: text("platforms").notNull().default("[]"), // JSON array of platform keys
  status: text("status").notNull().default("draft"),
  // draft | analyzing | generating | completed | failed
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---- Generated Drafts (one per platform per task) ----

export const generatedDrafts = sqliteTable("generated_drafts", {
  id: text("id").primaryKey(),
  taskId: text("task_id")
    .notNull()
    .references(() => rewriteTasks.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  title: text("title").notNull().default(""),
  content: text("content").notNull().default(""),
  notes: text("notes").notNull().default("[]"),             // JSON
  voiceAlignment: text("voice_alignment"),                  // JSON, nullable
  status: text("status").notNull().default("draft"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---- Profile Suggestions (pending profile changes from analysis) ----

export const profileSuggestions = sqliteTable("profile_suggestions", {
  id: text("id").primaryKey(),
  assetId: text("asset_id")
    .notNull()
    .references(() => sourceAssets.id, { onDelete: "cascade" }),
  creatorId: text("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  suggestions: text("suggestions").notNull().default("{}"), // JSON: CreatorProfileSuggestions
  status: text("status").notNull().default("pending"),
  // pending | applied | ignored
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
  draftId: text("draft_id"), // nullable — may apply to whole task
  scope: text("scope").notNull().default("current_draft"),
  // "current_draft" | "creator_profile" (legacy: voice_profile)
  tags: text("tags").notNull().default("[]"),  // JSON array
  message: text("message").notNull().default(""),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});
