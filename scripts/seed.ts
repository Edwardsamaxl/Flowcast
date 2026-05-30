import { initDb, closeDb, saveToDisk } from "../lib/db";
import * as schema from "../lib/db/schema";

async function seed() {
  const db = await initDb();

  // ---- Default User ----
  await db.insert(schema.users).values([
    { id: "default", createdAt: Math.floor(Date.now() / 1000), updatedAt: Math.floor(Date.now() / 1000) },
  ]);

  // ---- Creators ----
  const c1 = "creator_01";
  const c2 = "creator_02";

  await db.insert(schema.creators).values([
    { id: c1, userId: "default", name: "小水同学" },
    { id: c2, userId: "default", name: "Russell" },
  ]);

  // ---- Creator Profiles ----
  // positioning now includes domain. beliefs now includes cases.
  await db.insert(schema.creatorProfiles).values([
    {
      id: "profile_01",
      creatorId: c1,
      positioning: "科技产品测评博主，擅长用生活化语言拆解复杂技术 / 数码科技 / 消费电子",
      tone: JSON.stringify(["专业但不晦涩", "幽默自嘲", "接地气"]),
      beliefs: JSON.stringify([
        "好产品值得被看见",
        "消费者有知情权",
        "参数之外是体验",
        "iPhone 15 Pro 深度测评：钛金属到底轻了多少",
        "小米 SU7 试驾：20 万级电车的新卷王",
        "AirPods Pro 2 三年后还值不值得买",
      ]),
      structures: JSON.stringify([
        "痛点开场 → 参数对比 → 真实体验 → 购买建议",
        "反常识结论 + 数据支撑",
      ]),
      avoidPhrases: JSON.stringify(["绝对最好", "碾压", "吊打", "智商税"]),
      titlePreference: "悬念式 + 数字对比，例如「XX 天后，我发现……」",
      catchphrases: JSON.stringify(["先说结论", "不吹不黑"]),
    },
    {
      id: "profile_02",
      creatorId: c2,
      positioning: "独立开发者 / AI 工具猎手，分享效率工作流 / AI / 开发者工具 / 效率软件",
      tone: JSON.stringify(["冷静理性", "极简主义", "实操导向"]),
      beliefs: JSON.stringify([
        "工具应该隐形",
        "自动化一切重复劳动",
        "Less is more",
        "我用 Claude 3 搭建了一个自动写周报的系统",
        "Notion + Make 自动化：从 2 小时到 5 分钟",
        "为什么我从 VS Code 换成了 Cursor",
      ]),
      structures: JSON.stringify([
        "问题定义 → 方案对比 → 实操演示 → 模板分享",
        "截图为主，文字为辅",
      ]),
      avoidPhrases: JSON.stringify(["颠覆", "革命性", "未来已来", "全网首发"]),
      titlePreference: "直接陈述收益，例如「如何用 XX 节省 YY 时间」",
      catchphrases: JSON.stringify(["直接说结论", "上数据"]),
    },
  ]);

  // ---- Creator Insights ----
  await db.insert(schema.creatorInsights).values([
    {
      id: "insight_01",
      creatorId: c1,
      content: "特别喜欢用实际产品握持感受作为开场切入点",
      tags: JSON.stringify(["开场", "结构"]),
      sourceAssetId: "asset_01",
    },
    {
      id: "insight_02",
      creatorId: c1,
      content: "厌恶一切带有攻击性的竞品对比措辞，即使是事实",
      tags: JSON.stringify(["禁忌", "语气"]),
      sourceAssetId: null,
    },
    {
      id: "insight_03",
      creatorId: c2,
      content: "习惯在视频结尾放一个可复制的配置链接或模板",
      tags: JSON.stringify(["结尾", "互动"]),
      sourceAssetId: "asset_02",
    },
  ]);

  // ---- User Platform Rules ----
  await db.insert(schema.userPlatformRules).values([
    {
      id: "rule_xhs",
      userId: "default",
      platformKey: "xiaohongshu",
      ruleTemplate: "短段落，强场景，标题直接点出痛点，转化要轻，不使用夸张承诺。",
      promptOverride: "",
      isActive: 1,
      sortOrder: 0,
    },
    {
      id: "rule_douyin",
      userId: "default",
      platformKey: "douyin",
      ruleTemplate: "口播节奏强，开头抓人，适合30-60秒短视频脚本，口语化，有互动感。",
      promptOverride: "",
      isActive: 1,
      sortOrder: 1,
    },
    {
      id: "rule_bilibili",
      userId: "default",
      platformKey: "bilibili",
      ruleTemplate: "结构完整，信息密度高，适合长视频简介和动态文案，允许适度玩梗。",
      promptOverride: "",
      isActive: 1,
      sortOrder: 2,
    },
    {
      id: "rule_zhihu",
      userId: "default",
      platformKey: "zhihu",
      ruleTemplate: "结论先行，结构完整，强调方法论和可信判断，弱化营销感。",
      promptOverride: "",
      isActive: 1,
      sortOrder: 3,
    },
    {
      id: "rule_x",
      userId: "default",
      platformKey: "x",
      ruleTemplate: "短句为主，观点密度高，开头抓人，口语化，适合连续观点输出。",
      promptOverride: "",
      isActive: 1,
      sortOrder: 4,
    },
    // Custom platforms from old seed data
    {
      id: "rule_gzh",
      userId: "default",
      platformKey: "公众号",
      ruleTemplate: "段落短，多用小标题",
      promptOverride: "",
      isActive: 1,
      sortOrder: 5,
    },
    {
      id: "rule_jike",
      userId: "default",
      platformKey: "即刻",
      ruleTemplate: "短段落，多用列表",
      promptOverride: "",
      isActive: 1,
      sortOrder: 6,
    },
    {
      id: "rule_twitter",
      userId: "default",
      platformKey: "Twitter",
      ruleTemplate: "一条一个观点，配图三张",
      promptOverride: "",
      isActive: 1,
      sortOrder: 7,
    },
  ]);

  // ---- Source Assets ----
  const a1 = "asset_01";
  const a2 = "asset_02";
  const a3 = "asset_03";

  await db.insert(schema.sourceAssets).values([
    {
      id: a1,
      creatorId: c1,
      type: "video",
      title: "iPhone 15 Pro 三个月真实体验",
      filePath: "/storage/assets/iphone15pro.mp4",
      duration: "32:15",
      status: "analyzed",
    },
    {
      id: a2,
      creatorId: c2,
      type: "audio",
      title: "独立开发者播客第 12 期：AI 编程工具横评",
      filePath: "/storage/assets/podcast_ep12.mp3",
      duration: "58:42",
      status: "analyzed",
    },
    {
      id: a3,
      creatorId: c1,
      type: "text",
      title: "小红书爆款笔记拆解：3C 类",
      filePath: "/storage/assets/xhs_3c_notes.md",
      duration: "",
      status: "analyzed",
    },
  ]);

  // ---- Transcripts ----
  await db.insert(schema.transcripts).values([
    {
      id: "trans_01",
      assetId: a1,
      fullText:
        "大家好，我是小水。这期视频我们聊 iPhone 15 Pro 三个月后的真实体验。先说结论：钛金属确实轻了，但代价是更容易沾指纹。拍照方面，5 倍长焦在光线好的时候很惊艳，但夜景表现不如预期。续航大概比 14 Pro 多了一个小时，但这可能是 iOS 17.1 的功劳。充电速度依然没有变化，27W 峰值坚持不了多久。",
      segments: JSON.stringify([
        { start: 0, end: 15, text: "开场 + 结论预告" },
        { start: 15, end: 120, text: "钛金属手感和重量对比" },
        { start: 120, end: 280, text: "拍照详细测试" },
        { start: 280, end: 420, text: "续航和充电" },
      ]),
    },
    {
      id: "trans_02",
      assetId: a2,
      fullText:
        "这期播客我们聊 AI 编程工具。我过去一个月深度使用了 Cursor、GitHub Copilot 和 Codeium。Cursor 的优势是上下文理解，特别是当你打开整个项目时，它能跨文件推理。Copilot 还是老问题：单行补强强，但架构层面帮不上忙。Codeium 免费版已经够用，但企业级功能缺失。",
      segments: JSON.stringify([
        { start: 0, end: 30, text: "开场 + 工具清单" },
        { start: 30, end: 180, text: "Cursor 深度体验" },
        { start: 180, end: 300, text: "Copilot 现状" },
        { start: 300, end: 420, text: "Codeium 和总结" },
      ]),
    },
    {
      id: "trans_03",
      assetId: a3,
      fullText:
        "3C 类小红书爆款笔记的几个共性：1. 封面必须有人物手持产品，表情夸张或专注。2. 标题公式：痛点 + 数字 + 结果。例如「花了 3 万买错 3 台手机后，我总结了这 5 条避坑指南」。3. 正文前 50 字必须出现「真的」「实测」「不吹不黑」等信任词。4. 评论区自己先留一条质疑，再用小号回复解释。",
      segments: JSON.stringify([
        { start: 0, end: 100, text: "封面公式" },
        { start: 100, end: 200, text: "标题公式" },
        { start: 200, end: 300, text: "正文结构和信任词" },
        { start: 300, end: 400, text: "评论区运营技巧" },
      ]),
    },
  ]);

  // ---- Analyses ----
  await db.insert(schema.analyses).values([
    {
      id: "analysis_01",
      assetId: a1,
      topic: "iPhone 15 Pro 长期体验报告",
      summary:
        "小水同学以「先说结论」的结构，从钛金属手感、拍照、续航三个维度给出了 3 个月后的真实判断。整体 tone 偏理性，但保留了个人情感（「不如预期」）。",
      corePoints: JSON.stringify([
        "钛金属减重明显，但沾指纹问题被低估",
        "5 倍长焦日间优秀，夜景拉胯",
        "续航提升可能来自系统优化而非电池",
        "充电速度没有进步",
      ]),
      cases: JSON.stringify([
        { scenario: "用户纠结是否升级", insight: "14 Pro 用户可以不急，13 及更早值得换" },
        { scenario: "摄影爱好者", insight: "长焦需求高的话建议等下一代" },
      ]),
      quotes: JSON.stringify([
        "钛金属确实轻了，但代价是更容易沾指纹",
        "5 倍长焦在光线好的时候很惊艳",
      ]),
      contentAngles: JSON.stringify([
        "从「参数党」到「体验派」的转变",
        "长期主义视角：三个月后还香吗",
        "对比向：同价位安卓旗舰怎么选",
      ]),
      riskNotes: JSON.stringify([
        "避免被苹果粉丝攻击：需强调这是个人体验",
        "续航数据需注明测试环境",
      ]),
    },
    {
      id: "analysis_02",
      assetId: a2,
      topic: "AI 编程工具横评",
      summary:
        "Russell 从独立开发者视角对比了三款主流 AI 编程工具，核心判断是 Cursor 在项目级上下文理解上领先，Copilot 适合单文件快速补全，Codeium 是免费最优解。",
      corePoints: JSON.stringify([
        "Cursor 跨文件推理能力最强",
        "Copilot 架构层面帮助有限",
        "Codeium 免费版够用，企业功能弱",
      ]),
      cases: JSON.stringify([
        { scenario: "全栈项目开发", insight: "Cursor 的 @file 和 @folder 指令大幅提升效率" },
        { scenario: "快速脚本编写", insight: "Copilot 单行补全仍然最快" },
      ]),
      quotes: JSON.stringify([
        "Cursor 的优势是上下文理解，特别是当你打开整个项目时",
        "Copilot 还是老问题：单行补强强，但架构层面帮不上忙",
      ]),
      contentAngles: JSON.stringify([
        "实测对比：同一个功能用三个工具各写一遍",
        "工作流整合：从需求到代码的端到端自动化",
        "成本分析：免费 vs 付费的真实 ROI",
      ]),
      riskNotes: JSON.stringify([
        "Copilot 是微软产品，批评需客观有数据",
        "AI 工具迭代快，结论有效期可能只有 3 个月",
      ]),
    },
    {
      id: "analysis_03",
      assetId: a3,
      topic: "3C 类小红书爆款笔记结构拆解",
      summary:
        "文档系统拆解了 3C 类小红书爆款的 4 个关键要素：封面人物化、标题公式化、正文信任词前置、评论区主动运营。",
      corePoints: JSON.stringify([
        "封面 = 人物 + 产品 + 夸张表情",
        "标题 = 痛点 + 数字 + 结果",
        "前 50 字必须植入信任词",
        "评论区需要「自导自演」",
      ]),
      cases: JSON.stringify([
        { scenario: "新账号冷启动", insight: "前 5 篇必须严格按公式执行" },
        { scenario: "老账号转型", insight: "逐步替换封面风格，不要突然变脸" },
      ]),
      quotes: JSON.stringify([
        "花了 3 万买错 3 台手机后，我总结了这 5 条避坑指南",
        "正文前 50 字必须出现「真的」「实测」「不吹不黑」",
      ]),
      contentAngles: JSON.stringify([
        "反套路：为什么你越真诚反而越不火",
        "平台算法视角：什么样的笔记会被推流",
        "系列化：从单篇爆款到持续涨粉的模板",
      ]),
      riskNotes: JSON.stringify([
        "评论区运营技巧不宜公开传播，可能触发平台治理",
        "信任词过度使用会导致内容同质化",
      ]),
    },
  ]);

  // ---- Rewrite Tasks ----
  const t1 = "task_01";
  const t2 = "task_02";

  await db.insert(schema.rewriteTasks).values([
    {
      id: t1,
      assetId: a1,
      creatorId: c1,
      title: "iPhone 15 Pro 深度体验 → 多平台分发",
      platforms: JSON.stringify(["xiaohongshu", "公众号", "微博"]),
      status: "completed",
    },
    {
      id: t2,
      assetId: a2,
      creatorId: c2,
      title: "AI 编程工具横评 → 即刻 + 公众号",
      platforms: JSON.stringify(["即刻", "公众号"]),
      status: "completed",
    },
  ]);

  // ---- Generated Drafts ----
  await db.insert(schema.generatedDrafts).values([
    {
      id: "draft_01",
      taskId: t1,
      platform: "xiaohongshu",
      title: "钛金属 iPhone 用了 90 天，我后悔了",
      content:
        "后悔没早买？不，后悔高估了它。\n\n📱 先说大家最关心的：\n轻了 19g，但指纹收集器实锤\n5 倍长焦白天封神，夜景翻车\n续航多 1h，功劳可能是系统而非电池\n\n💡 购买建议：\n14 Pro 用户 → 可以等等\n13 及更早 → 值得升级\n摄影党 → 建议等 16\n\n#iPhone15Pro #数码测评 #手机摄影",
      notes: JSON.stringify(["封面建议：手持手机做无奈表情", "评论区预埋：「安卓党不服」"]),
      voiceAlignment: JSON.stringify({ score: 92, notes: "保持了小水「先抑后扬」的 tone" }),
      status: "draft",
    },
    {
      id: "draft_02",
      taskId: t1,
      platform: "公众号",
      title: "iPhone 15 Pro 三个月长测：钛金属的甜蜜与代价",
      content:
        "九月份发布会上的那句『航空级钛金属』，让我第一时间下单。三个月后，我想聊聊那些发布会不会告诉你的事。\n\n一、重量：轻了，但代价是什么\n...（长文排版）\n\n二、拍照：5 倍长焦的双面人生\n...\n\n三、续航与充电：有进步，但别期待奇迹\n...\n\n结语：\n如果你问我 15 Pro 值不值得买，我的答案是——取决于你现在的手机。",
      notes: JSON.stringify(["插入三张实拍对比图", "文末放购买链接"]),
      voiceAlignment: JSON.stringify({ score: 88, notes: "公众号版 tone 更沉稳，去掉了口语化感叹词" }),
      status: "draft",
    },
    {
      id: "draft_03",
      taskId: t2,
      platform: "即刻",
      title: "Cursor vs Copilot vs Codeium：一个月实测结论",
      content:
        "直接说结论：\n\n• 做全栈项目 → Cursor（上下文理解碾压）\n• 写脚本/单文件 → Copilot（补全最快）\n• 预算为零 → Codeium（免费版够用）\n\n详细对比见公众号长文，这里只列一个细节：Cursor 的 @folder 指令让我在重构时少写了 40% 的样板代码。\n\n附：我的 .cursorrules 配置截图",
      notes: JSON.stringify(["配图：三张工具界面对比", "评论区回复配置获取方式"]),
      voiceAlignment: JSON.stringify({ score: 95, notes: "极简列表 + 具体数字，完美匹配 Russell 风格" }),
      status: "draft",
    },
  ]);

  // ---- Feedback Messages ----
  await db.insert(schema.feedbackMessages).values([
    {
      id: "fb_01",
      taskId: t1,
      draftId: "draft_01",
      scope: "current_draft",
      tags: JSON.stringify(["tone", "平台适配"]),
      message: "小红书版开头太长了，前 30 字必须出现「后悔」或「踩坑」",
    },
    {
      id: "fb_02",
      taskId: t2,
      draftId: "draft_03",
      scope: "current_draft",
      tags: JSON.stringify(["信息密度"]),
      message: "即刻版可以加一个具体数字：比如「节省 2.3 小时/周」",
    },
  ]);

  saveToDisk();
  closeDb();
  console.log("Seed completed.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
