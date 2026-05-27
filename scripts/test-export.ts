import { initDb, getSqlJsDb, saveToDisk, closeDb } from "../lib/db";
import * as schema from "../lib/db/schema";

async function test() {
  const db = await initDb();
  const sqlite = getSqlJsDb();

  await db.insert(schema.creators).values([
    { id: "creator_01", name: "小水同学" },
  ]);

  console.log("Memory count:", sqlite.exec("SELECT COUNT(*) FROM creators")[0]?.values[0][0]);

  const data1 = sqlite.export();
  console.log("Export size before save:", data1.byteLength);

  saveToDisk();

  const fs = require("fs");
  const stat = fs.statSync("storage/flowcast.db");
  console.log("File size after save:", stat.size);

  // Now closeDb
  closeDb();

  const stat2 = fs.statSync("storage/flowcast.db");
  console.log("File size after closeDb:", stat2.size);
}

test().catch(console.error);
