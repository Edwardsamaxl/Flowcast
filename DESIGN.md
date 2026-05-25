# 像我写：前端设计文档

## 0. Direction Lock

**同类产品参考**

| 产品 | 可借鉴点 | 对像我写的取舍 |
|---|---|---|
| Notion | 低装饰、强编辑感、页面像工作区而不是营销页 | 借鉴安静表面和信息组织，不复制纯白到发灰的中性系统 |
| Typefully | 围绕文字创作流建立清晰的编辑、预览、发布状态 | 借鉴创作流密度和平台切换，不使用社媒工具常见的亮色活泼感 |
| Claude Projects | 文件、上下文、输出在同一工作区里形成可信的 AI 协作感 | 借鉴上下文资产的可信呈现，不使用聊天产品式的居中对话结构 |

**Visual thesis**：克制、清醒、可校准的中文编辑工作台。主界面像一张整理好的稿桌，颜色接近冷白纸和深墨，唯一高识别色是低饱和墨蓝，用于“校准、确认、生成”这类关键动作。

**Content plan**：这是 app shell 型产品，默认进入工作状态。首页负责 orient, show status, enable action；资产库页负责沉淀声纹画像；创作页负责选择材料和平台；校准页负责编辑、反馈、学习。

**Interaction thesis**：交互不做炫技。按钮按下轻微缩放，平台切换用短促淡入，反馈标签点击后出现明确收录态，声纹画像抽屉只在需要解释“为什么这么写”时出现。

**CSS strategy**：Tailwind only。颜色、阴影、圆角写入 `tailwind.config.ts` 的静态 tokens；全局只保留字体渲染、背景色和少量 CSS variables。不要用动态拼接 class。

## 1. Visual Theme and Atmosphere

像我写不是 AI 写作营销页，也不是通用知识库。它是中文知识创作者用来把历史口播变成个人表达资产的编辑工作台。

当前设计的“怪”主要来自色彩隐喻过多：暖纸、墨色、朱砂、苔绿、印蓝同时存在，容易让产品显得像复古笔记应用或中式素材库。新方向删掉强纸感和多辅助色，保留“编辑、校准、个人表达”三个关键词。

界面气质：

- **清醒**：背景偏冷白，不泛黄，不做手账感。
- **专业**：大面积中性色承载长文本编辑，减少色块干扰。
- **可校准**：关键色只用于生成、保存、反馈、当前平台、被收录的偏好。
- **个人资产感**：资产库不是文件列表，而是“观点、语气、禁用词、案例”的结构化档案。

一句话判断：用户打开后应感觉“这是我的表达工作台”，不是“又一个 AI 文案生成器”。

## 2. Color Palette and Roles

### Palette Principle

采用冷中性浅色系统，弱化复古感。视觉重量按 70/22/8 分配：

- 70% 为 canvas/surface，负责安静和留白。
- 22% 为 ink/border/muted，负责层级和可读性。
- 8% 为 calibrate，负责操作确认和品牌记忆。

只保留一个主强调色 `calibrate`。成功、警告、危险仅在状态语义必须出现时使用，不能参与品牌装饰。

### Core Tokens

| Token | OKLCH | Role |
|---|---:|---|
| `canvas-0` | `oklch(99% 0.003 245)` | 页面主背景，接近冷白纸 |
| `canvas-50` | `oklch(97% 0.004 245)` | 主内容区背景 |
| `canvas-100` | `oklch(94% 0.006 245)` | 侧边栏、次级区域 |
| `surface-0` | `oklch(100% 0.002 245)` | 输入框、编辑器、浮层 |
| `surface-50` | `oklch(96% 0.005 245)` | 列表项、平台 tab 背景 |
| `surface-100` | `oklch(91% 0.007 245)` | hover、选中前的弱底色 |
| `ink-950` | `oklch(18% 0.018 255)` | 一级标题、关键正文 |
| `ink-800` | `oklch(28% 0.016 255)` | 正文 |
| `ink-600` | `oklch(45% 0.014 255)` | 辅助正文、标签 |
| `ink-400` | `oklch(64% 0.012 255)` | 占位符、说明文字 |
| `line-200` | `oklch(88% 0.008 245)` | 标准分隔线 |
| `line-300` | `oklch(82% 0.010 245)` | 强分隔线、输入框边界 |
| `calibrate-500` | `oklch(55% 0.115 250)` | 主 CTA、当前平台、反馈收录态 |
| `calibrate-600` | `oklch(48% 0.105 250)` | CTA hover、强确认 |
| `calibrate-50` | `oklch(94% 0.025 250)` | 选中背景、弱提示底色 |
| `amber-500` | `oklch(63% 0.115 75)` | 警告、转录处理中 |
| `green-500` | `oklch(58% 0.105 150)` | 成功、已完成 |
| `red-500` | `oklch(55% 0.125 28)` | 错误、危险操作 |

### Why This Fixes The Color Problem

旧方案的 `paper` 偏黄，`cinnabar` 偏红，`moss` 偏绿，`seal` 偏蓝，四组色相同时出现会让小型 MVP 显得杂。新方案让背景、文本、边界都向 245 到 255 度的冷中性色靠拢，主色也在同一色相附近，只通过 chroma 和 lightness 拉开层级。

### Usage Rules

- `calibrate-500` 只用于主操作、当前平台、已收录反馈、关键光标状态。
- 不要用 `calibrate` 做大面积背景，最多用于 8% 的视觉面积。
- 平台标签不使用小红书红、知乎蓝、X 黑三色模拟品牌。平台差异靠图标、文案、内容规则体现。
- 背景不加 noise 纹理。app shell 默认关闭装饰背景。
- 状态色必须带文字或图标，不能只靠颜色表达。
- 文本在彩色背景上必须使用同色系深浅，不使用泛灰文字压在彩色底上。

## 3. Typography Rules

### Typeface

品牌词：精确、克制、个人表达。

拒绝作为 display 的反射选择：Inter、Noto Serif SC、思源宋体默认大标题。

采用系统可落地字体栈：

| Role | Font Stack | Reason |
|---|---|---|
| Display / H1 | `"LXGW WenKai Screen", "Kaiti SC", "STKaiti", serif` | 少量用于品牌和关键标题，保留个人手稿感，但不进入正文 |
| UI / Body | `"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif` | 长时间编辑和中文界面阅读稳定 |
| Mono / Data | `"JetBrains Mono", "SFMono-Regular", Consolas, monospace` | 数字、时间、JSON 片段、转录状态 |

如果不引入外部字体，使用系统 fallback 即可。不要为了视觉效果引入大体积中文字体文件。

### Type Scale

| 层级 | Size | Weight | Line Height | Letter Spacing | 用途 |
|---|---:|---:|---:|---:|---|
| Display | 48px desktop, 34px mobile | 600 | 1.04 | -0.022em | 首页品牌主语 |
| H1 | 30px | 650 | 1.15 | -0.012em | 页面标题 |
| H2 | 22px | 650 | 1.25 | -0.012em | 区块标题 |
| H3 | 17px | 600 | 1.4 | 0 | 面板标题、列表标题 |
| Body L | 16px | 400 | 1.75 | 0 | 生成正文、转录正文 |
| Body | 14px | 400 | 1.6 | 0 | UI 正文 |
| Caption | 12px | 500 | 1.45 | 0 | 状态、时间、辅助说明 |
| Mono | 13px | 400 | 1.55 | 0 | 数字、短代码、JSON |

### Text Rules

- 中文正文编辑区行高最低 1.75。
- 标题使用 `text-wrap: balance`，长段落使用 `text-wrap: pretty`。
- 计数器、视频时长、生成次数使用 `tabular-nums`。
- 不在按钮、标签、导航里使用宋体或楷体。
- Display 字体只能出现在首页品牌、空状态标题、重要资产标题，不能遍地使用。

## 4. Component Stylings

### Button

统一圆角 8px，最小高度 40px，按下态 `scale(0.96)`。动画只允许 `transform`, `opacity`, `background-color`, `color`，时长 150ms，曲线 `cubic-bezier(0.16,1,0.3,1)`。

| Variant | Default | Hover | Active | 用途 |
|---|---|---|---|---|
| Primary | `bg-calibrate-500 text-white shadow-action` | `bg-calibrate-600` | `scale-96` | 生成、保存、创建资产库 |
| Secondary | `bg-surface-0 text-ink-800 shadow-ring` | `bg-surface-50` | `scale-96` | 取消、重新生成、导入 |
| Quiet | `text-ink-600` | `bg-surface-50 text-ink-950` | `scale-96` | 行内操作、图标按钮 |
| Danger | `bg-red-500 text-white` | `brightness-95` | `scale-96` | 删除资产、清空反馈 |

### Platform Segmented Control

平台切换是核心控件，不做普通 tab。

- Container: `bg-surface-50 shadow-inset rounded-lg p-1`
- Item default: `text-ink-600 rounded-md min-h-9 px-3`
- Item active: `bg-surface-0 text-calibrate-600 shadow-ring`
- Item hover: `text-ink-950`
- 切换动画：active 背景 150ms 淡入，不移动布局。

平台顺序固定：小红书、知乎、X。

### Feedback Tag

反馈标签是改稿学习闭环的标志性组件。

- Default: `bg-surface-50 text-ink-600 shadow-ring rounded-md px-3 py-1.5 text-sm`
- Hover: `bg-calibrate-50 text-calibrate-600`
- Active: `bg-calibrate-500 text-white shadow-action`
- Disabled: `opacity-45 cursor-not-allowed`
- 点击后标签文案可短暂变为“已收录”，800ms 后恢复原标签。
- 反馈组下方必须显示一句微文案：`已写入下次生成的负向约束`，只在 active 后出现。

### Card And Panels

不把所有区域都做成卡片。默认页面使用背景分层和间距。卡片只用于可点击对象或需要保存的独立资产。

| Surface | Style | 用途 |
|---|---|---|
| Flush section | 无边框、无阴影 | 页面说明、普通文本区 |
| List item | `bg-surface-0 shadow-ring rounded-lg p-4` | 视频、草稿、观点条目 |
| Editor panel | `bg-surface-0 shadow-editor rounded-xl` | 生成正文、转录原文 |
| Drawer | `bg-surface-0 shadow-float rounded-xl` | 声纹画像解释、设置 |

卡片圆角 12px，按钮圆角 8px，标签圆角 6px。不要混用 pill，除非是头像或进度点。

### Input / Textarea / Editor

- Default: `bg-surface-0 text-ink-800 shadow-ring rounded-lg`
- Focus: `ring-2 ring-calibrate-500/22 shadow-focus`
- Placeholder: `text-ink-400`
- Long editor: `leading-7 min-h-[420px] resize-none`
- 转录原文只读区使用 `bg-canvas-50`，生成稿编辑区使用 `bg-surface-0`，让用户一眼知道右侧可编辑。

### Navigation

桌面端为 248px 左侧栏。

- Sidebar background: `bg-canvas-100`
- Active item: `bg-surface-0 text-ink-950 shadow-ring`
- Inactive item: `text-ink-600`
- Hover: `bg-surface-50 text-ink-950`
- 底部验证提示只有在有任务时出现，不作为永久装饰卡。

移动端不隐藏导航，使用底部 Tab Bar：工作台、资产库、创作、草稿。每个触摸目标至少 44px。

## 5. Layout Principles

### App Shell

- Desktop: `248px sidebar + fluid main`
- Main max width: `1280px`
- Main padding: `24px`, desktop `32px`
- 页面默认不居中 hero，不放营销式双 CTA。
- 每页只有一个主任务。

### Spacing Scale

| Token | Size | 用途 |
|---|---:|---|
| `space-1` | 4px | 图标与文字 |
| `space-2` | 8px | 标签组、按钮内间距 |
| `space-3` | 12px | 列表项内部 |
| `space-4` | 16px | 表单组、紧凑区块 |
| `space-6` | 24px | 面板间距 |
| `space-8` | 32px | 页面主分区 |
| `space-12` | 48px | 首页首屏大分区 |

### Page Layouts

**工作台首页**

- 顶部：当前资产状态，已转录视频、观点数量、最近生成。
- 主区：最近草稿预览 + 下一步动作。
- 右侧或下方：固定示例对比，展示“通用 AI 味”和“像我写版本”的差异。

**声纹资产库页**

- 左列：视频资产和观点资产列表。
- 右列：声纹画像摘要，语气、句式、禁用词、平台规则。
- 右列可进入编辑模式，不默认展示一堆 textarea。

**内容创作页**

- 上方：选择视频和输出平台。
- 中段：生成设置，语气强度、平台规则、是否引用案例。
- 下方：生成按钮和预估输入来源。

**编辑与校准页**

- Desktop 两栏：左 0.9fr 为转录原文，右 1.1fr 为生成稿。
- 底部固定反馈条仅在编辑器内滚动时吸底，不遮挡正文。
- 声纹画像解释用右侧 drawer，不使用 modal 打断编辑。

## 6. Depth and Elevation

不用厚重阴影，不用玻璃拟态。浅色 app 的层级来自背景色步进、1px 内阴影和少量浮层阴影。

| Level | Token | Value | 用途 |
|---|---|---|---|
| 0 | none | none | 页面背景、普通排版区 |
| 1 | `shadow-ring` | `inset 0 0 0 1px oklch(88% 0.008 245)` | 列表项、输入框、active nav |
| 2 | `shadow-editor` | `inset 0 0 0 1px oklch(86% 0.009 245), 0 1px 2px rgba(20,31,46,0.04)` | 编辑器、主要面板 |
| 3 | `shadow-action` | `0 1px 2px rgba(20,31,46,0.10), 0 8px 24px rgba(38,91,168,0.14)` | 主按钮、确认态 |
| 4 | `shadow-float` | `0 18px 48px rgba(20,31,46,0.16), inset 0 0 0 1px rgba(20,31,46,0.08)` | drawer、popover |

相邻 surface 最少保持 4% lightness 差异。比如 sidebar `canvas-100` 与 main `canvas-50`，main 与 editor `surface-0`。

## 7. Do's and Don'ts

| Do | Don't |
|---|---|
| 用冷中性底色让长文本编辑更清醒 | 用偏黄纸色制造复古稿纸感 |
| 只用 `calibrate` 表达关键动作和学习闭环 | 同时使用红、绿、蓝作为装饰色 |
| 首页直接展示工作台状态 | 做大 hero、中心标题、两个并列 CTA |
| 声纹画像先展示摘要，再让用户编辑 | 一上来铺满 textarea |
| 平台差异靠规则和内容结构表达 | 用平台品牌色把界面染花 |
| 反馈标签点击后给“已收录”确认 | 点击后只改变一点点灰色 |
| 编辑区右侧更强，左侧原文更安静 | 左右两栏视觉权重相同 |
| 使用背景色步进和内阴影建立层级 | 每个模块都套卡片和外阴影 |
| 移动端保留底部导航 | 小屏隐藏主入口 |
| 所有 hover 使用 `[@media(hover:hover)]` guard | 让移动端 tap 后停留在 hover 态 |

## 8. Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| `<640px` | 单列，底部 Tab Bar，编辑页原文默认折叠 |
| `640px-1023px` | 单列宽面板，部分列表可双列 |
| `>=1024px` | 左侧栏展开，编辑页两栏 |
| `>=1280px` | 主内容 max width 生效，避免长行过宽 |

移动端规则：

- 底部 Tab Bar 高度 64px，页面底部留出 `pb-20`。
- 主按钮满宽，次按钮跟随在下方或使用 icon button。
- 文本编辑区最小高度 360px。
- 反馈标签允许横向滚动，不换成多行挤压编辑区。
- 所有交互目标最小 44x44px。

## 9. Agent Prompt Guide

### Color Reference

```text
canvas-0: oklch(99% 0.003 245)
canvas-50: oklch(97% 0.004 245)
canvas-100: oklch(94% 0.006 245)
surface-0: oklch(100% 0.002 245)
surface-50: oklch(96% 0.005 245)
surface-100: oklch(91% 0.007 245)
ink-950: oklch(18% 0.018 255)
ink-800: oklch(28% 0.016 255)
ink-600: oklch(45% 0.014 255)
ink-400: oklch(64% 0.012 255)
line-200: oklch(88% 0.008 245)
line-300: oklch(82% 0.010 245)
calibrate-50: oklch(94% 0.025 250)
calibrate-500: oklch(55% 0.115 250)
calibrate-600: oklch(48% 0.105 250)
amber-500: oklch(63% 0.115 75)
green-500: oklch(58% 0.105 150)
red-500: oklch(55% 0.125 28)
shadow-ring: inset 0 0 0 1px oklch(88% 0.008 245)
shadow-editor: inset 0 0 0 1px oklch(86% 0.009 245), 0 1px 2px rgba(20,31,46,0.04)
shadow-action: 0 1px 2px rgba(20,31,46,0.10), 0 8px 24px rgba(38,91,168,0.14)
shadow-float: 0 18px 48px rgba(20,31,46,0.16), inset 0 0 0 1px rgba(20,31,46,0.08)
radius-button: 8px
radius-card: 12px
radius-drawer: 16px
motion-press: scale(0.96), 150ms cubic-bezier(0.16,1,0.3,1)
```

### Prompt 1: 重做首页为工作台

```text
重写 app/page.tsx。像我写是中文知识创作者的表达资产工作台，不是营销落地页。

布局：
- 桌面端使用 app shell 主区，不做居中 hero。
- 顶部一行显示页面标题“工作台”和最近生成时间。
- 主网格 desktop 为 1.05fr 0.95fr。
- 左侧放“声纹资产状态”：已转录视频、可复用观点、禁用表达、最近反馈。数字使用 tabular-nums，标题用 UI sans 17px weight 600。
- 右侧放最近草稿预览：surface-0, radius 12px, shadow-editor, padding 24px。草稿标题 22px weight 650, 正文 16px line-height 1.75。
- 主 CTA “继续校准”使用 bg-calibrate-500 text-white radius 8px shadow-action min-height 40px。
- 页面背景 canvas-50，侧边或次要区 canvas-100。不要使用纸张纹理、渐变、朱砂红。
```

### Prompt 2: 反馈标签组件

```text
创建 components/feedback-tag.tsx。

Props: label, active, onToggle, disabled。
样式：
- Default: bg-surface-50 text-ink-600 shadow-ring rounded-md px-3 py-1.5 text-sm min-h-10
- Hover: [@media(hover:hover)]:hover:bg-calibrate-50 [@media(hover:hover)]:hover:text-calibrate-600
- Active: bg-calibrate-500 text-white shadow-action
- Disabled: opacity-45 cursor-not-allowed
- Press: active:scale-[0.96], transition-[transform,background-color,color,opacity] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]
- focus-visible: outline-none ring-2 ring-calibrate-500/25
点击 active 后在父组件下方显示“已写入下次生成的负向约束”。
```

### Prompt 3: 声纹画像展示区

```text
重构 app/library/page.tsx 的声纹画像区域。

默认只读模式：
- 外层 surface-0 radius 12px shadow-editor p-6。
- 顶部显示人设定位，H2 22px weight 650 color ink-950。
- 语气特征为标签组，bg-calibrate-50 text-calibrate-600 rounded-md px-2.5 py-1 text-xs。
- 高频观点为编号列表，编号用 mono 13px tabular-nums color ink-400，正文 color ink-800 line-height 1.6。
- 禁用表达为 surface-50 text-ink-600 rounded-md 标签，不使用红色警告样式。
- 右上角 Quiet 按钮“编辑画像”。

编辑模式：
- input/textarea 使用 surface-0 shadow-ring focus ring-calibrate-500/22。
- 底部出现保存和取消按钮。
- 切换只淡入淡出，不改变容器高度。
```

### Prompt 4: 校准编辑页

```text
重写编辑与校准页布局。

Desktop:
- 两栏 grid-template-columns: minmax(0,0.9fr) minmax(0,1.1fr), gap 24px。
- 左侧“转录原文”使用 bg-canvas-50 shadow-ring radius 12px，视觉更安静。
- 右侧“生成稿”使用 bg-surface-0 shadow-editor radius 12px，编辑权重更高。
- 右侧 textarea min-height 520px, font-size 16px, line-height 1.75。
- 底部反馈区 sticky bottom 0, bg-surface-0, border-top 1px line-200, 不遮挡正文。
- 声纹解释用右侧 drawer，不用 modal。

Mobile:
- 原文区默认折叠，生成稿优先。
- 反馈标签横向滚动，底部留 pb-20 避开 Tab Bar。
```

### Prompt 5: Tailwind Tokens

```text
更新 tailwind.config.ts。

把 DESIGN.md 的颜色写入 theme.extend.colors，使用静态 token 名：
canvas.0, canvas.50, canvas.100
surface.0, surface.50, surface.100
ink.950, ink.800, ink.600, ink.400
line.200, line.300
calibrate.50, calibrate.500, calibrate.600
amber.500, green.500, red.500

增加 boxShadow:
ring, editor, action, float

增加 borderRadius:
button: 8px, card: 12px, drawer: 16px

不要使用动态 class 拼接，不要引入渐变背景，不要添加 noise 纹理。
```
