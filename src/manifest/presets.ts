// 预设配置模板定义 (Preset Profiles)
export interface PresetProfile {
    id: string;
    name: string;
    description: string;
    enabledFeatures: string[];
    enabledTools: string[];
}

export const PRESET_PROFILES: PresetProfile[] = [
    {
        id: 'minimal',
        name: '极简核心版 (Minimal Chat)',
        description: '仅保留核心会话底座与必要指令，无多媒体与复杂协议，体积最小，启动极快',
        enabledFeatures: ['block'],
        enabledTools: ['tool_dispatch', 'tool_time', 'tool_trigger', 'tool_cmd', 'tool_block']
    },
    {
        id: 'trpg',
        name: '跑团助手版 (TRPG Bot)',
        description: '专为跑团群设计，包含核心指令、海豹角色卡属性读写与技能系统',
        enabledFeatures: ['skills', 'block', 'memory'],
        enabledTools: ['tool_dispatch', 'tool_time', 'tool_trigger', 'tool_cmd', 'tool_attr', 'tool_memory', 'tool_block']
    },
    {
        id: 'ob11',
        name: 'QQ 群管助手版 (OB11 Suite)',
        description: '专注于 QQ 群秩序与管理，集成 OB11 全量群管动作（禁言/踢人/撤回/改名）与黑名单',
        enabledFeatures: ['block', 'memory', 'timer'],
        enabledTools: ['tool_dispatch', 'tool_time', 'tool_trigger', 'tool_cmd', 'tool_ob11', 'tool_resolve_id', 'tool_block', 'tool_memory']
    },
    {
        id: 'full',
        name: '全功能旗舰版 (Full Stack)',
        description: '包含官方所有功能模块与全部工具集（包含 Subagent、MCP、生图、点歌、语音与知识库）',
        enabledFeatures: [
            'subagent',
            'knowledge',
            'memory',
            'mcp',
            'skills',
            'image',
            'music_voice',
            'pub_forum',
            'timer',
            'block',
            'changelog'
        ],
        enabledTools: [
            'tool_dispatch',
            'tool_time',
            'tool_trigger',
            'tool_cmd',
            'tool_ob11',
            'tool_resolve_id',
            'tool_attr',
            'tool_image',
            'tool_meme',
            'tool_music',
            'tool_voice',
            'tool_resource',
            'tool_web',
            'tool_forum',
            'tool_memory',
            'tool_knowledge',
            'tool_block',
            'tool_raw',
            'tool_pub',
            'tool_subagent'
        ]
    }
];
