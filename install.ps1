<#
  Fairy 完全体 · 部署器 v1.3
  用法：
    powershell -NoProfile -ExecutionPolicy Bypass -File .\install.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File .\install.ps1 -Root D:\AI\Fairy -GptDir D:\AI\GPT-SoVITS\GPT-SoVITS-v2-240821
    powershell -NoProfile -ExecutionPolicy Bypass -File .\install.ps1 -Voice sapi      # 明说：先不要 GPT
  做的事：验盘 → 复制 → 注入本机路径 → 选语音引擎 → 注册 bundle → 注册计划任务 → 打印后续。
  不联网、不写 C 盘（除了 DSH 自己的 profile 注册）。
#>
[CmdletBinding()]
param(
  [string]$Root   = 'D:\Fairy',
  [string]$GptDir = 'D:\GPT-SoVITS\GPT-SoVITS-v2-240821',
  [ValidateSet('auto', 'sovits', 'sapi', 'none')][string]$Voice = 'auto',
  [switch]$SkipRegister,
  [switch]$NoAutostart,
  [switch]$Force
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = [IO.Path]::GetFullPath($Root).TrimEnd('\')
$GptDir = [IO.Path]::GetFullPath($GptDir).TrimEnd('\')
$unix = $Root -replace '\\', '/'
$enc  = New-Object System.Text.UTF8Encoding($false)
$noBom = New-Object System.Text.UTF8Encoding($false)

function Say($m)  { Write-Host "[Fairy] $m" -ForegroundColor Cyan }
function Warn($m) { Write-Host "[警告] $m" -ForegroundColor Yellow }

# ---------- 0. 体检 ----------
if ($Root -match '^[Cc]:') { throw "否定。拒绝在 C 盘安装：$Root。请用 -Root D:\Fairy。" }
$driveName = ([IO.Path]::GetPathRoot($Root)).TrimEnd('\').TrimEnd(':')
$freeGB = [math]::Round((Get-PSDrive -Name $driveName).Free / 1GB, 1)
if ($freeGB -lt 3) { throw "否定。$driveName 盘只剩 $freeGB GB，装不下 Fairy。" }
if ((Test-Path $Root) -and -not $Force) {
  $foreign = Get-ChildItem $Root -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -in 'persona_learn', 'ui_ref', 'models' }
  if ($foreign) {
    throw "否定。$Root 里已有别的东西（$($foreign.Name -join '、')）。换个 -Root，或加 -Force 硬装。"
  }
}
Say "0/5 目标 $Root · 可用 ${freeGB} GB · 语音引擎 $GptDir"

# ---------- 1. 复制 ----------
Say '1/5 复制载荷'
$null = robocopy $here $Root /E /XO /NFL /NDL /NJH /NJS /XF install.ps1 cleanup.ps1 README.md
if ($LASTEXITCODE -ge 8) { throw "复制失败，robocopy 退出码 $LASTEXITCODE" }
$LASTEXITCODE = 0
foreach ($d in 'logs', 'cache', 'voice\cache', 'voice\out') {
  New-Item -ItemType Directory -Force -Path (Join-Path $Root $d) | Out-Null
}

# ---------- 2. 注入本机路径 ----------
Say '2/5 写入本机路径'
$patched = 0
$exts = '.js', '.mjs', '.py', '.yaml', '.yml', '.json'
Get-ChildItem -Path $Root -Recurse -File |
  Where-Object { $_.Length -lt 5MB -and $exts -contains $_.Extension } |
  ForEach-Object {
    $text = [IO.File]::ReadAllText($_.FullName, [Text.Encoding]::UTF8)
    if ($text.Contains('__FAIRY_ROOT__')) {
      [IO.File]::WriteAllText($_.FullName, $text.Replace('__FAIRY_ROOT__', $unix), $enc)
      $script:patched++
    }
  }
if ($patched -lt 3) { throw "占位替换未命中（$patched 个）。包可能已损坏，请重新解压后再装。" }
Say "  改写 $patched 个文件 → $unix"

# ---------- 3. 语音引擎 ----------
Say '3/5 语音引擎'
$py = Join-Path $GptDir 'runtime\python.exe'
$haveSovits = Test-Path $py
$engine = $Voice
if ($engine -eq 'auto') { $engine = if ($haveSovits) { 'sovits' } else { 'sapi' } }
if ($engine -eq 'sovits' -and -not $haveSovits) {
  Warn "  指定了 sovits，但 $py 不存在 → 先用 SAPI 兜底。装完引擎再跑一次本脚本即可切换。"
  $engine = 'sapi'
}
Say "  引擎 = $engine"

$useCuda = $false
if ($engine -eq 'sovits') {
  try {
    $env:TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD = '1'
    $probe = & $py -c "import torch;print(int(torch.cuda.is_available()))" 2>$null
    $useCuda = ("$probe".Trim() -eq '1')
  } catch { $useCuda = $false }

  $wantYaml = Join-Path $Root $(if ($useCuda) { 'voice\tts_infer.cuda.yaml' } else { 'voice\tts_infer.cpu.yaml' })
  $inferDst = Join-Path $GptDir 'GPT_SoVITS\configs\tts_infer.yaml'
  if ((Test-Path $wantYaml) -and (Test-Path (Split-Path -Parent $inferDst))) {
    if (Test-Path $inferDst) { Copy-Item $inferDst "$inferDst.fairy-bak" -Force }
    $y = [IO.File]::ReadAllText($wantYaml, [Text.Encoding]::UTF8).Replace('__FAIRY_ROOT__', $unix)
    [IO.File]::WriteAllText($inferDst, $y, $noBom)
    Say "  tts_infer.yaml → $(if ($useCuda) { 'cuda/is_half' } else { 'cpu/fp32' })（原文件备份 .fairy-bak）"
  } else {
    Warn '  没找到引擎配置目录，语音权重不会被加载。'
  }
} else {
  Say '  用 Windows 自带语音兜底（零下载）。想要原音色：跑 voice\install_sovits.ps1。'
}

# 独立 node：9890 用安装目录之外的 node 运行，更新时不再锁 DSH 的 exe
$ensureNode = Join-Path $Root 'voice\ensure-node.ps1'
$nodeExe = $null
if (Test-Path -LiteralPath $ensureNode) {
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $ensureNode -Root $Root
  $nodePath = Join-Path $Root 'node\node.exe'
  if (Test-Path -LiteralPath $nodePath) { $nodeExe = "$unix/node/node.exe" }
} else {
  Warn '  缺少 voice\ensure-node.ps1；9890 将回退到 DSH 内置运行时（更新时可能锁 exe）。'
}

$cfg = [ordered]@{
  root     = $unix
  gptDir   = $GptDir -replace '\\', '/'
  engine   = $engine
  nodeExe  = $nodeExe
  refAudio = "$unix/voice/ref/fairy_ref.wav"
  splash   = "$unix/splash"
  cache    = "$unix/voice/cache"
}
[IO.File]::WriteAllText((Join-Path $Root 'skin\fairy.config.json'), ($cfg | ConvertTo-Json), $noBom)

# ---------- 4. 注册 bundle ----------
if (-not $SkipRegister) {
  Say '4/5 注册 DSH bundle'
  $dshHome = Join-Path $env:USERPROFILE '.dsh'
  $profile = Get-ChildItem (Join-Path $dshHome 'profiles') -Directory -ErrorAction SilentlyContinue |
    Where-Object { Test-Path (Join-Path $_.FullName 'package.json') } |
    Sort-Object @{ Expression = { if ($_.Name -eq 'desktop') { 0 } else { 1 } } } |
    Select-Object -First 1

  if (-not $profile) {
    Warn '  没找到 DSH profile。先启动一次 DSH，再重跑本脚本（或加 -SkipRegister）。'
  } else {
    $pkgPath = Join-Path $profile.FullName 'package.json'
    $pkg = Get-Content $pkgPath -Encoding UTF8 -Raw | ConvertFrom-Json
    $bundles = @($pkg.dsh.profile.bundles)
    foreach ($b in '@local/dsh-fairy-preset', '@local/dsh-fairy-skin', '@local/dsh-fairy-voice') {
      if ($bundles -notcontains $b) { $bundles += $b }
    }
    $pkg.dsh.profile.bundles = $bundles
    $pkg.dependencies | Add-Member -Force -NotePropertyName '@local/dsh-fairy-preset' -NotePropertyValue "link:$unix/preset"
    $pkg.dependencies | Add-Member -Force -NotePropertyName '@local/dsh-fairy-skin'   -NotePropertyValue "link:$unix/skin"
    $pkg.dependencies | Add-Member -Force -NotePropertyName '@local/dsh-fairy-voice'  -NotePropertyValue "link:$unix/voice/plugin"
    [IO.File]::WriteAllText($pkgPath, ($pkg | ConvertTo-Json -Depth 12), (New-Object System.Text.UTF8Encoding($false)))
    Say "  已写 $($profile.Name)\package.json"

    $patchPath = Join-Path $profile.FullName 'cordis.patch.yml'
    if (Test-Path $patchPath) {
      $t = [IO.File]::ReadAllText($patchPath, [Text.Encoding]::UTF8)
      if ($t -match 'selectedDefault:\s*\S+') {
        [IO.File]::WriteAllText($patchPath, [regex]::Replace($t, 'selectedDefault:\s*\S+', 'selectedDefault: fairy'), $enc)
        Say '  默认预设 → fairy'
      } else {
        Warn '  cordis.patch.yml 无 selectedDefault；启动后在设置里把默认预设改成「Fairy 模式」。'
      }
    }

    $nm = Join-Path $profile.FullName 'node_modules\@local'
    New-Item -ItemType Directory -Force -Path $nm | Out-Null
    foreach ($pair in @(@('preset', 'dsh-fairy-preset'), @('skin', 'dsh-fairy-skin'), @('voice\plugin', 'dsh-fairy-voice'))) {
      $to = Join-Path $nm $pair[1]
      if (Test-Path $to) { Remove-Item $to -Recurse -Force }
      Copy-Item (Join-Path $Root $pair[0]) $to -Recurse -Force
    }

    $pnpmCmd = Get-Command pnpm -CommandType Application -ErrorAction SilentlyContinue
    $pnpmCjs = Get-ChildItem (Join-Path $dshHome 'dsh-runtimes') -Recurse -Filter 'pnpm.cjs' -File -ErrorAction SilentlyContinue | Select-Object -First 1
    $nodeExe = Get-ChildItem (Join-Path $dshHome 'dsh-runtimes') -Recurse -Filter 'node.exe' -File -ErrorAction SilentlyContinue | Select-Object -First 1
    Push-Location $profile.FullName
    try {
      if ($pnpmCmd) {
        Say '  pnpm install'
        & $pnpmCmd.Source install --prefer-offline 2>&1 | Select-Object -Last 4 | Write-Host
      } elseif ($pnpmCjs -and $nodeExe) {
        Say '  pnpm install（内置 node）'
        & $nodeExe.FullName $pnpmCjs.FullName install --prefer-offline 2>&1 | Select-Object -Last 4 | Write-Host
      } else {
        Warn '  没有 pnpm；已直放 node_modules，多数情况下可用。'
      }
    } catch {
      Warn "  pnpm 失败：$($_.Exception.Message)。bundle 已直放 node_modules，先启动看看。"
    } finally { Pop-Location }
  }
}

# ---------- 5. 计划任务（登录自启，替代手动开窗口） ----------
if (-not $NoAutostart) {
  Say '5/5 计划任务'
  $runDir = Join-Path $Root 'voice'
  $ttsCmd = Join-Path $runDir 'run_tts.cmd'
  $logDir = Join-Path $Root 'logs'
  if ($engine -eq 'sovits') {
    $lines = @(
      '@echo off',
      'set TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1',
      "set HF_HOME=$Root\cache\huggingface",
      "set TORCH_HOME=$Root\cache\torch",
      "cd /d `"$GptDir`"",
      "`"$py`" api_v2.py -a 127.0.0.1 -p 9880 >> `"$logDir\tts.out.log`" 2>> `"$logDir\tts.err.log`""
    )
  } else {
    $lines = @(
      '@echo off',
      "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$Root\voice\sapi_tts.ps1`" -Port 9880 >> `"$logDir\sapi.out.log`" 2>> `"$logDir\sapi.err.log`""
    )
  }
  [IO.File]::WriteAllLines($ttsCmd, $lines, [Text.Encoding]::Default)

  function Ensure-Task($name, $cmd) {
    try {
      $action = New-ScheduledTaskAction -Execute $cmd -WorkingDirectory (Split-Path $cmd)
      $trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
      $trigger.Delay = 'PT15S'
      $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
        -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit ([TimeSpan]::Zero)
      Register-ScheduledTask -TaskName $name -Action $action -Trigger $trigger `
        -Settings $settings -Force -ErrorAction Stop | Out-Null
      Say "  任务 $name → 登录后 15 s 启动 $([IO.Path]::GetFileName($cmd))"
    } catch {
      Warn "  注册任务 $name 失败：$($_.Exception.Message)。可把 $cmd 放进启动目录。"
    }
  }

  if ($engine -ne 'none') { Ensure-Task 'FairyTTS' $ttsCmd }
} else {
  Say '5/5 跳过计划任务（-NoAutostart）'
}

# ---------- 收尾 ----------
Write-Host ''
Say '完成。接下来按顺序：'
Write-Host '  1) 完全退出 DSH（含托盘图标），重新启动'
Write-Host '  2) 新会话 → 预设选择器 → 「Fairy 模式」'
Write-Host '  3) 想听原音色：powershell -NoProfile -File .\voice\install_sovits.ps1'
Write-Host "     装完再跑一次：.\install.ps1 -Voice sovits"
Write-Host '  4) 收尾清临时文件：powershell -NoProfile -File .\cleanup.ps1'
Write-Host ''
Say "授权协议签署完成。语音引擎：$engine。很高兴为您服务。"
