// 官方工具清单定义 (Tools Manifest)
export interface ToolMetaItem {
    id: string;
    name: string;
    category: 'core' | 'ob11' | 'seal' | 'media' | 'memory' | 'web' | 'manage' | 'system';
    description: string;
    toolNames: string[]; // 实际向模型暴露的 tool function name
    estimatedSize: string;
    defaultEnabled: boolean;
    importPath: string;
    registerFn: string;
    featureId?: string; // 所属或依赖的功能模块
    tags?: {
        requiresNetwork?: boolean;
        requiresHttpExt?: boolean;
        sensitive?: boolean;
        platforms?: string[];
    };
}

export const OFFICIAL_TOOLS: ToolMetaItem[] = [
    // --- 核心底座工具 (Core，默认始终包含，建议不剔除) ---
    {
        id: 'tool_dispatch',
        name: '工具调度与按需发现 (Tool Dispatcher)',
        category: 'core',
        description: '提供 list_tools, search_tools, call_tool 等核心工具发现与调度入口',
        toolNames: ['list_tools', 'search_tools', 'call_tool'],
        estimatedSize: '15 KB',
        defaultEnabled: true,
        importPath: './core/tool_dispatch',
        registerFn: 'registerDispatchTools'
    },
    {
        id: 'tool_time',
        name: '当前时间查询 (Time)',
        category: 'core',
        description: '允许模型获取当前系统时间、星期与日期',
        toolNames: ['get_time'],
        estimatedSize: '3 KB',
        defaultEnabled: true,
        importPath: './core/tool_time',
        registerFn: 'registerTime'
    },
    {
        id: 'tool_trigger',
        name: '触发词配置 (Trigger Words)',
        category: 'core',
        description: '允许模型在会话中动态调整或新增触发关键词',
        toolNames: ['set_trigger_words'],
        estimatedSize: '4 KB',
        defaultEnabled: true,
        importPath: './core/tool_trigger',
        registerFn: 'registerSetTrigger'
    },
    {
        id: 'tool_cmd',
        name: '扩展与核心指令执行 (Commands)',
        category: 'core',
        description: '允许模型按白名单调用海豹扩展指令或核心指令（如 .roll / .r）',
        toolNames: ['run_ext_command', 'run_core_command'],
        estimatedSize: '12 KB',
        defaultEnabled: true,
        importPath: './core/tool_cmd',
        registerFn: 'registerCmdTool'
    },

    // --- OB11 / QQ 群管工具 ---
    {
        id: 'tool_ob11',
        name: 'OB11 统一群管接口 (OB11 Action API)',
        category: 'ob11',
        description: '通过 call_ob11_api 执行禁言、踢人、改名片、撤回、设置头衔等全部 QQ 管理动作',
        toolNames: ['call_ob11_api'],
        estimatedSize: '25 KB',
        defaultEnabled: true,
        importPath: './ob11/tool_call_api',
        registerFn: 'registerCallOb11Api',
        tags: { sensitive: true, platforms: ['qq'] }
    },
    {
        id: 'tool_resolve_id',
        name: '特殊 ID 与昵称反查 (Special ID Resolver)',
        category: 'ob11',
        description: '将 @ 提及或句柄转为真实 QQ 号与群名片',
        toolNames: ['resolve_special_id'],
        estimatedSize: '8 KB',
        defaultEnabled: true,
        importPath: './ob11/tool_resolve_id',
        registerFn: 'registerResolveSpecialId',
        tags: { platforms: ['qq'] }
    },

    // --- SealDice 跑团工具 ---
    {
        id: 'tool_attr',
        name: '海豹角色卡属性读写 (Seal Attributes)',
        category: 'seal',
        description: '获取或修改指定玩家在当前群/当前卡片上的 COC/DND 属性与技能值',
        toolNames: ['attr_get', 'attr_set'],
        estimatedSize: '6 KB',
        defaultEnabled: true,
        importPath: './seal/tool_attr',
        registerFn: 'registerAttrSeal'
    },

    // --- 多媒体与资源工具 ---
    {
        id: 'tool_image',
        name: 'AI 绘画生成 (Image Generation)',
        category: 'media',
        description: '使用绘图模型生成图片并在聊天中回复',
        toolNames: ['draw'],
        estimatedSize: '10 KB',
        defaultEnabled: true,
        importPath: './image/tool_image',
        registerFn: 'registerImage',
        featureId: 'image',
        tags: { requiresNetwork: true }
    },
    {
        id: 'tool_meme',
        name: '表情包制作 (Meme Generator)',
        category: 'media',
        description: '查询可用表情包模版并制作个性化沙雕表情包',
        toolNames: ['meme_list', 'get_meme_info', 'make_meme'],
        estimatedSize: '15 KB',
        defaultEnabled: true,
        importPath: './image/tool_meme',
        registerFn: 'registerMeme',
        tags: { requiresNetwork: true }
    },
    {
        id: 'tool_music',
        name: '网易云/QQ 音乐点歌 (Music Player)',
        category: 'media',
        description: '在群内点歌并发送音乐卡片',
        toolNames: ['music_search', 'music_play'],
        estimatedSize: '8 KB',
        defaultEnabled: true,
        importPath: './resource/tool_music',
        registerFn: 'registerMusicPlay',
        featureId: 'music_voice',
        tags: { requiresNetwork: true }
    },
    {
        id: 'tool_voice',
        name: 'AI 语音合成 (TTS Voice)',
        category: 'media',
        description: '调用 TTS 语音服务将文本转为语音消息发送',
        toolNames: ['tts_speak'],
        estimatedSize: '8 KB',
        defaultEnabled: true,
        importPath: './resource/tool_voice',
        registerFn: 'registerAudioTools',
        featureId: 'music_voice',
        tags: { requiresNetwork: true, requiresHttpExt: true }
    },
    {
        id: 'tool_resource',
        name: '本地资源引用与管理 (Resource Management)',
        category: 'media',
        description: '查询与引用插件本地预置的声音、图片等静态资源',
        toolNames: ['resource_list', 'resource_path'],
        estimatedSize: '12 KB',
        defaultEnabled: true,
        importPath: './resource/init',
        registerFn: 'registerResourceTools'
    },

    // --- 联网与社区工具 ---
    {
        id: 'tool_web',
        name: '联网搜索与网页抓取 (Web Search & Read)',
        category: 'web',
        description: '通过搜索引擎查询实时信息并提取指定 URL 页面正文内容',
        toolNames: ['web_search', 'fetch_web_content'],
        estimatedSize: '10 KB',
        defaultEnabled: true,
        importPath: './web/tool_web',
        registerFn: 'registerWeb',
        tags: { requiresNetwork: true }
    },
    {
        id: 'tool_forum',
        name: '论坛社区检索与互动 (Forum Community)',
        category: 'web',
        description: '在社区论坛中搜索帖子、阅读内容及发帖互动',
        toolNames: ['forum_search', 'forum_read', 'forum_post'],
        estimatedSize: '28 KB',
        defaultEnabled: true,
        importPath: './web/tool_forum',
        registerFn: 'registerForum',
        featureId: 'pub_forum',
        tags: { requiresNetwork: true }
    },

    // --- 记忆与知识库工具 ---
    {
        id: 'tool_memory',
        name: '长期记忆存取 (Long-term Memory)',
        category: 'memory',
        description: '写入、读取、检索或遗忘长期记忆事项',
        toolNames: ['memory_write', 'memory_read', 'memory_search', 'memory_delete'],
        estimatedSize: '40 KB',
        defaultEnabled: true,
        importPath: './memory/tool_memory',
        registerFn: 'registerMemory',
        featureId: 'memory'
    },
    {
        id: 'tool_knowledge',
        name: '知识库切片检索 (Knowledge Docs)',
        category: 'memory',
        description: '按库检索并阅读本地导入的切片知识库内容',
        toolNames: ['knowledge_search', 'knowledge_read', 'knowledge_list', 'knowledge_docs'],
        estimatedSize: '15 KB',
        defaultEnabled: true,
        importPath: './memory/tool_knowledge',
        registerFn: 'registerKnowledgeTools',
        featureId: 'knowledge'
    },

    // --- 管理与系统工具 ---
    {
        id: 'tool_block',
        name: '黑名单管理 (Blacklist Manager)',
        category: 'manage',
        description: '添加或移除群组/用户黑名单',
        toolNames: ['block_add', 'block_remove', 'block_list'],
        estimatedSize: '6 KB',
        defaultEnabled: true,
        importPath: './manage/tool_block',
        registerFn: 'registerBlockTool',
        featureId: 'block',
        tags: { sensitive: true }
    },
    {
        id: 'tool_raw',
        name: '截断数据原文提取 (Raw Reader)',
        category: 'system',
        description: '当工具输出被长度截断时，按分页读取完整的工具原文内容',
        toolNames: ['read_raw'],
        estimatedSize: '35 KB',
        defaultEnabled: true,
        importPath: './raw/tool_raw',
        registerFn: 'registerRawTools'
    },
    {
        id: 'tool_pub',
        name: '公开会话广场读写 (Pub Hub)',
        category: 'system',
        description: '在跨群公开频道中阅读与发送公开广播消息',
        toolNames: ['pub_read', 'pub_send'],
        estimatedSize: '20 KB',
        defaultEnabled: true,
        importPath: './pub/tool_pub',
        registerFn: 'registerPubRead',
        featureId: 'pub_forum'
    },
    {
        id: 'tool_subagent',
        name: '子智能体委派与任务控制 (Subagent Fleet)',
        category: 'system',
        description: '派生/分叉子代理，以及后台 Job 的监控、输出查看与中止',
        toolNames: ['subagent', 'subagent_fork', 'send_message', 'interrupt_agent', 'list_agents', 'job_list', 'job_output', 'job_kill'],
        estimatedSize: '25 KB',
        defaultEnabled: true,
        importPath: './subagent/init',
        registerFn: 'registerSubagentTools',
        featureId: 'subagent'
    }
];
