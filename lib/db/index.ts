import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import * as schema from "./schema";
import { getEnv } from "@/lib/server/env";

let dbInstance: ReturnType<typeof drizzle> | null = null;
let sqlJsDb: SqlJsDatabase | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

const DB_FILENAME = "flowcast.db";

function getDbPath(): string {
  const env = getEnv();
  const dir = env.appStorageDir;
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return `${dir}/${DB_FILENAME}`;
}

function saveToDisk() {
  if (!sqlJsDb) return;
  const data = sqlJsDb.export();
  const buffer = Buffer.from(data);
  const dbPath = getDbPath();
  mkdirSync(dirname(dbPath), { recursive: true });
  writeFileSync(dbPath, buffer);
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveToDisk, 1000); // Debounce saves by 1s
}

export async function initDb(): Promise<ReturnType<typeof drizzle>> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();
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
  if (saveTimer) clearTimeout(saveTimer);
  saveToDisk();
  if (sqlJsDb) {
    sqlJsDb.close();
    sqlJsDb = null;
    dbInstance = null;
  }
}

// Auto-save after writes
export { saveToDisk, scheduleSave };
