import { initDb, getSqlJsDb, saveToDisk, closeDb } from "../lib/db";
import * as schema from "../lib/db/schema";
import { readFileSync, writeFileSync } from "fs";
import initSqlJs from "sql.js";
import { join } from "path";
import { execSync } from "child_process";

async function test() {
  const db = await initDb();
  const sqlite = getSqlJsDb();

  await db.insert(schema.creators).values([
    { id: "creator_01", name: "小水同学" },
  ]);

  console.log("Memory:", sqlite.exec("SELECT COUNT(*) FROM creators")[0]?.values[0][0]);

  saveToDisk();

  // Save with explicit copy
  const data = sqlite.export();
  const copy = new Uint8Array(data);
  writeFileSync("storage/flowcast-copy.db", Buffer.from(copy));

  closeDb();

  // Verify original file
  const result1 = execSync('node -e "const fs=require(\'fs\');const s=require(\'sql.js\');(async()=>{const w=fs.readFileSync(\'node_modules/sql.js/dist/sql-wasm.wasm\');const S=await s({wasmBinary:w.buffer});const b=fs.readFileSync(\'storage/flowcast.db\');const d=new S.Database(b);console.log(\'original:\',d.exec(\'SELECT COUNT(*) FROM creators\')[0].values[0][0]);d.close();})();"').toString().trim();
  console.log(result1);

  // Verify copy file
  const result2 = execSync('node -e "const fs=require(\'fs\');const s=require(\'sql.js\');(async()=>{const w=fs.readFileSync(\'node_modules/sql.js/dist/sql-wasm.wasm\');const S=await s({wasmBinary:w.buffer});const b=fs.readFileSync(\'storage/flowcast-copy.db\');const d=new S.Database(b);console.log(\'copy:\',d.exec(\'SELECT COUNT(*) FROM creators\')[0].values[0][0]);d.close();})();"').toString().trim();
  console.log(result2);
}

test().catch(console.error);
