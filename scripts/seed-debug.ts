import { initDb, getSqlJsDb, saveToDisk, closeDb } from "../lib/db";
import * as schema from "../lib/db/schema";

async function seed() {
  const db = await initDb();
  const sqlite = getSqlJsDb();

  console.log("Inserting creators...");
  await db.insert(schema.creators).values([
    { id: "creator_01", name: "小水同学" },
    { id: "creator_02", name: "Russell" },
  ]);
  let r = sqlite.exec("SELECT COUNT(*) FROM creators");
  console.log("creators count:", r[0]?.values[0][0]);
  saveToDisk();

  console.log("Inserting assets...");
  await db.insert(schema.sourceAssets).values([
    { id: "asset_01", creatorId: "creator_01", type: "video", title: "iPhone 15 Pro 三个月真实体验", filePath: "/storage/assets/iphone15pro.mp4", duration: "32:15", status: "analyzed" },
  ]);
  r = sqlite.exec("SELECT COUNT(*) FROM source_assets");
  console.log("assets count:", r[0]?.values[0][0]);
  saveToDisk();

  closeDb();
  console.log("Done.");
}

seed().catch(console.error);
