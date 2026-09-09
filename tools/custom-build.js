// 自定义按需打包构建脚本 (Custom Build Engine)
const { build } = require('esbuild');
const path = require('path');
const fs = require('fs');

const catalog = require('../src/manifest/catalog.json');
const OFFICIAL_TOOLS = catalog.tools;
const PRESET_PROFILES = catalog.presets;

/**
 * 根据勾选的 tools 清单生成动态的 init.ts 内容
 * @param {string[]} enabledToolIds 
 * @param {Array<{name: string, code: string}>} [customTools]
 */
function generateToolsInitSource(enabledToolIds, customTools = []) {
    const selectedToolSet = new Set(enabledToolIds || []);
    // core 基础调度工具强制包含
    selectedToolSet.add('tool_dispatch');

    const imports = [];
    const calls = [];

    OFFICIAL_TOOLS.forEach((t, idx) => {
        if (selectedToolSet.has(t.id)) {
            const alias = `reg_${t.registerFn}_${idx}`;
            // 相对路径从 src/tool/tools/init.ts 出发
            const importTarget = t.importPath.startsWith('./') ? t.importPath : `./${t.importPath}`;
            imports.push(`import { ${t.registerFn} as ${alias} } from "${importTarget}";`);
            calls.push(`    ${alias}();`);
        }
    });

    // 如果有民间工具
    const customRegistrations = [];
    if (customTools && customTools.length > 0) {
        imports.push(`import { registerCommunityTool } from "../community_loader";`);
        customTools.forEach((ct, i) => {
            customRegistrations.push(`    registerCommunityTool(__custom_tool_${i}, "${ct.name || `custom_${i}`}");`);
        });
    }

    return `// 自动生成的按需工具注册入口
${imports.join('\n')}

export function registerTools() {
${calls.join('\n')}
${customRegistrations.join('\n')}
}
`;
}

/**
 * 执行自定义打包构建
 * @param {Object} options
 * @param {string} [options.profile] - 预设配置 ID (minimal, trpg, ob11, full)
 * @param {string[]} [options.tools] - 启用的工具 ID 列表
 * @param {string[]} [options.features] - 启用的功能模块 ID 列表
 * @param {Array<{name: string, code: string}>} [options.customTools] - 民间上传工具
 * @param {string} [options.outfile] - 输出路径
 * @param {boolean} [options.minify] - 是否压缩
 */
async function buildCustomPlugin(options = {}) {
    let enabledTools = options.tools;
    let enabledFeatures = options.features;

    if (options.profile) {
        const found = PRESET_PROFILES.find(p => p.id === options.profile);
        if (found) {
            enabledTools = enabledTools || found.enabledTools;
            enabledFeatures = enabledFeatures || found.enabledFeatures;
        }
    }

    if (!enabledTools) {
        enabledTools = OFFICIAL_TOOLS.map(t => t.id);
    }
    if (!enabledFeatures) {
        enabledFeatures = ['block', 'memory', 'timer'];
    }

    const featureSet = new Set(enabledFeatures);
    const hasChangelog = featureSet.has('changelog');

    const outfile = options.outfile || path.join(__dirname, '../dist/aiplugin4.custom.js');
    const dynamicInitCode = generateToolsInitSource(enabledTools, options.customTools);

    // esbuild 虚拟替换插件
    const virtualModulePlugin = {
        name: 'virtual-modules',
        setup(buildInstance) {
            // 拦截 tools/init.ts
            buildInstance.onResolve({ filter: /[/\\]tools[/\\]init(\.ts)?$/ }, args => {
                return { path: path.resolve(args.resolveDir, args.path), namespace: 'virtual-init' };
            });
            buildInstance.onLoad({ filter: /.*/, namespace: 'virtual-init' }, () => {
                return {
                    contents: dynamicInitCode,
                    loader: 'ts',
                    resolveDir: path.resolve(__dirname, '../src/tool/tools')
                };
            });

            // 拦截 changelog.ts (若未启用 changelog 则替换为空对象)
            if (!hasChangelog) {
                buildInstance.onResolve({ filter: /[/\\]changelog(\.ts)?$/ }, args => {
                    return { path: path.resolve(args.resolveDir, args.path), namespace: 'virtual-changelog' };
                });
                buildInstance.onLoad({ filter: /.*/, namespace: 'virtual-changelog' }, () => {
                    return {
                        contents: `export const changelog = {};\n`,
                        loader: 'ts',
                        resolveDir: path.resolve(__dirname, '../src')
                    };
                });
            }
        }
    };

    const startTime = Date.now();
    fs.mkdirSync(path.dirname(outfile), { recursive: true });

    await build({
        bundle: true,
        entryPoints: [path.join(__dirname, '../src/index.ts')],
        outfile: outfile,
        platform: 'browser',
        tsconfig: path.join(__dirname, '../tsconfig.json'),
        minify: !!options.minify,
        color: true,
        sourcemap: false,
        external: ['csharp', 'puerts'],
        target: 'es6',
        treeShaking: true,
        logLevel: 'error',
        charset: 'utf8',
        define: {
            'process.env.NODE_ENV': JSON.stringify('production'),
            '__FEATURE_SUBAGENT__': JSON.stringify(featureSet.has('subagent')),
            '__FEATURE_KNOWLEDGE__': JSON.stringify(featureSet.has('knowledge'))
        },
        plugins: [virtualModulePlugin]
    });

    // 附带 header.txt
    const bodyText = fs.readFileSync(outfile);
    const headerPath = path.join(__dirname, '../header.txt');
    const headerText = fs.existsSync(headerPath) ? fs.readFileSync(headerPath).toString() : '';
    fs.writeFileSync(outfile, `${headerText}\n${bodyText}`);

    const stat = fs.statSync(outfile);
    const sizeKB = (stat.size / 1024).toFixed(1);
    const costTime = Date.now() - startTime;

    console.log(`[Custom Build] Successfully built: ${outfile}`);
    console.log(`[Custom Build] Output Size: ${sizeKB} KB (took ${costTime}ms)`);
    console.log(`[Custom Build] Enabled Tools (${enabledTools.length}): ${enabledTools.join(', ')}`);

    return {
        outfile,
        sizeBytes: stat.size,
        sizeKB,
        costTime
    };
}

// 命令行入口测试
if (require.main === module) {
    const profileArg = process.argv.find(a => a.startsWith('--profile='));
    const profile = profileArg ? profileArg.split('=')[1] : (process.argv[2] || 'minimal');
    buildCustomPlugin({ profile }).catch(err => {
        console.error('[Custom Build Error]', err);
        process.exit(1);
    });
}

module.exports = {
    buildCustomPlugin,
    generateToolsInitSource
};
