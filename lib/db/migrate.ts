import { initDb, getSqlJsDb, saveToDisk } from "./index";
import { getEnv } from "@/lib/server/env";
import { mkdirSync } from "node:fs";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS creators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS creator_profiles (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  positioning TEXT NOT NULL DEFAULT '',
  domain TEXT NOT NULL DEFAULT '',
  tone TEXT NOT NULL DEFAULT '[]',
  beliefs TEXT NOT NULL DEFAULT '[]',
  cases TEXT NOT NULL DEFAULT '[]',
  common_patterns TEXT NOT NULL DEFAULT '[]',
  avoid_phrases TEXT NOT NULL DEFAULT '[]',
  title_preference TEXT NOT NULL DEFAULT '',
  platform_rules TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS source_assets (
  id TEXT PRIMARY KEY,
  creator_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  file_path TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'uploaded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS transcripts (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES source_assets(id) ON DELETE CASCADE,
  full_text TEXT NOT NULL DEFAULT '',
  segments TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS analyses (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES source_assets(id) ON DELETE CASCADE,
  topic TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  core_points TEXT NOT NULL DEFAULT '[]',
  cases TEXT NOT NULL DEFAULT '[]',
  quotes TEXT NOT NULL DEFAULT '[]',
  content_angles TEXT NOT NULL DEFAULT '[]',
  risk_notes TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS rewrite_tasks (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES source_assets(id) ON DELETE CASCADE,
  creator_id TEXT,
  title TEXT NOT NULL DEFAULT '',
  platforms TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS generated_drafts (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES rewrite_tasks(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '[]',
  voice_alignment TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS profile_suggestions (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES source_assets(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  suggestions TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS feedback_messages (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES rewrite_tasks(id) ON DELETE CASCADE,
  draft_id TEXT,
  scope TEXT NOT NULL DEFAULT 'current_draft',
  tags TEXT NOT NULL DEFAULT '[]',
  message TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
`;

let migrated = false;

export async function runMigrations() {
  await initDb();
  const sqlite = getSqlJsDb();

  // sql.js doesn't support multi-statement exec well, split by semicolons
  const statements = SCHEMA_SQL
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    sqlite.run(stmt);
  }

  saveToDisk();
}

export async function ensureMigrations() {
  if (migrated) return;
  await runMigrations();
  migrated = true;
}
