# v1.2 变更（相对 v1.1）

## 1. 语音变成常驻插件

v1.1 的朗读逻辑写在 `skin\client.js` 里，只在装了皮肤的会话生效，而且和皮肤耦合。

v1.2 拆出独立 bundle：

```
voice\plugin\            → 安装到 profile 的 @local/dsh-fairy-voice
├─ package.json          dsh.client: platform web, immediately true
├─ cordis.patch.yml      insert: fairy-voice
├─ client.js             喇叭开关 + 朗读桥（全局注册）
└─ index.js              空实现（服务由 skin/index.js 负责拉起）
```

因为它是 profile 级客户端插件，**标准模式 / PTC / 极简 / Fairy 模式**里都会出现喇叭并朗读。

## 2. 皮肤移除语音

`skin\client.js` 删除 `fairy-tts`（开关）与 `fairy-tts-bridge`（朗读）两个注册，
避免两个朗读器同时说话。皮肤视觉、开屏、徽记动画均未改动。

## 3. 参考音频占位符

语音插件里的参考音频写成 `__FAIRY_ROOT__/voice/ref/fairy_ref.wav`，
由 `install.ps1` 在安装时替换为真实根目录（v1.0 曾因未替换导致每次请求 400、完全没声音）。

## 4. 已在本机验证

- 版本 `@local/dsh-fairy-voice` 1.1.0 安装成功，输入栏只出现一个喇叭
- 600 ms 防抖 + 整段单次合成（无句间停顿）
- 服务端 GET /tts 返回 200 / RIFF，热身后单句约 1 s

## 5. 罗马数字按中文读（v1.2.1）

合成器读不出「Ⅲ」（U+2162）：会被跳过、读成方块，或者干脆让整句哑掉。
自报家门那句「Ⅲ型总序式集成泛用人工智能」因此一直是残的。

语音插件新增 `normalizeForSpeech()`，**只改送进 TTS 的文本**，聊天文字层仍是 `FAIRY Ⅲ`：

| 输入 | 送进 TTS |
|---|---|
| `Ⅲ型总序式` | `三型总序式` |
| `Ⅱ / Ⅳ / Ⅻ` | `二 / 四 / 十二` |
| `Ⅲ`（ASCII 写作 `III`，仅带 型/号/期/代 后缀时） | `三` |
| `XIII型`、`v1.2.1`、变量名里的 `IV` | 原样保留（先查规范表，查不到不猜） |

覆盖 U+2160–U+216B 与 U+2170–U+217B 两个区段，共 24 个字形。
`build_v12.mjs` 里加了硬断言：插件客户端缺这条规则就直接拒绝打包。

## 6. 更新安全（v1.2.2）

DSH 更新点「重启并安装」后无反应、重启还是旧版。根因不是网络，是**文件锁**：

- 9890 素材服务由宿主插件以 `process.execPath`（即 `DeepSeek Harness.exe`）+ 
  `ELECTRON_RUN_AS_NODE=1` 拉起，且 `detached: true`；
- App 退出后该进程仍存活，锁住安装目录里的 exe；
- electron-updater 的 NSIS 静默安装预检判定「应用仍在运行」→ 中止，且不弹窗。

修法：

| 文件 | 改动 |
|---|---|
| `skin\index.js` | 新增 `resolveNode()`；9890 优先用独立 `node.exe`，找不到才回退旧行为 |
| `voice\ensure-node.ps1` | 新增：把 node.exe 复制到 `<Root>\node\node.exe` |
| `install.ps1` | 安装时调用 ensure-node；`fairy.config.json` 增加 `nodeExe` |

`node.exe` 的来源：`%FAIRY_NODE%` → 运行中 DSH 自带 runtime → `~\.dsh\dsh-runtimes` → PATH。
目标位置在**安装目录之外**，DSH 更新不会覆盖它，它也不会锁 DSH 的文件。

顺带修掉一个打包 bug：v1.2 的 `install.ps1` 在 `build_v12.mjs` 重写后丢了 UTF-8 BOM，
Windows PowerShell 5.1 会按 GBK 解析中文并语法报错。现在两个 `.ps1` 都带 BOM。

详见 `docs\UPDATER-SAFE.md`。

