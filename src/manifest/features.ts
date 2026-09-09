// 官方功能模块清单定义 (Features Manifest)
export interface FeatureItem {
    id: string;
    name: string;
    category: 'core' | 'agent' | 'memory' | 'media' | 'system';
    description: string;
    estimatedSize: string; // 预估打包增量体积
    defaultEnabled: boolean;
    configKey?: string; // 对应的 configMap key
    subCmd?: string;    // 对应的 .ai 子命令
    dependencies?: string[]; // 依赖的其他 feature id
}

export const OFFICIAL_FEATURES: FeatureItem[] = [
    {
        id: 'subagent',
        name: '子代理委派框架 (Subagent)',
        category: 'agent',
        description: '对齐 DSH 语义的子代理委派与后台 Job 任务，支持独立上下文多步检索与推理',
        estimatedSize: '95 KB',
        defaultEnabled: true,
        configKey: 'subagent',
        subCmd: 'subagent'
    },
    {
        id: 'knowledge',
        name: '知识库 RAG 检索 (Knowledge Base)',
        category: 'memory',
        description: '支持导入本地文档进行分块切片与相关度检索，自动为模型注入上下文',
        estimatedSize: '65 KB',
        defaultEnabled: true,
        configKey: 'knowledgeBase',
        subCmd: 'kb'
    },
    {
        id: 'memory',
        name: '长期记忆系统 (Long-term Memory)',
        category: 'memory',
        description: '会话级与用户级长期记忆存储，跨会话记忆与语义召回',
        estimatedSize: '45 KB',
        defaultEnabled: true,
        configKey: 'memory',
        subCmd: 'memory'
    },
    {
        id: 'mcp',
        name: 'MCP 扩展协议客户端 (Model Context Protocol)',
        category: 'agent',
        description: '支持通过 SSE 或 stdio 外接外部 MCP 服务，将第三方工具无缝挂载给模型',
        estimatedSize: '35 KB',
        defaultEnabled: true,
        configKey: 'mcp',
        subCmd: 'mcp'
    },
    {
        id: 'skills',
        name: '外部技能体系 (Skills System)',
        category: 'core',
        description: '基于 SKILL.md 的提示词按需检索与注入系统',
        estimatedSize: '25 KB',
        defaultEnabled: true,
        configKey: 'skills',
        subCmd: 'skill'
    },
    {
        id: 'image',
        name: 'AI 绘画与图像处理 (Image Generation)',
        category: 'media',
        description: '调用生图模型与图片处理管线，支持多平台图片回复',
        estimatedSize: '30 KB',
        defaultEnabled: true,
        configKey: 'image',
        subCmd: 'image'
    },
    {
        id: 'music_voice',
        name: '点歌与语音合成 (Music & TTS)',
        category: 'media',
        description: '网易云/QQ音乐点歌服务解析以及预设/自定义音色 TTS 语音合成',
        estimatedSize: '20 KB',
        defaultEnabled: true
    },
    {
        id: 'pub_forum',
        name: '公共广场与社区交互 (Pub & Forum)',
        category: 'system',
        description: '跨会话公开频道与论坛帖子读写交互',
        estimatedSize: '35 KB',
        defaultEnabled: true,
        subCmd: 'pub'
    },
    {
        id: 'timer',
        name: '定时任务与提醒 (Timer & Cron)',
        category: 'system',
        description: '会话定时提醒与延时执行机制',
        estimatedSize: '25 KB',
        defaultEnabled: true,
        subCmd: 'timer'
    },
    {
        id: 'block',
        name: '黑名单与权限管控 (Block & Privilege)',
        category: 'core',
        description: '群组/用户黑名单拦截、管理以及细粒度指令权限控制',
        estimatedSize: '20 KB',
        defaultEnabled: true,
        subCmd: 'block'
    },
    {
        id: 'changelog',
        name: '更新历史与变更日志 (Changelog)',
        category: 'system',
        description: '内置全量版本历史变更记录文本（剔除可减小约 70KB 体积）',
        estimatedSize: '70 KB',
        defaultEnabled: false
    }
];
