import { NextRequest } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { getEnv } from "@/lib/server/env";
import { ensureMigrations } from "@/lib/db/migrate";
import { getDb } from "@/lib/db";
import { sourceAssets, transcripts, analyses, creators, creatorProfiles } from "@/lib/db/schema";
import { uid, json, jsonError, now, parseJsonField } from "@/lib/api-utils";
import { eq, desc } from "drizzle-orm";

async function seedMockDataIfEmpty() {
  const db = await getDb();
  const existing = await db.select().from(sourceAssets).limit(1);
  if (existing.length > 0) return;

  const creatorId = "mock-creator-1";
  await db.insert(creators).values({
    id: creatorId,
    name: "考研陪伴型学姐",
    createdAt: now(),
    updatedAt: now(),
  });
  await db.insert(creatorProfiles).values({
    id: uid(),
    creatorId,
    positioning: "用亲身经验帮助普通学生制定可执行的备考策略",
    domain: "考研 / 学习方法 / 个人成长",
    tone: JSON.stringify(["直接", "温和", "有经验感", "不制造焦虑"]),
    beliefs: JSON.stringify([
      "学习计划必须能落地，否则再完美也没有用",
      "普通学生更需要稳定执行，而不是追求极限方法",
      "真正的效率感来自可重复，而不是某一天的爆发",
      "资料不是安全感，完成一轮最小闭环才是安全感",
    ]),
    cases: JSON.stringify(["30 天复盘表", "低状态学习日", "资料过载后的最小闭环"]),
    commonPatterns: JSON.stringify(["先指出误区", "解释为什么", "给具体方法", "留下行动建议"]),
    avoidPhrases: JSON.stringify(["宝子们", "干货满满", "狠狠收藏", "逆袭上岸", "闭眼冲"]),
    titlePreference: "克制、明确，直接点出问题，不用夸张承诺",
    platformRules: JSON.stringify({
      xiaohongshu: "短段落，强场景，标题直接点出痛点，转化要轻",
      douyin: "口播节奏强，开头抓人，适合30-60秒短视频脚本",
      bilibili: "结构完整，信息密度高，适合视频简介和动态文案",
      zhihu: "结论先行，强调方法论和可信度，弱化营销感",
      x: "短句为主，观点密度高，开头抓人，口语化",
    }),
    createdAt: now(),
    updatedAt: now(),
  });

  const mockAssets = [
    {
      id: "v-20260521",
      creatorId,
      type: "video",
      title: "普通人考研最容易高估自己的执行力",
      duration: "42:18",
      status: "analyzed",
      transcript: `今天聊一个很多考研同学都会踩的坑：高估自己的执行力。\n\n我见过太多同学做计划，把一天排得满满当当：早上六点起床背单词，上午刷数学，下午专业课，晚上英语真题，睡前还要复盘。这个计划看起来特别漂亮，但问题是——它是按你最理想的状态设计的。\n\n你默认自己每天都精神很好、时间完整、没有临时任务、不会累。但备考不是在理想状态里发生的。\n\n你真正要做的不是把计划排满，而是先设计一个"最差状态也能完成"的版本。比如今天只能学90分钟，那这90分钟里最不能丢的是什么？先把它保住。\n\n我一直在强调一个观点：计划能落地，比计划看起来厉害重要得多。稳定执行优先于极限方法。`,
      analysis: {
        topic: "执行力误区与学习计划",
        summary: "很多同学不是计划做得不够漂亮，而是把一天当成理想机器来安排。真正能落地的计划，要从你最差状态也能完成的版本开始。",
        corePoints: [
          { point: "大多数人做计划时高估了自己的执行力", evidence: "按理想状态排满日程，忽略了真实世界的干扰" },
          { point: "好的计划从最差状态开始设计", evidence: "先保住最不能丢的90分钟" },
          { point: "稳定执行优先于极限方法", evidence: "可重复的节奏比某天的爆发更重要" },
        ],
        cases: ["30天复盘表", "低状态学习日"],
        quotes: ["真正能落地的计划，要从你最差状态也能完成的版本开始"],
        contentAngles: [],
        riskNotes: [],
      },
    },
    {
      id: "v-20260518",
      creatorId,
      type: "video",
      title: "为什么资料越多，越容易不开始",
      duration: "31:04",
      status: "analyzed",
      transcript: `你有没有过这种经历：想考研，先花三天搜集所有经验帖、资料包、网盘链接。搜集完觉得差不多了，但又看到一个帖子说"这几本书必看"，于是又去下载。反复几次之后，你已经花了一周在搜集资料上，但一页书都没翻开。\n\n这不是执行力的问题，这是用"搜集资料"来替代"真正开始"。\n\n资料不是安全感，完成一轮最小闭环才是安全感。你不需要把所有可能的资料都准备好再开始。你需要的是：先拿起一本最核心的书，看完第一章，做对应的题，发现哪里不会，再去针对性地找资料。`,
      analysis: {
        topic: "资料焦虑与最小闭环",
        summary: "用搜集资料替代真正开始是一种拖延行为。最小闭环比资料完备更重要。",
        corePoints: [
          { point: "搜集资料是一种合理化的拖延行为", evidence: "用搜集替代行动，获得虚假的安全感" },
          { point: "最小闭环优先于资料完备", evidence: "先完成一轮再定位缺口" },
        ],
        cases: ["三天搜集资料却一页未翻", "先看完第一章再做对应题目"],
        quotes: ["资料不是安全感，完成一轮最小闭环才是安全感"],
        contentAngles: [],
        riskNotes: [],
      },
    },
    {
      id: "v-20260513",
      creatorId: null,
      type: "video",
      title: "职场新人不要把复盘写成检讨书",
      duration: "06:47",
      status: "analyzed",
      transcript: `复盘是职场里最容易做错的一件事。很多人把复盘写成了检讨书——"我哪里做得不好，我为什么没做好，我下次一定改"。这根本不是复盘，这是自我攻击。\n\n真正的复盘只回答三个问题：第一，预期和实际之间哪里出现了偏差？第二，这个偏差的根本原因是什么——是信息不充分、判断失误、还是执行问题？第三，下一次在哪个节点可以提前发现这个偏差？\n\n复盘不是证明你有多努力，也不是承认你多失败。它是一个定位系统。`,
      analysis: {
        topic: "职场复盘方法论",
        summary: "复盘不是检讨书，而是定位系统。只需回答三个核心问题。",
        corePoints: [
          { point: "复盘不是检讨书，是定位系统", evidence: "大部分人把复盘写成了自我攻击" },
          { point: "复盘只需回答三个问题", evidence: "哪里失真、为什么失真、下次怎么提前发现" },
        ],
        cases: ["把复盘写成检讨书的常见误区"],
        quotes: ["复盘不是证明你有多努力，也不是承认你多失败。它是一个定位系统。"],
        contentAngles: [],
        riskNotes: [],
      },
    },
  ];

  for (const ma of mockAssets) {
    const { analysis, transcript, ...assetData } = ma;
    await db.insert(sourceAssets).values({
      ...assetData,
      filePath: "",
      createdAt: now() - Math.floor(Math.random() * 86400 * 7),
      updatedAt: now() - Math.floor(Math.random() * 86400 * 3),
    });
    const transcriptId = uid();
    await db.insert(transcripts).values({
      id: transcriptId,
      assetId: assetData.id,
      fullText: transcript,
      segments: "[]",
      createdAt: now(),
    });
    const analysisId = uid();
    await db.insert(analyses).values({
      id: analysisId,
      assetId: assetData.id,
      topic: analysis.topic,
      summary: analysis.summary,
      corePoints: JSON.stringify(analysis.corePoints),
      cases: JSON.stringify(analysis.cases),
      quotes: JSON.stringify(analysis.quotes),
      contentAngles: JSON.stringify(analysis.contentAngles),
      riskNotes: JSON.stringify(analysis.riskNotes),
      createdAt: now(),
    });
  }
}

export async function GET() {
  await ensureMigrations();
  await seedMockDataIfEmpty();
  const db = await getDb();
  const rows = await db.select().from(sourceAssets).orderBy(desc(sourceAssets.createdAt));

  const result = await Promise.all(
    rows.map(async (asset) => {
      const [transcript] = await db.select().from(transcripts).where(eq(transcripts.assetId, asset.id));
      const [analysis] = await db.select().from(analyses).where(eq(analyses.assetId, asset.id));
      return {
        ...asset,
        transcript: transcript
          ? { ...transcript, segments: parseJsonField(transcript.segments, []) }
          : null,
        analysis: analysis
          ? {
              ...analysis,
              corePoints: parseJsonField(analysis.corePoints, []),
              cases: parseJsonField<string[]>(analysis.cases, []),
              quotes: parseJsonField<string[]>(analysis.quotes, []),
              contentAngles: parseJsonField<string[]>(analysis.contentAngles, []),
              riskNotes: parseJsonField<string[]>(analysis.riskNotes, []),
            }
          : null,
      };
    })
  );

  return json(result);
}

export async function POST(req: NextRequest) {
  await ensureMigrations();
  const env = getEnv();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = (formData.get("type") as string) || "video";
  const title = (formData.get("title") as string) || file?.name || "未命名素材";
  const creatorId = (formData.get("creatorId") as string) || null;

  if (!file) return jsonError("缺少文件", 400);

  const buffer = Buffer.from(await file.arrayBuffer());
  const assetId = uid();
  const ext = file.name.split(".").pop() || "mp4";
  const fileName = `${assetId}.${ext}`;
  const storageDir = join(env.appStorageDir, "assets");
  await mkdir(storageDir, { recursive: true });
  const filePath = join(storageDir, fileName);
  await writeFile(filePath, buffer);

  const db = await getDb();
  const asset = {
    id: assetId,
    type,
    title,
    filePath,
    creatorId,
    status: "uploaded",
    createdAt: now(),
    updatedAt: now(),
  };

  await db.insert(sourceAssets).values(asset);
  return json(asset, 201);
}
