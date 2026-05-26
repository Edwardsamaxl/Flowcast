# 流转：视频转文字与文本分析技术方案

## 1. 目标

本阶段要实现的不是单点的“视频转文字”，而是一条可沉淀人物表达资产的内容处理链路：

```text
上传视频
  -> 提取音频
  -> 音频转写
  -> 转写文本清洗
  -> 内容结构化分析
  -> 人物画像更新建议
  -> 平台改写
  -> 对话反馈
  -> 可选写回人物画像
```

MVP 先支持单用户、单人物画像，但数据结构和接口按多人物预留。

## 2. 当前工程基础

当前项目是：

- Next.js 16
- React 18
- TypeScript
- Tailwind CSS
- 本地静态 mock 数据

建议继续沿用 Next.js 作为 Web + API 后端入口。第一阶段不单独拆 Python/FastAPI 服务，避免架构过早变重。

## 3. 推荐技术栈

### Web 与 API

- `Next.js App Router`
- Server Actions 或 Route Handlers 处理业务请求
- `fetch` 直接调用 DeepSeek 兼容 OpenAI 的 Chat Completions API

### 数据库

建议用 PostgreSQL。

MVP 可选两种路线：

1. 本地快速实现：先用 JSON 文件或内存 mock，把链路跑通。
2. 正式实现：接 PostgreSQL + Prisma。

我建议直接上 PostgreSQL + Prisma，因为历史任务、反馈、画像版本都天然需要持久化。

### 文件存储

开发期：

- 本地目录：`storage/uploads`
- 音频临时目录：`storage/audio`

线上：

- Cloudflare R2 / S3 / Supabase Storage 三选一

MVP 可以先本地存储，数据库只记录文件路径和状态。

### 音视频处理

- `ffmpeg`

用途：

- 从视频中提取音频
- 压缩音频
- 长视频切片

Windows 本地需要安装 `ffmpeg` 并保证命令行可访问：

```powershell
ffmpeg -version
```

### 转写 ASR

你目前只有 DeepSeek 文本生成模型 API key。DeepSeek 适合后面的文本分析、人物画像提取和平台改写，但它不负责音频转写。

视频转文字还需要一个 ASR 方案：

| 方案 | 适合阶段 | 说明 |
|---|---|---|
| OpenAI `gpt-4o-mini-transcribe` / `gpt-4o-transcribe` | 推荐 MVP | 接入简单，中文转写质量稳定 |
| OpenAI `gpt-4o-transcribe-diarize` | 多人对话 | 需要说话人区分时使用 |
| Whisper 本地模型 | 成本敏感 / 私有化 | 需要本地算力和 Python 环境 |
| 阿里云 / 火山 / 腾讯 ASR | 国内部署 | 账号和 SDK 配置更复杂 |

建议 MVP 用云端 ASR，后续再替换或增加供应商适配层。

### 异步任务

MVP 第一版可以先做单机任务状态，不马上引入队列。

当上传视频和长视频转写开始变慢后，再加：

- `BullMQ + Redis`，或
- `Inngest`，或
- `Trigger.dev`

任务状态先按统一枚举设计，后面迁移队列成本低。

## 4. 核心数据对象

```text
SourceVideo
- id
- title
- original_file_name
- file_path
- audio_path
- duration_seconds
- status
- error_message
- created_at
- updated_at

VideoTranscript
- id
- source_video_id
- raw_text
- segments_json
- analysis_json
- status
- created_at
- updated_at

Persona
- id
- name
- description
- created_at
- updated_at

VoiceProfile
- id
- persona_id
- positioning
- domain
- tone_json
- beliefs_json
- cases_json
- common_patterns_json
- avoid_phrases_json
- title_preference
- platform_rules_json
- version
- created_at
- updated_at

RewriteTask
- id
- source_video_id
- persona_id
- selected_platforms_json
- deposit_to_profile
- status
- created_at
- updated_at

GeneratedDraft
- id
- rewrite_task_id
- platform
- title
- content
- notes_json
- version
- created_at
- updated_at

FeedbackMessage
- id
- rewrite_task_id
- generated_draft_id
- message
- tags_json
- scope
- write_back_to_profile
- created_at
```

## 5. 任务状态

```text
uploaded
extracting_audio
transcribing
analyzing
ready
generating
completed
failed
```

页面展示建议：

- 资产库：展示 `SourceVideo.status` 和是否已写入画像。
- 拆解内容：展示转写、分析、生成三个阶段。
- 历史：展示 `RewriteTask.status`、平台、反馈状态。

## 6. 文本分析输出结构

转写完成后，先让模型把内容结构化，不要直接改写。

```json
{
  "topic": "这条视频的主题",
  "summary": "简短摘要",
  "core_points": [
    {
      "point": "核心观点",
      "evidence": "来自原文的依据",
      "usable_for_platforms": ["xiaohongshu", "zhihu", "x"]
    }
  ],
  "cases": [],
  "quotes": [],
  "content_angles": [],
  "risk_notes": []
}
```

## 7. 人物画像更新策略

不要让模型自动覆盖人物画像。模型只能生成“更新建议”，用户确认后再写入。

```json
{
  "positioning_suggestions": [],
  "tone_suggestions": [],
  "belief_suggestions": [],
  "case_suggestions": [],
  "common_pattern_suggestions": [],
  "avoid_phrase_suggestions": [],
  "evidence_segments": []
}
```

默认策略：

- 资产库上传视频：只生成画像更新建议，用户确认后写入。
- 拆解内容上传视频：默认不沉淀到人物画像。
- 用户反馈：默认只影响当前稿件，手动选择后才写回画像。

## 8. 平台改写输入

平台改写时输入四类上下文：

1. 转写分析结果
2. 原始转写片段
3. 当前人物画像
4. 平台规则

输出统一结构：

```json
{
  "platform": "xiaohongshu",
  "title": "标题",
  "content": "正文",
  "notes": [
    "本稿保留了哪些观点",
    "做了哪些平台化处理",
    "哪些地方可能需要用户确认"
  ]
}
```

## 9. API 设计

第一阶段 Route Handlers：

```text
POST /api/videos/upload
POST /api/videos/:id/process
GET  /api/videos/:id/status

POST /api/transcripts/:id/analyze

POST /api/personas/:id/profile/suggestions
POST /api/personas/:id/profile/apply

POST /api/rewrite-tasks
POST /api/rewrite-tasks/:id/generate

POST /api/drafts/:id/feedback
```

MVP 可以先把 `process` 做成同步触发、异步更新状态；后面再接 BullMQ。

## 10. DeepSeek 接入

DeepSeek 提供 OpenAI 兼容接口，文本生成可以封装成一个内部客户端：

```text
DEEPSEEK_API_KEY
DEEPSEEK_BASE_URL
DEEPSEEK_MODEL
```

建议默认：

```text
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

如果后续要做复杂推理，可以单独加：

```text
DEEPSEEK_REASONER_MODEL=deepseek-reasoner
```

## 11. 需要你配置的内容

`.env.local` 至少需要：

```env
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

APP_STORAGE_DIR=./storage
MAX_UPLOAD_MB=500
```

如果使用 OpenAI 做转写，再加：

```env
OPENAI_API_KEY=
OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
```

如果直接上 PostgreSQL + Prisma，再加：

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/flowcast?schema=public
```

## 12. 本地依赖

必须：

- Node.js 20+
- npm
- ffmpeg

建议：

- PostgreSQL 16+

后续需要安装的 npm 包：

```powershell
npm install prisma @prisma/client
npm install -D tsx
```

如果上队列：

```powershell
npm install bullmq ioredis
```

MVP 第一批实现先不引入队列。

## 13. 实现顺序

1. 新增 `.env.example` 和服务端环境读取。
2. 新增 DeepSeek 文本生成客户端。
3. 新增 pipeline 类型、平台规则、结构化输出 schema。
4. 接入数据库模型。
5. 实现视频上传和本地存储。
6. 用 ffmpeg 提取音频。
7. 接 ASR 转写。
8. 用 DeepSeek 做转写分析。
9. 生成人物画像更新建议。
10. 生成平台稿件。
11. 实现反馈改稿和可选写回画像。

## 14. 当前技术决策

- DeepSeek 用于文本分析、人物画像、平台改写。
- ASR 需要额外服务，建议优先 OpenAI 云端转写。
- MVP 默认不自动污染人物画像。
- 技术上先单体 Next.js，等长任务稳定后再拆队列。
- 画像更新必须有用户确认，不做自动覆盖。
