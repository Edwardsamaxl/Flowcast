import { initDb, getSqlJsDb, saveToDisk, closeDb } from "../lib/db";
import * as schema from "../lib/db/schema";

async function test() {
  const db = await initDb();
  
  await db.insert(schema.creators).values({ id: "test_01", name: "Test User" });
  
  const sqlite = getSqlJsDb();
  const result = sqlite.exec("SELECT * FROM creators");
  console.log("After insert:", JSON.stringify(result));
  
  saveToDisk();
  closeDb();
}

test().catch(console.error);
