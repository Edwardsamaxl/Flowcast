import { initDb, getSqlJsDb, saveToDisk, closeDb } from "../lib/db";
import * as schema from "../lib/db/schema";

async function seed() {
  const db = await initDb();
  const sqlite = getSqlJsDb();

  const logCount = (label: string, table: string) => {
    const r = sqlite.exec(`SELECT COUNT(*) FROM ${table}`);
    console.log(`${label} ${table}:`, r[0]?.values[0][0]);
  };

  console.log("=== Inserting creators ===");
  await db.insert(schema.creators).values([
    { id: "creator_01", name: "小水同学" },
    { id: "creator_02", name: "Russell" },
  ]);
  logCount("After", "creators");
  saveToDisk();

  console.log("=== Inserting profiles ===");
  await db.insert(schema.creatorProfiles).values([
    {
      id: "profile_01", creatorId: "creator_01", positioning: "科技测评",
      tone: "[]", beliefs: "[]", structures: "[]", avoidPhrases: "[]",
      titlePreference: "", catchphrases: "[]",
    },
  ]);
  logCount("After", "creator_profiles");
  saveToDisk();

  console.log("=== Inserting assets ===");
  await db.insert(schema.sourceAssets).values([
    { id: "asset_01", creatorId: "creator_01", type: "video", title: "iPhone 15 Pro 体验", filePath: "/a.mp4", duration: "32:15", status: "analyzed" },
  ]);
  logCount("After", "source_assets");
  saveToDisk();

  console.log("=== Inserting transcripts ===");
  await db.insert(schema.transcripts).values([
    { id: "trans_01", assetId: "asset_01", fullText: "Hello world", segments: "[]" },
  ]);
  logCount("After", "transcripts");
  saveToDisk();

  console.log("=== Inserting analyses ===");
  await db.insert(schema.analyses).values([
    { id: "analysis_01", assetId: "asset_01", topic: "iPhone", summary: "good", corePoints: "[]", cases: "[]", quotes: "[]", contentAngles: "[]", riskNotes: "[]" },
  ]);
  logCount("After", "analyses");
  saveToDisk();

  console.log("=== Inserting tasks ===");
  await db.insert(schema.rewriteTasks).values([
    { id: "task_01", assetId: "asset_01", creatorId: "creator_01", title: "分发任务", platforms: "[\"小红书\"]", status: "completed" },
  ]);
  logCount("After", "rewrite_tasks");
  saveToDisk();

  console.log("=== Inserting drafts ===");
  await db.insert(schema.generatedDrafts).values([
    { id: "draft_01", taskId: "task_01", platform: "小红书", title: "钛金属 iPhone", content: "...", notes: "[]", status: "draft" },
  ]);
  logCount("After", "generated_drafts");
  saveToDisk();

  console.log("=== Inserting feedback ===");
  await db.insert(schema.feedbackMessages).values([
    { id: "fb_01", taskId: "task_01", draftId: "draft_01", scope: "current_draft", tags: "[]", message: "开头太长了" },
  ]);
  logCount("After", "feedback_messages");
  saveToDisk();

  closeDb();
  console.log("Seed completed.");
}

seed().catch(console.error);
