# Creator Memory System 重构文档

> 重构日期：2026-05-29
> 涉及范围：数据库 Schema、Repository 层、LLM Pipeline、API 路由

---

## 1. 重构目标

将原型的创作者画像系统升级为**可上线的创业项目级架构**，核心目标：

1. **Hermes 式记忆系统**：每个创作者维护结构化记忆（核心维度 + 开放洞察），带版本快照和可撤销机制
2. **用户级平台规则**：每个用户（及其下所有创作者）共用一套可编辑的平台规则
3. **自动/手动画像更新**：支持配置自动写入模式，全部变更自动快照
4. **Prompt 模板化**：平台规则可编辑，prompt 构建从硬编码转为数据驱动

---

## 2. 架构设计决策

### 2.1 画像维度：混合模式

| 类型 | 字段 | 说明 |
|------|------|------|
| **核心维度（封闭）** | `positioning`, `tone`, `beliefs`, `structures`, `avoid_phrases`, `title_preference`, `catchphrases` | 结构化字段，每次生成 prompt 时完整注入 |
| **其它洞察（开放）** | `creator_insights` 表 | 自由文本条目，可打标签，类似 Hermes MEMORY.md 条目 |

- `positioning` 合并了原 `domain`（定位含领域信息）
- `beliefs` 合并了原 `cases`（核心观点含案例）
- `structures` 由原 `common_patterns` 改名（叙事/论证结构）
- `catchphrases` 为新增维度

### 2.2 平台规则：用户级隔离

- 所有创作者共用同一套平台规则（绑定到 `userId`）
- 平台规则存储在 `user_platform_rules` 表，可编辑
- 生成稿件时从数据库读取，不再硬编码在代码里
- 平台标识从 TypeScript union type (`"xiaohongshu" | "douyin" | ...`) 变为 `string`，支持自定义平台

### 2.3 版本快照机制

- 每次画像写入（自动/手动/反馈精炼）触发完整 JSON 快照
- 每个创作者最多保留 **5 个版本**
- 快照包含：核心维度 + 洞察列表
- 平台规则**不进入快照**（独立管理，避免频繁编辑产生噪音）
- 资产库页面可查看历史版本列表，点击后显示当时画像，支持一键回滚

### 2.4 自动写入策略

- 流转工作台可配置 `auto` / `manual` 模式
- `auto`：分析完成后直接写入画像并创建版本快照
- `manual`：生成建议供用户逐条审查，确认后写入
- **不设重大变更判断**，全部自动写入（简化逻辑）

---

## 3. 数据模型变更

### 3.1 表结构总览

| 表名 | 状态 | 说明 |
|------|------|------|
| `users` | 新增 | 默认用户 `id='default'`，为 future auth 预留 |
| `creators` | 修改 | 新增 `user_id` 字段 |
| `creator_profiles` | 重构 | 精简字段，见下表 |
| `creator_insights` | 新增 | 开放洞察条目 |
| `profile_versions` | 新增 | 版本快照（最多 5 个） |
| `user_platform_rules` | 新增 | 用户级平台规则 |
| `source_assets` | 不变 | |
| `transcripts` | 不变 | |
| `analyses` | 不变 | |
| `rewrite_tasks` | 不变 | |
| `generated_drafts` | 不变 | |
| `feedback_messages` | 不变 | |
| `profile_suggestions` | **删除** | 建议改为临时生成，不持久化 |

### 3.2 `creator_profiles` 字段变更

```
删除字段：
  - domain          → 并入 positioning
  - cases           → 并入 beliefs
  - common_patterns → 改名为 structures
  - platform_rules  → 迁移到 user_platform_rules 表

新增字段：
  - catchphrases (JSON 数组)

保留字段：
  - positioning, tone, beliefs, structures, avoid_phrases, title_preference
```

### 3.3 `profile_versions` 快照结构

```json
{
  "profile": {
    "positioning": "...",
    "tone": ["..."],
    "beliefs": ["..."],
    "structures": ["..."],
    "avoidPhrases": ["..."],
    "titlePreference": "...",
    "catchphrases": ["..."]
  },
  "insights": [
    { "id": "...", "content": "...", "tags": ["..."], "sourceAssetId": "...", "createdAt": 123 }
  ]
}
```

---

## 4. 模块架构

### 4.1 Repository Layer (`lib/repositories/`)

| 模块 | 职责 | 关键接口 |
|------|------|----------|
| `creator-profile.ts` | 画像 CRUD + insights 管理 | `loadProfile`, `updateProfile`, `addInsight`, `removeInsight` |
| `platform-config.ts` | 用户级平台规则管理 | `loadPlatforms`, `getPlatformRule`, `updatePlatform`, `seedDefaultPlatforms` |
| `version-manager.ts` | 版本快照生命周期 | `createVersion`, `listVersions`, `restoreVersion`, `deleteOldestIfNeeded` |

### 4.2 Pipeline Layer (`lib/pipeline/`)

| 模块 | 职责 | 说明 |
|------|------|------|
| `prompt-engine.ts` | 模板化 prompt 构建 | 替换原 `prompts.ts`，注入平台规则 + 画像 + 洞察 |
| `profile-analyzer.ts` | LLM 分析素材 → 结构化建议 | 输出 `ProfileAnalysisResult`（additions + modifications + insights） |
| `profile-writer.ts` | 画像写入策略 | auto 模式直接写入并快照；manual 模式返回建议 |
| `llm.ts` | LLM 调用编排 | 调用 PromptEngine + ProfileAnalyzer，保持 `parseJsonResponse` |

### 4.3 类型变更 (`lib/pipeline/types.ts`)

```typescript
// 平台从 union type 变为 string
type Platform = string;

// CreatorProfile 精简为 7 维度 + insights
type CreatorProfile = {
  positioning: string;
  tone: string[];
  beliefs: string[];
  structures: string[];
  avoid_phrases: string[];
  title_preference: string;
  catchphrases: string[];
  insights: CreatorInsight[];
};
```

---

## 5. API 路由变更

### 5.1 新增路由

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/platforms` | GET | 列出当前用户的所有平台规则 |
| `/api/platforms` | POST | 创建/更新平台规则 |
| `/api/platforms/[id]` | GET/PUT/DELETE | 单个平台规则的 CRUD |
| `/api/creators/[id]/versions` | GET | 列出创作者的版本历史 |
| `/api/creators/[id]/versions` | POST | 手动创建快照 |
| `/api/creators/[id]/versions/[versionId]` | GET | 获取完整版本快照 |
| `/api/creators/[id]/versions/[versionId]/restore` | POST | 回滚到该版本 |

### 5.2 修改的路由

| 路由 | 变更 |
|------|------|
| `/api/creators` | 返回 profile 时包含 insights 数组 |
| `/api/creators/[id]` | 适配新 schema（无 domain/cases/platformRules） |
| `/api/creators/[id]/suggestions` | 移除 profile_suggestions 表依赖 |
| `/api/assets/[id]/analyze` | 使用 ProfileAnalyzer，加载 insights |
| `/api/tasks/[id]/generate` | 从 user_platform_rules 读取平台规则 |

### 5.3 删除的表对应的逻辑

- `profile_suggestions` 表不再使用。分析建议临时生成，用户确认后直接写入画像并创建版本。

---

## 6. 迁移说明

### 6.1 自动迁移流程

启动应用时 `ensureMigrations()` 自动执行：

1. 创建 `users` 表，插入默认用户 `id='default'`
2. `creators` 表新增 `user_id` 列，默认 `'default'`
3. `creator_profiles` 表重构：
   - 将 `domain` 数据追加到 `positioning`
   - 将 `cases` 数据合并到 `beliefs`
   - 将 `common_patterns` 改名为 `structures`
   - 将 `platform_rules` 数据迁移到 `user_platform_rules` 表
   - 新增 `catchphrases` 列（默认空数组）
4. 创建 `creator_insights`、`profile_versions`、`user_platform_rules` 表
5. 删除 `profile_suggestions` 表

### 6.2 回滚方案

迁移前会自动备份旧 `creator_profiles` 表为 `_creator_profiles_old`。如需回滚：

```sql
DROP TABLE creator_profiles;
ALTER TABLE _creator_profiles_old RENAME TO creator_profiles;
```

> 注意：回滚会丢失迁移后产生的新数据（insights、versions）。

---

## 7. 关键文件清单

### 新增文件

```
lib/repositories/creator-profile.ts
lib/repositories/platform-config.ts
lib/repositories/version-manager.ts
lib/pipeline/prompt-engine.ts
lib/pipeline/profile-analyzer.ts
lib/pipeline/profile-writer.ts
app/api/platforms/route.ts
app/api/platforms/[id]/route.ts
app/api/creators/[id]/versions/route.ts
app/api/creators/[id]/versions/[versionId]/route.ts
app/api/creators/[id]/versions/[versionId]/restore/route.ts
```

### 修改文件

```
lib/db/schema.ts
lib/db/migrate.ts
lib/pipeline/types.ts
lib/pipeline/llm.ts
lib/pipeline/prompts.ts（标记废弃，转发到 prompt-engine）
scripts/seed.ts
app/api/creators/route.ts
app/api/creators/[id]/route.ts
app/api/creators/[id]/suggestions/route.ts
app/api/assets/[id]/analyze/route.ts
app/api/tasks/[id]/generate/route.ts
```

### 删除的表（由迁移脚本处理）

```
profile_suggestions
```

---

## 8. 验证状态

- `npx tsc --noEmit` 通过，无新增类型错误
- 新文件与现有路由风格一致
- 迁移脚本幂等（可重复执行）

---

## 9. 待办 / 后续工作

| 优先级 | 工作 | 说明 |
|--------|------|------|
| P1 | 资产库版本历史 UI | 在 `app/library/page.tsx` 添加版本列表 + 回滚按钮 |
| P1 | 平台规则编辑 UI | 平台 prompt 的可视化编辑页面 |
| P2 | 用户认证 | 当前只有默认用户 `id='default'`，需接入登录系统 |
| P2 | 洞察管理 UI | 增删改查开放洞察的前端界面 |
| P3 | Prompt A/B 测试 | 利用 `promptOverride` 字段做平台 prompt 实验 |

---

## 10. 设计取舍记录

| 决策 | 选择 | 理由 |
|------|------|------|
| 版本快照存完整 JSON 而非 diff | 完整 JSON | SQLite 文件存储，5 个快照约 15KB/创作者，可忽略。diff 实现复杂且容易出错 |
| 平台规则不进入快照 | 不进入 | 平台规则可能频繁编辑，进快照会产生大量噪音版本 |
| 不设重大变更判断 | 不设 | 简化逻辑，全部自动写入。回滚机制提供安全保障 |
| 删除 `profile_suggestions` 表 | 删除 | 建议改为临时数据，减少一张表和相应维护成本 |
| `Platform` 从 union 变为 `string` | `string` | 支持用户自定义平台，不再受限于代码里的 5 个平台 |
