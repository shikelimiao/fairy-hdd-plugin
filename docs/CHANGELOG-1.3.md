# v1.3 变更（相对 v1.2）

## 1. 关键修复：预设必须跟着客户端版本走

2026-11-04 客户端升级（app.asar 重建，插件 199 → 206）后，所有绑定 `agentPreset: fairy` 的会话
在打开时提示「会话失效」，并从侧栏消失。

原因：Fairy 预设是 10-24 按**旧版 standard** 生成的插件清单（14.3 KB），新版客户端挂载不了，
resume 时抛错。会话日志本身完全正常（`session.v4.jsonl.zstd`，zstd 头 `28 B5 2F FD`）。

修复：从新版 `app.asar` 解出官方 `@deepseek-ai/dsh-web-app/presets/standard.patch.yml`（6.9 KB），
以它为骨架重建 Fairy 预设，仅把 `persona` 行替换为 Fairy 人设前缀，改回 `id: fairy` / `order: 2.5`。
本机 20 个 fairy 会话全部恢复。

> **注意（写进发布纪律）**：每次客户端大版本更新后，预设都可能需要按新版 standard 重新生成。
> 判定方法：打开旧会话若提示「会话失效」，先读会话首行的 `agentPreset`，再比对新版 standard 的插件清单。
> 读取工具见 `ui_ref/session_presets.mjs`（Node 24 的 `zlib.zstdDecompressSync` 可直接解会话日志）。

## 2. 皮肤：CSS + 开屏，不再带 React 组件

新版客户端 props/slot 变化会让旧皮肤的组件在会话切换时抛异常，导致界面无响应。
v1.3 皮肤只做两件事：

- 注入完整皮肤 CSS（配色、布局、网格、徽记动画样式）
- 直接操作 DOM 播放开屏动画（视频 → 问候 → 缩小淡出），不经过任何 React 渲染

实测：开屏播完后导航、新建会话、会话切换均正常。徽记/吉祥物/输入栏胶囊等组件待后续逐个移植。

## 3. 语音常驻插件保持独立

`voice\plugin\`（`@local/dsh-fairy-voice`）行为不变：600 ms 防抖、整段单次合成、
参考音频用 `__FAIRY_ROOT__/voice/ref/fairy_ref.wav` 占位，由 `install.ps1` 替换为真实路径。

## 4. 发包前交叉验证（本次新增，脚本见 `dist\validate_v13.mjs`）

| 检查 | 内容 | 结果 |
|---|---|---|
| 占位符 | 包内每个 `__FAIRY_ROOT__/x` 都能在包里找到对应文件（安装器会创建的 logs/cache 除外） | PASS |
| 端口 | 仅 9880（语音 API）/ 9890（素材服务）；9881 只出现在 SAPI 测试示例 | PASS |
| 关键引用 | `voice/plugin/client.js`、`sapi_tts.ps1`、`serve_assets.mjs`、`skin/index.js` 都指向 9880/9890 | PASS |
| 安装器配置 | `fairy.config.json` 的 root/gptDir/engine/nodeExe/refAudio/splash/cache 七个键齐全，refAudio 指向 `voice/ref/fairy_ref.wav` | PASS |
| 语法 | 全部 `package.json` 可解析，全部 `.js/.mjs` `node --check` 通过，全部 `.ps1` `Parser::ParseFile` 通过 | PASS |
| 可移植性 | 运行时文件里没有作者机器的绝对路径 | PASS |
| 预设 | 含 `id: fairy`、`persona`，且带新版骨架标志（`tool-plugin-manager`） | PASS |

## 5. 仍待完成

- 皮肤组件逐个移植（Sigil / BrandText / Pills / HUD / 吉祥物），每加一个验证一次导航
- 开屏问候音在无 `voice/cache` 缓存时会回落到 9880 实时合成，首次开屏会慢 ~1 s
