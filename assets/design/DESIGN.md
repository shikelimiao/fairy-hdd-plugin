# Fairy 皮肤 · 设计参数

唯一真源是 `skin/client.js`（51 KB，`__ModuleLoader__.load` 一个模块，无构建依赖）。
本文件与 `tokens.json` 是它的可读副本，用来在别的机器上重新实现、或改配色时不至于反编译。

## 1. 结构

皮肤不改宿主源码，只做三件事：

| 手段 | 具体 |
|---|---|
| 注入样式 | `apply()` 里写一个 `<style id="fairy-skin-css">`，卸载时移除 |
| 挂载点替换 | `sidebar.brand.mark` / `sidebar.brand.name` / `conversation.hero.brand.mark` |
| 覆盖层 | `shell.overlay`（HUD 四角 + 扫描线 + 品牌水印 + 标题栏 `+`）、`conversation.composer.dock`（状态条） |

宿主版本换代后挂载点 id 可能变；找不到就静默跳过，不会白屏。

## 2. 配色

| 用途 | 值 |
|---|---|
| 主区底 | `#040a17` |
| 侧栏底 | `#0a0c23` |
| 输入框卡 | `#071329` |
| 气泡 | `#172a49` |
| 选中行 | `#1b2436` |
| 描边 | `rgba(98,140,220,.20)` / 强调 `rgba(120,170,255,.42)` |
| 正文 | `#dbe6f4`，次级 `#93a7bd` |
| 冷光主色 | `#7fb4ff`，高光 `#7fd8ff` |
| 发送键 | `#2f6bff` |
| 在线绿 / 警告红 | `#4fd0a0` / `#ff8b8b` |

背景：径向渐变 `#0d2136 → #07101c → #04090f` + 72px 冷光网格 + 暗角 + 扫描线。
浅色/深色两套宿主 token 都指向同一套值 —— 切系统主题不会破相。

## 3. 尺寸

| 项 | 值 |
|---|---|
| 侧栏宽 | 278 px |
| 消息列 | 880 px |
| 输入框宽 | 720 px，圆角 10 px |
| 品牌字 | `Fairy` 20 px，字距 0.06em |
| 正文 | 15 px |
| 导航图标 | 18 px |
| 标题栏让位 | `--dsh-windows-menu-start: 88px` |

## 4. 动效（徽记 FAIRY Ⅲ）

原件在 `design/fairy-assets/`（`fairy-mascot.svg` + `fairy-mascot.css` + 预览 html）。

| 参数 | 值 |
|---|---|
| 条带数 | 20 |
| 撕裂周期 | 3600 ms，同帧错位 86 ms |
| 光环呼吸 | 3400 ms（外圈 `blur(1.5px)` 柔光） |
| 四角旋转 | 3000 ms / 90° |
| 眼环 | 四层相位错开 |

## 5. 两条红线

1. **不要改 `app.asar`**：Electron 44 可能带 asar 完整性校验，改完起不来，且无法回滚。
2. **超椭圆**：前端默认 `corner-shape: superellipse(1.5)`；要正圆必须成对写
   `corner-shape: round; border-radius: 50%`，否则是方的。

顶部「应用 / 编辑」菜单条是 preload 注入的 Shadow DOM（`:host { position: fixed }`）。
外层任何命中宿主的规则优先级都比它高，一句 `body > div { position: relative }` 就能把它顶到屏幕底部。
要改它的颜色/起点，只碰 `[data-windows-menu]` 上的自定义属性。

## 6. 与参考录屏仍不一致的地方（接受）

- 标题栏只有 `+`，没有自定义窗口框架 —— 那是另一套壳。
- 会话标题显示真实标题 + 「创造模式」，参考里是手写文案。
- 侧栏 5 个图标沿用宿主线性图标，仅做描边与高亮，未逐个重绘。
