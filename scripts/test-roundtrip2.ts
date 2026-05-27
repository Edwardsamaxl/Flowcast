import { initDb, getSqlJsDb, saveToDisk, closeDb } from "../lib/db";
import * as schema from "../lib/db/schema";
import { readFileSync } from "fs";
import initSqlJs from "sql.js";
import { join } from "path";

async function test() {
  const db = await initDb();
  const sqlite = getSqlJsDb();

  await db.insert(schema.creators).values([
    { id: "creator_01", name: "小水同学" },
  ]);

  console.log("Memory:", sqlite.exec("SELECT COUNT(*) FROM creators")[0]?.values[0][0]);

  saveToDisk();

  // Reload immediately in same process
  const buffer = readFileSync("storage/flowcast.db");
  const SQL = await initSqlJs({ wasmBinary: readFileSync(join(process.cwd(), "node_modules/sql.js/dist/sql-wasm.wasm")).buffer });
  const db2 = new SQL.Database(buffer);
  console.log("Same process reload:", db2.exec("SELECT COUNT(*) FROM creators")[0]?.values[0][0]);
  db2.close();

  closeDb();
}

test().catch(console.error);
