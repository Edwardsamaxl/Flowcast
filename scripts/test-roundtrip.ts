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

  console.log("Memory before save:", sqlite.exec("SELECT COUNT(*) FROM creators")[0]?.values[0][0]);

  saveToDisk();

  const wasmBuffer = readFileSync(join(process.cwd(), "node_modules/sql.js/dist/sql-wasm.wasm"));
  const SQL = await initSqlJs({ wasmBinary: wasmBuffer.buffer });
  const buffer = readFileSync("storage/flowcast.db");
  const db2 = new SQL.Database(buffer);
  console.log("Reload in same process:", db2.exec("SELECT COUNT(*) FROM creators")[0]?.values[0][0]);
  db2.close();

  // Now use closeDb and see what happens
  closeDb();

  // Re-read after closeDb
  const buffer3 = readFileSync("storage/flowcast.db");
  const db3 = new SQL.Database(buffer3);
  console.log("After closeDb:", db3.exec("SELECT COUNT(*) FROM creators")[0]?.values[0][0]);
  db3.close();
}

test().catch(console.error);
