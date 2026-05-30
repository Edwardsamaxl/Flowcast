import type {
  Platform,
  CreatorProfile,
  TranscriptAnalysis,
} from "./types";

export type PromptContext = {
  transcript: string;
  analysis: TranscriptAnalysis;
  platform: Platform;
  creatorProfile: CreatorProfile;
  platformRule: { ruleTemplate: string; promptOverride?: string };
  feedback?: string[];
};

export interface PromptEngine {
  buildAnalysisPrompt(transcript: string): string;
  buildProfileSuggestionPrompt(
    transcript: string,
    currentProfile?: CreatorProfile
  ): string;
  buildRewritePrompt(context: PromptContext): string;
  buildVoiceAlignedPrompt(context: PromptContext): string;
}

function buildAnalysisPrompt(transcript: string): string {
  return [
    "你是中文知识创作者的视频内容分析助手。",
    "请把下面的视频转写文本分析成严格 JSON，不要输出 Markdown。",
    "JSON 字段必须包含：topic, summary, core_points, cases, quotes, content_angles, risk_notes。",
    "core_points 每一项必须包含 point, evidence, usable_for_platforms。",
    "usable_for_platforms 是平台标识符数组（如 xiaohongshu, douyin 等），根据内容适配性填写。",
    "",
    "转写文本：",
    transcript,
  ].join("\n");
}

function buildProfileSuggestionPrompt(
  transcript: string,
  currentProfile?: CreatorProfile
): string {
  const example = {
    additions: [
      {
        dimension: "positioning",
        type: "addition",
        field: "定位",
        value: "用亲身经验帮助普通学生制定可执行备考策略的考研陪伴型学姐",
      },
      {
        dimension: "tone",
        type: "addition",
        field: "语气风格",
        value: "喜欢用反问句引发思考，语气亲和但有边界感",
      },
      {
        dimension: "beliefs",
        type: "addition",
        field: "核心观点",
        value: "长期主义比短期爆发更重要",
      },
      {
        dimension: "structures",
        type: "addition",
        field: "叙事结构",
        value: "先讲个人经历，再提炼方法，最后给行动建议",
      },
      {
        dimension: "avoid_phrases",
        type: "addition",
        field: "禁忌表达",
        value: "避免使用'绝对''肯定'等过度承诺词汇",
      },
      {
        dimension: "title_preference",
        type: "addition",
        field: "标题偏好",
        value: "克制、明确，直接点出问题，不用夸张承诺",
      },
      {
        dimension: "catchphrases",
        type: "addition",
        field: "口头禅",
        value: "说实话、讲真的",
      },
    ],
    modifications: [
      {
        dimension: "positioning",
        type: "modification",
        field: "定位",
        from: "互联网运营专家",
        to: "SaaS 增长顾问",
      },
    ],
    insights: [
      {
        content: "创作者反复强调计划要能落地，暗示其受众对执行力有焦虑",
        tags: ["受众洞察", "执行力"],
        evidence: "计划能落地，比计划看起来厉害重要得多",
      },
    ],
    evidenceSegments: ["原文片段1", "原文片段2"],
  };

  const dimensionsText = [
    "必须覆盖的分析维度（如果某维度确实无显著特征，可返回空数组，但不能省略该维度）：",
    "  - positioning（定位）：创作者在这条内容中呈现的身份/角色定位",
    "  - tone（语气风格）：说话方式、情感温度、正式/口语化程度",
    "  - beliefs（核心观点）：本条内容中最鲜明的观点或立场",
    "  - structures（叙事结构）：内容组织方式，如'痛点-方案-行动'",
    "  - avoid_phrases（禁忌表达）：创作者明显回避或批评的表达方式",
    "  - title_preference（标题偏好）：对标题风格的倾向",
    "  - catchphrases（口头禅）：标志性的口头表达或过渡词",
  ].join("\n");

  const profileContext = currentProfile
    ? `当前创作者画像（请基于此判断哪些是 additions，哪些是 modifications）：\n${JSON.stringify(
        {
          positioning: currentProfile.positioning,
          tone: currentProfile.tone,
          beliefs: currentProfile.beliefs,
          structures: currentProfile.structures,
          avoid_phrases: currentProfile.avoid_phrases,
          title_preference: currentProfile.title_preference,
          catchphrases: currentProfile.catchphrases,
          insights: currentProfile.insights.map((i) => ({
            content: i.content,
            tags: i.tags,
          })),
        },
        null,
        2
      )}`
    : "当前没有创作者画像，所有建议都放入 additions。";

  return [
    "你是中文创作者的人物表达画像分析助手。",
    "你的任务是从单条视频转写中深度分析创作者的表达特征，并提出画像更新建议。",
    "",
    dimensionsText,
    "",
    "建议分为两类：",
    "  - additions：当前画像中没有的新特征（新增）",
    "  - modifications：当前画像中已有但需要调整的特征（修改）",
    "",
    "insights：自由形式的洞察，每条包含 content（内容）、tags（标签数组）、evidence（原文证据）。",
    "",
    "硬性要求：",
    "  1. 只输出转写文本中确实有显著特征的维度，不要为凑数量输出空泛或不确定的描述。",
    "  2. 如果当前画像已存在，评估 positioning 是否需要 modifications。",
    "  3. field 必须使用中文维度名（如定位、语气风格、核心观点、叙事结构、禁忌表达、标题偏好、口头禅），禁止使用英文属性名。",
    "  4. 每个 value 必须具体、可执行。",
    "  5. evidenceSegments 必须引用原文具体片段作为证据。",
    "  6. 如果转写文本为空或乱码，返回空数组，不要编造内容。",
    "",
    `输出格式示例：${JSON.stringify(example, null, 2)}`,
    profileContext,
    "",
    "视频转写：",
    transcript,
  ].join("\n");
}

function buildRewritePrompt(context: PromptContext): string {
  const { transcript, analysis, platform, creatorProfile, platformRule, feedback } =
    context;

  const example = {
    platform,
    title: "示例标题",
    content: "示例文案内容...",
    notes: ["选择这个角度是因为...", "平台适配点：..."],
  };

  const profileJson = {
    positioning: creatorProfile.positioning,
    tone: creatorProfile.tone,
    beliefs: creatorProfile.beliefs,
    structures: creatorProfile.structures,
    avoid_phrases: creatorProfile.avoid_phrases,
    title_preference: creatorProfile.title_preference,
    catchphrases: creatorProfile.catchphrases,
    insights: creatorProfile.insights.map((i) => ({
      content: i.content,
      tags: i.tags,
    })),
  };

  const lines: string[] = [
    "你是中文知识创作者的多平台内容改写助手。",
    "请根据原始转写、内容分析、人物画像和平台规则，生成可直接编辑的发布稿。",
    "请输出严格 JSON，不要输出 Markdown。",
    "JSON 字段必须包含：platform, title, content, notes。",
    `输出格式示例：${JSON.stringify(example, null, 2)}`,
    `目标平台：${platform}`,
    `平台规则：${platformRule.ruleTemplate}`,
  ];

  if (platformRule.promptOverride) {
    lines.push(`平台规则补充：${platformRule.promptOverride}`);
  }

  lines.push(
    `创作者核心维度：${JSON.stringify(profileJson, null, 2)}`,
    `内容分析：${JSON.stringify(analysis)}`
  );

  if (feedback && feedback.length > 0) {
    lines.push("");
    lines.push("用户反馈（请在改写时优先处理以下反馈）：");
    feedback.forEach((f, i) => lines.push(`${i + 1}. ${f}`));
  }

  lines.push("", "原始转写：", transcript);

  return lines.join("\n");
}

function buildVoiceAlignedPrompt(context: PromptContext): string {
  const { transcript, analysis, platform, creatorProfile, platformRule } = context;

  const example = {
    platform,
    title: "示例标题",
    content: "示例文案内容...",
    notes: ["选择这个角度是因为..."],
    voice_alignment: {
      matched_traits: ["语气一致", "观点一致"],
      conflicts: ["案例与画像定位略有偏差"],
      suggestions: ["改用画像中的常用案例以增强一致性"],
    },
  };

  const profileJson = {
    positioning: creatorProfile.positioning,
    tone: creatorProfile.tone,
    beliefs: creatorProfile.beliefs,
    structures: creatorProfile.structures,
    avoid_phrases: creatorProfile.avoid_phrases,
    title_preference: creatorProfile.title_preference,
    catchphrases: creatorProfile.catchphrases,
    insights: creatorProfile.insights.map((i) => ({
      content: i.content,
      tags: i.tags,
    })),
  };

  const lines: string[] = [
    "你是中文知识创作者的视频内容流转助手。",
    "你的任务不是泛泛改写，而是先判断这条视频内容与所选人物画像的关系，再按目标平台写成可发布文案。",
    "请输出严格 JSON，不要输出 Markdown。",
    "JSON 字段必须包含：platform, title, content, notes, voice_alignment。",
    `输出格式示例：${JSON.stringify(example, null, 2)}`,
    "voice_alignment 必须包含：matched_traits, conflicts, suggestions（均为字符串数组）。",
    `目标平台：${platform}`,
    `平台规则：${platformRule.ruleTemplate}`,
  ];

  if (platformRule.promptOverride) {
    lines.push(`平台规则补充：${platformRule.promptOverride}`);
  }

  lines.push(
    `创作者核心维度：${JSON.stringify(profileJson, null, 2)}`,
    `内容分析：${JSON.stringify(analysis)}`,
    "",
    "原始转写：",
    transcript
  );

  return lines.join("\n");
}

export function createPromptEngine(): PromptEngine {
  return {
    buildAnalysisPrompt,
    buildProfileSuggestionPrompt,
    buildRewritePrompt,
    buildVoiceAlignedPrompt,
  };
}
