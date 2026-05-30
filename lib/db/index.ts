import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import * as schema from "./schema";
import { getEnv } from "@/lib/server/env";

// Use globalThis to persist database instance across HMR reloads in dev mode.
// Next.js may reload API route modules, which resets module-level variables.
const globalDb = globalThis as unknown as {
  __flowcast_db_instance__: ReturnType<typeof drizzle> | null;
  __flowcast_sqljs_db__: SqlJsDatabase | null;
  __flowcast_auto_save_interval__: ReturnType<typeof setInterval> | null;
  __flowcast_save_timer__: ReturnType<typeof setTimeout> | null;
};

if (!globalDb.__flowcast_db_instance__) globalDb.__flowcast_db_instance__ = null;
if (!globalDb.__flowcast_sqljs_db__) globalDb.__flowcast_sqljs_db__ = null;
if (!globalDb.__flowcast_auto_save_interval__) globalDb.__flowcast_auto_save_interval__ = null;
if (!globalDb.__flowcast_save_timer__) globalDb.__flowcast_save_timer__ = null;

let dbInstance: ReturnType<typeof drizzle> | null = globalDb.__flowcast_db_instance__;
let sqlJsDb: SqlJsDatabase | null = globalDb.__flowcast_sqljs_db__;
let saveTimer: ReturnType<typeof setTimeout> | null = globalDb.__flowcast_save_timer__;
let autoSaveInterval: ReturnType<typeof setInterval> | null = globalDb.__flowcast_auto_save_interval__;

const DB_FILENAME = "flowcast.db";

function getDbPath(): string {
  const env = getEnv();
  const dir = resolve(env.appStorageDir);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return join(dir, DB_FILENAME);
}

export function saveToDisk() {
  if (!sqlJsDb) return;
  const data = sqlJsDb.export();
  const buffer = Buffer.from(data);
  const dbPath = getDbPath();
  mkdirSync(dirname(dbPath), { recursive: true });
  writeFileSync(dbPath, buffer);
}

export function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveToDisk();
    globalDb.__flowcast_save_timer__ = null;
    saveTimer = null;
  }, 1000);
  globalDb.__flowcast_save_timer__ = saveTimer;
}

export async function initDb(): Promise<ReturnType<typeof drizzle>> {
  if (dbInstance && sqlJsDb) {
    return dbInstance;
  }

  const wasmBuffer = readFileSync(join(process.cwd(), "node_modules/sql.js/dist/sql-wasm.wasm"));
  const SQL = await initSqlJs({ wasmBinary: wasmBuffer.buffer });
  const dbPath = getDbPath();

  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    sqlJsDb = new SQL.Database(buffer);
  } else {
    mkdirSync(dirname(dbPath), { recursive: true });
    sqlJsDb = new SQL.Database();
  }

  sqlJsDb.run("PRAGMA foreign_keys = ON");

  dbInstance = drizzle(sqlJsDb, { schema });
  globalDb.__flowcast_db_instance__ = dbInstance;
  globalDb.__flowcast_sqljs_db__ = sqlJsDb;

  if (!autoSaveInterval) {
    autoSaveInterval = setInterval(saveToDisk, 3000);
    globalDb.__flowcast_auto_save_interval__ = autoSaveInterval;
  }

  return dbInstance;
}

export async function getDb() {
  return initDb();
}

export function getSqlJsDb(): SqlJsDatabase {
  if (!sqlJsDb) throw new Error("Database not initialized. Call initDb() first.");
  return sqlJsDb;
}

// Save and close
export function closeDb() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    globalDb.__flowcast_save_timer__ = null;
    saveTimer = null;
  }
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    globalDb.__flowcast_auto_save_interval__ = null;
    autoSaveInterval = null;
  }
  saveToDisk();
  if (sqlJsDb) {
    sqlJsDb.close();
    sqlJsDb = null;
    globalDb.__flowcast_sqljs_db__ = null;
  }
  dbInstance = null;
  globalDb.__flowcast_db_instance__ = null;
}
