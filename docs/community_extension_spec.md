# AIPlugin4 社区扩展制作与发布规范 (Community Extension Specification)

本规范为第三方创作者（包括开发者、骰主与跑团爱好者）提供制作、打包与发布民间 Tool（工具）、Skill（技能）、Character（角色人设）以及 Knowledge（知识库）的完整标准。

---

## 1. 扩展包结构标准 (`.aipk` / `.zip`)

为了让插件商店能够展示封面、README 文档并一键打包，所有扩展建议以标准 ZIP 格式压缩，并支持将后缀命名为 `.aipk`（AIPlugin Package）或 `.zip`：

```text
my-cool-extension.zip (或 .aipk)
├── manifest.json         # [必选] 核心元数据、分类标签与依赖声明
├── README.md             # [必选] 商店详情说明文档（支持标准 Markdown）
├── icon.png              # [必选] 商店图标（建议 1:1 正方形，128x128）
├── preview.png           # [可选] 效果截图或预览图
│
├── tools/                # [可选] 自定义工具代码目录
│   └── weather.ts        # 工具实现源码（.ts 或 .js）
│
├── skills/               # [可选] 提示词技能目录
│   └── combat_guide.md   # 标准 SKILL.md 格式
│
├── characters/           # [可选] 角色人设定义
│   └── assistant.json    # 人设提示词配置
│
└── knowledge/            # [可选] 知识库切片资料
    └── rules.txt         # 纯文本/Markdown 切片资料
```

---

## 2. 元数据标准：`manifest.json`

`manifest.json` 是商店呈现卡片标签、进行依赖校验、AI 审查和管理员审核的根本依据：

```json
{
  "id": "community.weather-pro",
  "name": "实时天气与灾害预警",
  "version": "1.1.0",
  "author": "创作者昵称",
  "description": "通过全球气象接口查询实时天气、温度及暴雨等灾害预警",
  "category": "实用工具",
  "contains": ["tool", "skill"],

  "tags": {
    "network": true,                // 是否发起外部网络 HTTP 请求
    "requiresHttpExt": true,        // 是否依赖海豹的 http 扩展插件
    "requiresMcp": false,           // 是否需要外挂 MCP 服务器
    "sensitive": false,             // 是否包含高危敏感操作（踢人/封禁/资产/群设置）
    "platforms": ["qq", "milky"]    // 适用平台（留空为全平台适用）
  },

  "dependencies": {
    "sealdice": ">=1.4.6",
    "httpPlugin": "http依赖插件 v1.2+（若发送网络请求需要）",
    "mcp": {
      "name": "Local-Weather-MCP",
      "downloadUrl": "https://github.com/example/weather-mcp/releases",
      "setupGuide": "1. 下载二进制并在本地运行；2. 监听 8080 端口；3. 在商店配置中启用 MCP 连接"
    }
  },

  "audit": {
    "status": "pending",           // 'pending' | 'approved' | 'rejected'
    "riskLevel": "low",             // 'low' | 'medium' | 'high'
    "note": "预留给管理员或 AI 审查系统回填"
  }
}
```

---

## 3. 民间 Tool（工具）编写规范

AIPlugin4 不对民间代码做人为功能阉割。你拥有极大的代码自由度，但必须面向 **SealDice 运行环境** 编写。

### 3.1 标准模块导出格式（推荐）
每个工具文件需 `export default` 一个符合规范的工具描述对象：

```typescript
// tools/weather.ts
export default {
  // 工具全局唯一标识（建议全英文下划线，避免与内置工具冲突）
  name: "custom_get_weather",
  
  // 工具功能说明（模型据此判断何时调用）
  description: "根据城市名查询该地区的实时天气与温度",
  
  // JSON Schema 格式的参数说明
  parameters: {
    type: "object",
    properties: {
      city: {
        type: "string",
        description: "待查询的城市或地区名称，如：北京、广州、东京"
      }
    },
    required: ["city"]
  },

  // 场景限制：'any' (任意场景) | 'user' (仅私聊) | 'group' (仅群聊)
  sessionType: "any",
  
  // 是否为敏感操作（如群管、删库等），敏感工具调用会被高亮审计
  sensitive: false,

  // 核心执行逻辑
  async solve(ctx, msg, session, args) {
    const { city } = args;
    try {
      // 在海豹环境下可直接使用 fetch（1.4.6+ 或安装了 http 依赖）
      const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=3`);
      const result = await response.text();
      return `【天气报告】${result.trim()}`;
    } catch (err) {
      // 抛出异常将被诊断层自动捕获并格式化来源定位
      throw new Error(`请求天气 API 失败: ${err.message}`);
    }
  }
};
```

### 3.2 运行时可用环境与 API 指南
在 `solve(ctx, msg, session, args)` 执行时，你可以访问以下上下文：

| 对象 | 类型 | 说明与常见用法 |
| :--- | :--- | :--- |
| `ctx` | `seal.MsgContext` | 海豹原生消息上下文。<br>• `ctx.player.userId`：发送者用户 ID<br>• `ctx.group.groupId`：群号（群聊时）<br>• `ctx.privilege`：权限级别 |
| `msg` | `seal.Message` | 原始消息实体，包含文本、CQ 码、时间戳等 |
| `session` | `Session` | 当前 AI 会话实例，可访问当前活跃状态、上下文队列等 |
| `args` | `Record<string, any>` | 大模型经过 Function Calling 提取出的 JSON 入参 |
| `seal` | `Global Seal` | 海豹顶级全局对象：<br>• `seal.replyToSender(ctx, msg, text)`<br>• `seal.vars.intGet(ctx, key)` 读角色卡数值<br>• `seal.vars.intSet(ctx, key, val)` 写角色卡数值 |
| `fetch` | `Global Fetch` | 发送外部网络请求（需注意网络通畅与跨域，海豹沙箱内有效） |

---

## 4. 故障排除与错误定位机制

为了防止第三方代码异常影响插件核心，AIPlugin4 内置了 **诊断执行切面（Diagnostic Boundary）**：
- **精准源头定位**：当民间 Tool 发生代码错误、网络超时或空指针时，系统会在控制台打印明确的组件标签：
  ```text
  ======================================================
  【AIPlugin 扩展成分报错】
  组件来源: [民间组件: community.weather-pro | 工具: custom_get_weather]
  作者信息: 创作者昵称 (版本: 1.1.0)
  调用参数: {"city":"上海"}
  执行耗时: 124ms
  错误明细: TypeError: Cannot read property 'temp' of undefined
  ======================================================
  ```
- **安全回填**：错误会被降级为模型可读的警告文本，绝不会让整机崩溃，玩家和骰主一眼便能看出是“哪个第三方扩展”产生的故障。

---

## 5. 民间 Skill、角色与知识库规范

### 5.1 Skill 制作规范
必须遵循标准 `SKILL.md` 格式（开头包含 YAML frontmatter）：
```markdown
---
name: 战斗房规指引
description: 当玩家进入战斗轮时，提醒 AI 按照房规计算先攻与护甲减伤
platforms: [qq]
---
# 房规规则正文
1. 敏捷判定先攻值；
2. 护甲固定减免 2 点物理穿刺伤害。
```

### 5.2 角色人设（Character）规范
在 `characters/` 下放置 JSON 文件：
```json
{
  "name": "战术指挥官",
  "prompt": "你是一名冷酷精准的战术指挥官，用简短、有力的军事术语回答。",
  "greeting": "指挥官在线，请下达战术指令。"
}
```

---

## 6. 审查与管理机制接口 (AI Review & Admin System)

商店系统对外预留了完整的自动化审查与管理接口契约：

### 6.1 AI 自动化静态审查契约
向 AI 审查服务提交代码后，审查器将输出结构化 JSON 报告：
```json
{
  "extensionId": "community.weather-pro",
  "safetyScore": 98,
  "summary": "代码逻辑清晰，网络请求目标域名单一 (wttr.in)，无恶意死循环或命令越权行为。",
  "findings": [
    {
      "level": "info",
      "target": "tools/weather.ts:28",
      "message": "发起 GET 网络请求到外部域名: wttr.in"
    }
  ],
  "recommendation": "approve"
}
```

### 6.2 管理员管理状态
- **`status`**：
  - `pending`：待审核
  - `approved`：审核通过，公开可见
  - `flagged`：存在争议或被用户举报，进入人工复核
  - `rejected`：存在恶意攻击行为或不可用，已被封禁
- **`badges`**：
  - `official_verified`：官方严格测试通过徽章
  - `featured`：社区精选推荐
