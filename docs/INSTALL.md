# Fairy 完全体 · 部署包 v1.3.2

> Ⅲ型总序式集成泛用人工智能 · 开发代号 Fairy
> 人设 + 皮肤 + 语音 + 安装器 + 清理器。装完得到一台和作者机器上一模一样的 DSH 助手。
>
> v1.3：预设按新版客户端 standard 重建（旧预设会导致「会话失效」）。
> v1.3：预设按新版客户端 standard 重建（旧预设会导致「会话失效」）。
> v1.3：预设按新版客户端 standard 重建（旧预设会导致「会话失效」）。
> v1.2：语音拆成**常驻插件** `@local/dsh-fairy-voice`，不再绑在皮肤里 —— 所有会话都有 Fairy 语音。
> v1.2.2：**更新安全** —— 9890 改用安装目录之外的独立 `node.exe`，不再锁住 DSH 的 exe，
> 应用内「重启并安装」不会再卡住。详见 `docs\UPDATER-SAFE.md`。

## 0. 前提

- Windows 10/11 x64，DSH 桌面版（nightly 通道验证）
- **D 盘可用 ≥ 3 GB**（只要人设+皮肤+SAPI 语音）；要原音色再加 ~12 GB 给 GPT-SoVITS
- 一件都不下也能跑完，语音用系统自带音色顶着

## 1. 三步

```powershell
Expand-Archive Fairy-Complete-v1.2.zip -DestinationPath D:\_fairy_tmp
cd D:\_fairy_tmp\Fairy-Complete-v1.2
powershell -NoProfile -ExecutionPolicy Bypass -File .\install.ps1
```

`install.ps1` 干五件事：

1. 验盘（C 盘直接拒绝；目标目录里有别人的东西也拒绝，除非 `-Force`）
2. 复制到 `D:\Fairy`
3. 把包里所有 `__FAIRY_ROOT__` 换成本机路径
4. 选语音引擎：**有 GPT-SoVITS 就用它，没有就用 SAPI 兜底**
5. 准备独立 `node.exe`（`<Root>\node\`），避免更新 DSH 时被锁住
6. 注册三个 bundle + 注册 `FairyTTS` 计划任务（登录后 15 秒自启）

然后退出 DSH（含托盘）重启 → 新会话 → 预设选「Fairy 模式」。

常用开关：`-Root D:\AI\Fairy`、`-GptDir <引擎目录>`、`-Voice sapi|sovits|none`、`-NoAutostart`、`-SkipRegister`。

## 2. 语音：先出声，再换嗓子

| 档 | 下载 | 到出声 | 说明 |
|---|---|---|---|
| A. SAPI（默认） | 0 | ~20 s | 系统中文女声，不像 Fairy，但立刻能听 |
| B. 引擎 CPU | 3.2 GB | 10–40 min | 就是 Fairy 的声音 |
| C. + CUDA | +2.7 GB | 再 20–60 min | 合成快 3–4 倍，需要 N 卡 |

升级到 B 只有一条命令（脚本自己测速选源、断点续传、自动 7zr、不碰 C 盘）：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\voice\install_sovits.ps1
.\install.ps1 -Voice sovits
```

详见 `docs\voice-deploy.md`。

## 3. 验收

| 检查项 | 期望 |
|---|---|
| 侧栏品牌 | `Fairy` 20px + 副标题「Ⅲ型总序式集成泛用人工智能」 |
| 徽记 | 单个 SVG，四角 14 s 匀速转一圈，外圈光晕 3.6 s 呼吸，**没有撕裂闪烁** |
| 输入框下方 | `剩余电费 ¥xx.xx　本次已用 ¥x.xx` + `● 运行中/待命`（真实余额） |
| 右上角 | `H.D.D. SYSTEM // FAIRY Ⅲ`，与窗口按钮留 17 px 空隙 |
| 开屏 | 视频 → 徽记问候 → 缩到左下；同一会话 45 s 内刷新不重播 |
| 语音 | 点输入框旁喇叭打开；每条回复静止 1.4 s 后按句念出来 |
| 新会话问「你是谁」 | 「系统启动完成——我是Ⅲ型总序式集成泛用人工智能，开发代号 Fairy。你好，主人。」 |

## 4. 清理临时文件

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\cleanup.ps1
Remove-Item D:\_fairy_tmp -Recurse -Force
```

`-DryRun` 只看清单；`-KeepVoice` 保留语音缓存；`-Deep` 追加清 C 盘 pip/HF/torch；
`-RemoveTasks` 卸载时注销 `FairyTTS` / `FairyAssets`。

## 5. 卸载

1. 删 `D:\Fairy`
2. `cleanup.ps1 -RemoveTasks`
3. `%USERPROFILE%\.dsh\profiles\<名>\package.json` 里去掉两个 `@local/dsh-fairy-*`（bundles 与 dependencies 两处）
4. 同目录 `cordis.patch.yml` 的 `selectedDefault` 改回 `standard`
5. 删 `node_modules\@local\dsh-fairy-*`

## 6. 包内清单

```
preset\           DSH 智能体预设（人设 + 全套工具）
persona\          人设源 + 改人设说明
skin\             client.js（唯一真源）/ index.js（按配置拉服务）/ design\（令牌 + 徽记原件）
voice\            权重 + 参考音 + 两套引擎配置 + sapi_tts + install_sovits + upgrade_torch_gpu
                  + ensure-node.ps1（准备独立 node，更新安全）
splash\           开屏动画 71 MB
docs\             voice-deploy.md / CHANGELOG-1.2.md / UPDATER-SAFE.md / manifest.sha256
node\             install.ps1 自动生成：独立 node.exe（不在 DSH 安装目录内）
```

## 7. DSH 更新之后

v1.2.2 起，应用内「重启并安装」可以直接用，不会再卡在文件锁上。

若在旧版 Fairy 上更新失败过，先确认没有残留进程：

```powershell
Get-Process 'DeepSeek Harness' -ErrorAction SilentlyContinue
```

清干净后，手动运行 `%LOCALAPPDATA%\@deepseek-aidsh-desktop-updater\pending\<版本>.exe`。
README 的「验收」表不该有变化；语音与开屏服务会在下次启动时自动补起来。

---

角色与美术版权归 miHoYo / HoYoverse。本套件为同人风格化实现，**请勿商用、请勿公开发布音色权重**。
