# 语音部署 · 三条路，按时间长短选

Fairy 的**原音色**来自 GPT-SoVITS v2；包内已带微调权重与参考音，你只需要**引擎**。
但引擎要 3–4 GB 下载，所以本包给三档：

| 档 | 下载量 | 到"能听见"的耗时 | 音色 |
|---|---|---|---|
| **A. SAPI 兜底（默认）** | **0 B** | **约 20 秒** | Windows 自带中文女声，不像 Fairy，但立刻能出声 |
| B. 引擎（CPU） | ~3.2 GB | 10–40 分钟（看网速） | 就是 Fairy |
| C. 引擎 + CUDA | +2.7 GB | 再 20–60 分钟 | 同上，合成快 3–4 倍 |

**建议顺序**：A 先出声 → B 要原音色 → 有 N 卡再 C。不要一上来就冲 C。

---

## A. 什么都不下（默认）

安装器在找不到引擎时会自动选这一档。它用一个 PowerShell 写的 SAPI 端点在 `9880` 上假冒 GPT-SoVITS：

```powershell
# 手动起（装完后计划任务 FairyTTS 会自动起，一般不用手点）
powershell -NoProfile -ExecutionPolicy Bypass -File D:\Fairy\voice\sapi_tts.ps1 -Port 9880
```

用的是系统里第一个中文女声（这台机器是 `Microsoft Huihui Desktop`），语速 `-2`（更慢、更像播报）。
零下载、零显存、不联网。什么时候都能换成 B，不冲突。

---

## B. 装引擎（CPU 版，一条命令）

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\install_sovits.ps1
```

脚本自己会干这些：

1. 查 GitHub release 的真实资源名（API 拿不到就用固定地址）
2. **四个源测速**（GitHub 直连 / ghfast / gh-proxy / ghproxy.net），各取 256 KB 比 KB/s，挑最快的
3. `curl -C -` 断点续传 —— 断了重跑同一条命令就接着下
4. 自动取 `7zr.exe`（600 KB）解压，不动 C 盘
5. 按 CPU 写入 `tts_infer.yaml`，权重指向 `D:\Fairy\voice\weights\`
6. 删安装包（`-KeepPackage` 可留）

下完回到解压目录再跑一次：

```powershell
.\install.ps1 -Voice sovits
```

它会自动检测 `torch.cuda.is_available()`、写好 `tts_infer.yaml`、注册 `FairyTTS` 计划任务。

**网太慢就别硬下。** 去 <https://github.com/RVC-Boss/GPT-SoVITS/releases> 手动下
`GPT-SoVITS-v2-240821.7z`，然后：

```powershell
.\install_sovits.ps1 -From D:\downloads\GPT-SoVITS-v2-240821.7z
```

脚本只做解压 + 配置，跳过下载环节。

---

## C. 提速（可选，NVIDIA 显卡）

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\upgrade_torch_gpu.ps1
```

实测同一台机器：

| 场景 | CPU | GPU (cu128) |
|---|---|---|
| 19 字短句 | 2.3 s | **1.0 s** |
| 80 字长句 | ~18 s | **4.0 s** |

代价与门槛：

- 多下 2.7 GB（`torch 2.7.1+cu128` / `torchaudio`）
- **50 系（sm_120）必须 cu128**，cu118 不认；驱动建议 ≥ 570
- 脚本会顺手做两件必须的事：`sympy==1.12`（transformers 4.36 要 `equal_valued`）、
  给 `patched_mha_with_cache.py` 补 `from torch import Tensor`（torch 2.7 不再从 `functional import *` 带出）

装完 `torch.cuda.is_available()` 为真才会切到 `device: cuda` / `is_half: true`，否则保持 CPU，语音照常。

---

## 让缓存不回流 C 盘

安装器已经把下面几个变量写进计划任务和 `run_tts.cmd`；手动跑引擎时也建议设：

```powershell
[Environment]::SetEnvironmentVariable('HF_HOME',        'D:\Fairy\cache\huggingface', 'User')
[Environment]::SetEnvironmentVariable('TORCH_HOME',     'D:\Fairy\cache\torch',       'User')
[Environment]::SetEnvironmentVariable('PIP_CACHE_DIR',  'D:\Fairy\cache\pip',         'User')
[Environment]::SetEnvironmentVariable('TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD', '1',        'User')
```

最后那个是 torch 2.6+ 的坑：`torch.load` 默认 `weights_only=True`，不设它，SoVITS 权重加载会直接报错。

---

## 目录长这样

```
D:\GPT-SoVITS\GPT-SoVITS-v2-240821\
├─ runtime\python.exe          ← 只认它，别用系统 Python
├─ api_v2.py
└─ GPT_SoVITS\configs\tts_infer.yaml   ← 安装器写入，原文件备份 .fairy-bak
```

引擎的三个块（`custom` / `default` / `default_v2`）里的 `device` 与 `is_half` 必须同时改；
`custom` 与 `default_v2` 的权重路径指向 `D:\Fairy\voice\weights\`。

---

## 启动与验证

```powershell
# 装完会自动注册计划任务，登录后 15 秒起；也可手动：
powershell -NoProfile -ExecutionPolicy Bypass -File D:\Fairy\voice\start_engine.ps1
```

成功的样子：`9880 OK，<字节数> 字节`。
CPU 首句 20–60 秒是正常的，**不是卡死**；GPU 约 5 秒。

```powershell
# 单句试听
powershell -NoProfile -ExecutionPolicy Bypass -File D:\Fairy\voice\say.ps1 -Text "主人，请先处理可达目标点。"
```

---

## 排错

| 症状 | 处理 |
|---|---|
| `No module named xxx` | 用了系统 python；只认 `<引擎目录>\runtime\python.exe` |
| `Address already in use` | `netstat -ano \| findstr 9880`，结束旧进程；SAPI 与 SoVITS 抢同一个端口 |
| 权重 `state_dict` 不匹配 | 引擎不是 v2；换整合包版本 |
| 声音不像 Fairy | 参考音被换了；必须是包里那版 5.62 s、48 kHz 单声道 |
| 开机后没声音 | 看 `D:\Fairy\logs\tts.*.log`；计划任务 `FairyTTS` 是否在跑 |
| `torch.load` 报 weights_only | 没设 `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1` |
| 9890 起不来 | 无伤大雅，只是开屏视频和问候语没有；DSH 启动时会自动补 |

装完记得 `cleanup.ps1`（`-Deep` 连 C 盘缓存一起清）。
