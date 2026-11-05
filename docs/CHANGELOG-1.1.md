# v1.1 变更 · 跟随 2026-10-24 晚间的新设置

这次不是小修，是把整台机器的**新状态**重新抄进包里。以下是逐项对照。

## 一、皮肤：换成本机在跑的版本

| 项 | v1.0（旧） | v1.1（现在） |
|---|---|---|
| `client.js` | 52,284 B，整段朗读 220 字 | **52,490 B，按句合成 + 预取下一句**，首字延迟 1–2 s |
| 开屏判定 | `sessionStorage` 一次性标记 | **时间戳 + 45 s 冷却**，每次启动都播，快速 F5 不重播 |
| 徽记 | 20 条带每 3.6 s 撕裂 | **单 SVG**，band 全隐；四角 14 s 匀速转，外圈光晕 3.6 s 呼吸 |
| 输入栏 | 轮次/步骤 + tok + 状态 | `剩余电费 ¥` + `本次已用 ¥`（真实账户余额）+ 运行状态 |
| 模型控件 | 标签 + 箭头 | 图标 + 箭头；下拉里照常显示模型名 |
| 麦克风 | 皮肤自绘占位 | 官方语音输入控件接管，占位自动隐藏 |
| 标题栏 | 有色阶断层 | `.fs-topfade` 渐变到 Electron overlay 色，断层消失 |

## 二、语音：从"必须装引擎"改成"三档可选"

这是本轮最大的改动，为了**减少部署难度**。

- 新增 `voice\sapi_tts.ps1`：**零下载**，在 9880 上假冒 `/tts`，用 Windows 自带中文女声。
  实现在 `TcpListener` 上（不用 HttpListener，避免 URL ACL 要管理员）。
- `install.ps1` 加 `-Voice auto|sovits|sapi|none`：
  找不到引擎就自动落到 `sapi`，装完 **20 秒就能听见声音**，不再卡在 3.2 GB 下载上。
- 新增 `voice\install_sovits.ps1`：一条命令完成下载与安装
  - GitHub API 解析真实资源名，拿不到就用固定地址
  - 四个源测速（直连 / ghfast / gh-proxy / ghproxy.net），取最快
  - `curl -C -` 断点续传，中断可重跑
  - 自动取 `7zr.exe`（600 KB）解压，临时包放 `D:\GPT-SoVITS\_dl`，不碰 C 盘
  - 支持 `-From <本地7z>` 跳过下载
- 新增 `voice\upgrade_torch_gpu.ps1`：把 torch 换成 cu128（50 系必需），
  顺手做 `sympy==1.12` 与 `patched_mha_with_cache.py` 的 typing 补丁，验证通过才切 `device: cuda`。

## 三、引擎配置：按显卡自动选

- `voice\tts_infer.yaml` 拆成 `tts_infer.cuda.yaml`（`cuda` / `is_half: true`）与
  `tts_infer.cpu.yaml`（`cpu` / `false`）。
- `install.ps1` 用 `python -c "torch.cuda.is_available()"` 实测决定用哪套，**不猜硬件**。
- 原文件覆盖前自动备份为 `tts_infer.yaml.fairy-bak`。

## 四、启动方式：跟随本机的计划任务

本机把自动启动从"应用内拉起"换成了**计划任务**（`FairyTTS` / `FairyAssets`，登录型触发器）。
包里同步改成：

- `install.ps1` 生成 `voice\run_tts.cmd`（含 `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1` 与 D 盘缓存变量），
  注册 `FairyTTS` 任务（登录后 15 s，`Interactive` / `Limited`，无执行时限）。
- `-NoAutostart` 可跳过；注册失败只警告，不中断安装。
- `cleanup.ps1 -RemoveTasks` 注销这些任务。
- `skin\index.js` 保留兜底：DSH 启动时若 9880/9890 没监听就自己拉一个，双保险。

## 五、路径与健壮性

- 新 `serve_assets.mjs` 增加了 `/tts` 反向代理与 `/log` 端点（CSP 友好），
  三个绝对路径全部改写成占位符。
- `index.js` 支持 `engine` 字段，并按引擎传 `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1`。
- 安装器新增占位替换断言、C 盘拒绝、目标目录占用检查（`-Force` 可越）。
- 计划任务注册、pnpm 缺失、引擎缺失都不再让安装失败 —— 只降级。

## 六、没变的

人设 `persona.md` 与预设 `preset\` 一个字未改（12:59 那版），徽记原件、参考音、
开屏动画、权重哈希全部沿用。
