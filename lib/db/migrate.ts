import { initDb, getSqlJsDb, saveToDisk } from "./index";

// ---------------------------------------------------------------------------
// Schema definitions
// ---------------------------------------------------------------------------

const MIGRATION_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS _migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  applied_at INTEGER NOT NULL DEFAULT (unixepoch())
);
`;

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS creators (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default' REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS creator_profiles (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  positioning TEXT NOT NULL DEFAULT '',
  tone TEXT NOT NULL DEFAULT '[]',
  beliefs TEXT NOT NULL DEFAULT '[]',
  structures TEXT NOT NULL DEFAULT '[]',
  avoid_phrases TEXT NOT NULL DEFAULT '[]',
  title_preference TEXT NOT NULL DEFAULT '',
  catchphrases TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS creator_insights (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  source_asset_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS profile_versions (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  snapshot TEXT NOT NULL DEFAULT '{}',
  change_summary TEXT NOT NULL DEFAULT '',
  source_asset_id TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'manual_edit',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS user_platform_rules (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform_key TEXT NOT NULL,
  rule_template TEXT NOT NULL DEFAULT '',
  prompt_override TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(user_id, platform_key)
);

CREATE TABLE IF NOT EXISTS source_assets (
  id TEXT PRIMARY KEY,
  creator_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
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

// ---------------------------------------------------------------------------
// Migration helpers
// ---------------------------------------------------------------------------

let migrated = false;

function execStatements(sqlite: any, sql: string) {
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const stmt of statements) {
    sqlite.run(stmt);
  }
}

function tableHasColumn(sqlite: any, table: string, column: string): boolean {
  try {
    const result = sqlite.exec(`PRAGMA table_info(${table})`);
    if (!result || result.length === 0) return false;
    const columns = result[0].values.map((row: any[]) => row[1]);
    return columns.includes(column);
  } catch {
    return false;
  }
}

function tableExists(sqlite: any, table: string): boolean {
  try {
    const result = sqlite.exec(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='${table}'`
    );
    return result && result.length > 0 && result[0].values.length > 0;
  } catch {
    return false;
  }
}

function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// v1 -> v2 migration: Creator Memory System refactor
// ---------------------------------------------------------------------------

function migrateV1ToV2(sqlite: any) {
  // Detect v1 by checking if creator_profiles has 'domain' column
  const isV1 = tableHasColumn(sqlite, "creator_profiles", "domain");
  if (!isV1) return;

  // 1. Ensure default user
  sqlite.run(
    `INSERT OR IGNORE INTO users (id, created_at, updated_at) VALUES ('default', unixepoch(), unixepoch())`
  );

  // 2. Backfill creators.user_id
  sqlite.run(
    `UPDATE creators SET user_id = 'default' WHERE user_id IS NULL OR user_id = ''`
  );

  // 3. Migrate creator_profiles
  sqlite.run(`ALTER TABLE creator_profiles RENAME TO _creator_profiles_old`);

  sqlite.run(`
    CREATE TABLE creator_profiles (
      id TEXT PRIMARY KEY,
      creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
      positioning TEXT NOT NULL DEFAULT '',
      tone TEXT NOT NULL DEFAULT '[]',
      beliefs TEXT NOT NULL DEFAULT '[]',
      structures TEXT NOT NULL DEFAULT '[]',
      avoid_phrases TEXT NOT NULL DEFAULT '[]',
      title_preference TEXT NOT NULL DEFAULT '',
      catchphrases TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // Read old data
  const oldResult = sqlite.exec(`SELECT * FROM _creator_profiles_old`);
  if (oldResult && oldResult.length > 0) {
    const columns: string[] = oldResult[0].columns;
    const rows: any[][] = oldResult[0].values;

    for (const row of rows) {
      const profile: Record<string, any> = {};
      columns.forEach((col, i) => {
        profile[col] = row[i];
      });

      // Merge positioning + domain
      let positioning = profile.positioning || "";
      const domain = profile.domain || "";
      if (domain && !positioning.includes(domain)) {
        positioning = positioning ? `${positioning} / ${domain}` : domain;
      }

      // Merge beliefs + cases
      let beliefs: string[] = [];
      try {
        beliefs = JSON.parse(profile.beliefs || "[]");
      } catch {}
      let cases: any[] = [];
      try {
        cases = JSON.parse(profile.cases || "[]");
      } catch {}
      for (const c of cases) {
        const caseStr = typeof c === "string" ? c : JSON.stringify(c);
        if (!beliefs.some((b) => b === caseStr || b.includes(caseStr) || caseStr.includes(b))) {
          beliefs.push(caseStr);
        }
      }

      // Migrate platform_rules -> user_platform_rules for default user
      try {
        const platformRules = JSON.parse(profile.platform_rules || "{}");
        for (const [platformKey, rule] of Object.entries(platformRules)) {
          if (rule && typeof rule === "string" && rule.trim()) {
            sqlite.run(
              `INSERT OR REPLACE INTO user_platform_rules
               (id, user_id, platform_key, rule_template, created_at, updated_at)
               VALUES (?, 'default', ?, ?, unixepoch(), unixepoch())`,
              [generateId(), platformKey, rule.trim()]
            );
          }
        }
      } catch {}

      // Insert migrated profile
      sqlite.run(
        `INSERT INTO creator_profiles
         (id, creator_id, positioning, tone, beliefs, structures, avoid_phrases, title_preference, catchphrases, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profile.id,
          profile.creator_id,
          positioning,
          profile.tone || "[]",
          JSON.stringify(beliefs),
          profile.common_patterns || "[]",
          profile.avoid_phrases || "[]",
          profile.title_preference || "",
          "[]",
          profile.created_at,
          profile.updated_at,
        ]
      );
    }
  }

  sqlite.run(`DROP TABLE _creator_profiles_old`);

  // 4. Drop deprecated profile_suggestions
  if (tableExists(sqlite, "profile_suggestions")) {
    sqlite.run(`DROP TABLE profile_suggestions`);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function runMigrations() {
  await initDb();
  const sqlite = getSqlJsDb();

  execStatements(sqlite, MIGRATION_TABLE_SQL);
  execStatements(sqlite, SCHEMA_SQL);
  migrateV1ToV2(sqlite);

  sqlite.run(
    `INSERT OR IGNORE INTO _migrations (name, applied_at) VALUES ('v2_creator_memory_system', unixepoch())`
  );

  saveToDisk();
}

export async function ensureMigrations() {
  if (migrated) return;
  await runMigrations();
  migrated = true;
}
