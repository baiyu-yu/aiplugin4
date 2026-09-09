// 民间扩展加载器与错误诊断包装层 (Community Extension Loader & Diagnostic Boundary)
import Logger from "../logger";
import { Session } from "../session/session";
import { splitFrontmatter } from "../utils/frontmatter";
import Tool from "./tool";
import { ToolInfo, ToolSolveContent } from "./types";

const log = Logger.withTag('community-tool');

/** 民间标准工具接口定义 */
export interface CommunityToolDefinition {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: { [key: string]: { type: string; description?: string } };
        required?: string[];
    };
    sessionType?: 'any' | 'user' | 'group';
    sensitive?: boolean;
    group?: string;
    platforms?: string[];
    author?: string;
    version?: string;
    solve: (ctx: seal.MsgContext, msg: seal.Message, session: Session, args: { [key: string]: any }) => Promise<string | ToolSolveContent> | string | ToolSolveContent;
}

/**
 * 将民间工具封装上“诊断执行边界（Diagnostic Boundary）”并注册入 ToolMap
 * 保证：
 * 1. 民间代码功能完全开放，无任何语法或 API 限制；
 * 2. 发生任何未捕获异常时，能够输出结构化、带来源标签的报错信息，清晰定位到具体扩展成分；
 * 3. 避免单点故障拖垮插件核心或误判为官方 bug。
 */
export function registerCommunityTool(def: CommunityToolDefinition, sourcePackageName = '民间扩展'): Tool {
    if (!def || typeof def !== 'object' || !def.name) {
        log.error(`[扩展加载失败] 无效的民间工具定义 (${sourcePackageName})`);
        throw new Error(`无效的民间工具定义: 缺少 name`);
    }

    const toolInfo: ToolInfo = {
        type: 'function',
        function: {
            name: def.name,
            description: def.description || '民间自定义扩展工具',
            parameters: def.parameters || { type: 'object', properties: {} }
        }
    };

    const tool = new Tool(
        toolInfo,
        !!def.sensitive,
        def.group || `民间[${sourcePackageName}]`,
        def.platforms
    );

    if (def.sessionType) {
        tool.sessionType = def.sessionType;
    }

    const originalSolve = def.solve;

    // 核心诊断边界包装
    tool.solve = async (ctx: seal.MsgContext, msg: seal.Message, session: Session, args: { [key: string]: any }) => {
        const startTime = Date.now();
        const componentTag = `[民间组件: ${sourcePackageName} | 工具: ${def.name}]`;

        try {
            if (typeof originalSolve !== 'function') {
                throw new Error(`工具 "${def.name}" 未提供有效的 solve 执行函数`);
            }
            return await originalSolve(ctx, msg, session, args);
        } catch (err: any) {
            const costTime = Date.now() - startTime;
            const errorMsg = err instanceof Error ? (err.stack || err.message) : String(err);
            const argsPreview = JSON.stringify(args || {});

            // 1. 在海豹后台控制台打印醒目的成分报错面板
            log.error(
                `\n======================================================\n` +
                `【AIPlugin 扩展成分报错】\n` +
                `组件来源: ${componentTag}\n` +
                `作者信息: ${def.author || '未知'} (版本: ${def.version || '1.0.0'})\n` +
                `调用参数: ${argsPreview}\n` +
                `执行耗时: ${costTime}ms\n` +
                `错误明细:\n${errorMsg}\n` +
                `======================================================`
            );

            // 2. 回填模型，明确告知模型与用户是第三方扩展异常
            return `【第三方组件执行异常】工具 "${def.name}" 执行失败：${err instanceof Error ? err.message : String(err)}。此错误由民间扩展 [${sourcePackageName}] 产生，非 AI 插件核心故障。`;
        }
    };

    log.info(`已成功挂载民间工具: ${def.name} (${componentTag})`);
    return tool;
}

/**
 * 注册民间上传的 Markdown 技能文件 (SKILL.md)
 */
export function registerCommunitySkill(skillMarkdown: string, sourceName = '民间技能'): { name: string; description: string } | null {
    try {
        const fm = splitFrontmatter(skillMarkdown);
        if (!fm || !fm.meta || !fm.meta.name) {
            log.error(`[技能加载失败] ${sourceName} 缺少 YAML frontmatter 或 name 字段`);
            return null;
        }

        // 可以在运行时动态推入技能注册表，或者打包期内联
        log.info(`已识别民间技能: ${fm.meta.name} (来源: ${sourceName})`);
        return {
            name: fm.meta.name,
            description: fm.meta.description || ''
        };
    } catch (e: any) {
        log.error(`[技能解析异常] ${sourceName}: ${e.message}`);
        return null;
    }
}
