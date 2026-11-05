# 更新安全：为什么 DSH 更新会「没反应」，以及 v1.2.2 怎么修

> 适用：Fairy 完全体 v1.2.2 及以后 · DSH 0.2.x
> 关键词：electron-updater / NSIS 静默安装 / detached 子进程 / 文件锁

## 一、现象

在 DSH 里点「重启并安装」后：

- 应用关掉了，很久没有回来；
- 或者回来了，但版本号还是旧的；
- 更新缓存里能看到完整的安装包：
  `%LOCALAPPDATA%\@deepseek-aidsh-desktop-updater\pending\*.exe`

v1.2.1 及更早的 Fairy 包会稳定触发这个问题。

## 二、根因

```text
9890 素材/代理服务
  └─ 由 Fairy 的宿主插件在 App 启动时拉起
       ├─ 旧做法：spawn(process.execPath, [serve_assets.mjs])
       │            + ELECTRON_RUN_AS_NODE=1
       │            → 进程映像 = DeepSeek Harness.exe
       └─ detached: true + unref()
            → App 退出后它不退出
                 → 锁住安装目录里的 DeepSeek Harness.exe
                      → NSIS 静默安装检查「应用仍在运行」
                           → 直接中止，不弹窗
                                → 用户看到「没反应」
```

两个关键点：

1. **镜像本体**：拿 Electron 主程序当 node 用，进程名和路径都是 `DeepSeek Harness.exe`，
   Windows 会对运行中的 exe 映像加删除/覆盖锁。
2. **活过 App**：`detached: true` 让它不受父进程退出影响。
   结果 App 关掉了，锁还在。

`electron-updater` 在 Windows 上调用 NSIS 的 `--updated` 静默模式，
预检用进程名判定；一个无窗口的同名残留进程足以让它判定失败并静默退出。

## 三、v1.2.2 的改法

### 1. 独立 node 运行时

把 `node.exe` 复制到**安装目录之外**：

```text
<Root>\node\node.exe          ← 部署包方式（install.ps1 自动准备）
或
D:\DeepSeek\fairy-runtime\node.exe   ← 本机方式
```

它不随 DSH 更新被替换，也不锁 DSH 的任何文件。
9890 改成用这份 node 启动，进程名是 `node.exe`。

### 2. 解析顺序（找不到就回退）

```js
cfg.nodeExe                 // fairy.config.json 里写死的绝对路径
<Root>/node/node.exe        // 部署包默认位置
$FAIRY_NODE                 // 环境变量（本机 / 便携场景）
process.execPath            // 都没有时的旧行为，保证能跑
```

回退分支保留 `ELECTRON_RUN_AS_NODE=1`，所以**没装 node 的机器依然能用**，
只是那台机器更新 DSH 前需要手动结束残留进程。

### 3. 安装器自动准备

`voice\ensure-node.ps1`：

```text
%FAIRY_NODE%
→ 运行中的 DSH 自带 runtime（resources\runtime\primary-runtime\dependencies\node\bin\node.exe）
→ ~\.dsh\dsh-runtimes\**\node.exe
→ PATH 里的 node
```

`install.ps1` 在写 `skin\fairy.config.json` 之前调用它，并把结果写进 `nodeExe`。

## 四、文件清单

| 文件 | 改动 |
|---|---|
| `skin\index.js` | `launch()` 里 9890 分支优先用 `NODE`，新增 `resolveNode()` |
| `voice\ensure-node.ps1` | 新增，准备独立 node |
| `install.ps1` | 调用 ensure-node，`fairy.config.json` 增加 `nodeExe` |
| `docs\UPDATER-SAFE.md` | 本文件 |
| `docs\CHANGELOG-1.2.md` | v1.2.2 条目 |

## 五、验证

装完之后：

```powershell
# 1) 9890 应该由 node.exe 持有，而不是 DeepSeek Harness.exe
Get-NetTCPConnection -State Listen -LocalPort 9890 |
  ForEach-Object { Get-Process -Id $_.OwningProcess | Select-Object Id,ProcessName,Path }

# 期望：ProcessName = node，Path = <Root>\node\node.exe
```

```powershell
# 2) 关掉 DSH 后，确认没有残留的 DeepSeek Harness.exe
Get-Process 'DeepSeek Harness' -ErrorAction SilentlyContinue

# 期望：空
```

```powershell
# 3) 再检查一次安装包有没有被锁
$exe = (Get-Process 'DeepSeek Harness').Path
try { $fs=[IO.File]::Open($exe,'Open','ReadWrite','None'); $fs.Close(); 'FREE' } catch { 'LOCKED' }
```

## 六、更新 DSH 的正确顺序

1. 应用内点「重启并安装」，或退出后手动运行
   `%LOCALAPPDATA%\@deepseek-aidsh-desktop-updater\pending\<版本>.exe`；
2. 装完再启动 DSH；
3. Fairy 的宿主插件会自动探测 9880/9890，缺哪个补哪个。

如果更新仍然失败，按顺序排查：

```powershell
# 有没有同名残留
Get-CimInstance Win32_Process -Filter "Name='DeepSeek Harness.exe'" |
  Select-Object ProcessId,ParentProcessId,CommandLine

# 安装包是否完整
Get-ChildItem "$env:LOCALAPPDATA\@deepseek-aidsh-desktop-updater\pending"
```

## 七、别踩的坑

- **不要把 node.exe 放进 DSH 安装目录**：一样会被更新覆盖/锁定。
- **不要用 `detached` 去跑任何来自安装目录的可执行文件**：这正是本次事故的成因。
- **PS 5.1 的 `.ps1` 必须是 UTF-8 with BOM**：v1.2 的包在重新生成时丢过 BOM，
  中文会按 GBK 解析，语法直接报错。`build_v12.mjs` 写文件时要显式带 BOM。
