<#
  Fairy 部署收尾 · 清理器
  用法：
    powershell -NoProfile -ExecutionPolicy Bypass -File .\cleanup.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File .\cleanup.ps1 -KeepVoice -DryRun
    powershell -NoProfile -ExecutionPolicy Bypass -File .\cleanup.ps1 -Deep -ExtractDir D:\_fairy_tmp
    powershell -NoProfile -ExecutionPolicy Bypass -File .\cleanup.ps1 -RemoveTasks      # 卸载时顺带注销计划任务
  只清 Fairy / GPT-SoVITS 相关的东西。-Deep 才会动 C 盘上的通用缓存。
#>
[CmdletBinding()]
param(
  [string]$Root = 'D:\Fairy',
  [string]$ExtractDir = 'D:\_fairy_tmp',
  [switch]$KeepVoice,
  [switch]$Deep,
  [switch]$DryRun,
  [switch]$RemoveTasks
)

$ErrorActionPreference = 'SilentlyContinue'
function Say($m)  { Write-Host "[Fairy] $m" -ForegroundColor Cyan }
function Warn($m) { Write-Host "[跳过] $m" -ForegroundColor DarkGray }

$targets = New-Object System.Collections.Generic.List[string]

# 1. 临时目录里的本包残留
foreach ($pattern in 'fairy-*', 'Fairy-*', '_fairy*', 'GPT-SoVITS*') {
  Get-ChildItem (Join-Path $env:TEMP $pattern) -Force | ForEach-Object { $targets.Add($_.FullName) }
}

# 2. 安装日志
Get-ChildItem (Join-Path $Root '*.log') -Force | ForEach-Object { $targets.Add($_.FullName) }
Get-ChildItem (Join-Path $Root 'logs\*.log') -Force | ForEach-Object { $targets.Add($_.FullName) }

# 3. 语音缓存（预生成的问候语，删了会重新生成）
if (-not $KeepVoice) {
  Get-ChildItem (Join-Path $Root 'voice\cache\*.wav') -Force | ForEach-Object { $targets.Add($_.FullName) }
} else {
  Warn '保留 voice\cache（-KeepVoice）'
}

# 4. 解压目录（不能是当前脚本所在目录）
if ($ExtractDir -and (Test-Path $ExtractDir) -and ((Split-Path -Leaf $ExtractDir) -match 'fairy')) {
  if ([IO.Path]::GetFullPath($ExtractDir) -ne [IO.Path]::GetFullPath((Get-Location).Path)) {
    $targets.Add([IO.Path]::GetFullPath($ExtractDir))
  } else {
    Warn "当前就在 $ExtractDir 里，无法自删；退出后执行：Remove-Item $ExtractDir -Recurse -Force"
  }
}

# 5. 缓存与临时下载（安装器自己用的，都在 D 盘）
foreach ($p in (Join-Path $Root 'cache\pip'), (Join-Path $Root '_dl'), (Join-Path $Root 'tools\*.tmp')) {
  Get-Item $p -Force | ForEach-Object { $targets.Add($_.FullName) }
  Get-ChildItem $p -Force | ForEach-Object { $targets.Add($_.FullName) }
}

# 6. C 盘缓存（显式 -Deep 才动）
if ($Deep) {
  $targets.Add((Join-Path $env:LOCALAPPDATA 'pip\cache'))
  $targets.Add((Join-Path $env:USERPROFILE '.cache\huggingface'))
  $targets.Add((Join-Path $env:USERPROFILE '.cache\torch'))
  Get-ChildItem (Join-Path $env:TEMP 'pip-*') -Force | ForEach-Object { $targets.Add($_.FullName) }
}

# ---------- 统计 ----------
$bytes = 0
$list = @()
foreach ($p in ($targets | Select-Object -Unique)) {
  if (-not (Test-Path $p)) { continue }
  $item = Get-Item $p -Force
  $size = if ($item.PSIsContainer) {
    (Get-ChildItem $p -Recurse -File -Force | Measure-Object Length -Sum).Sum
  } else { $item.Length }
  $bytes += [int64]$size
  $list += [pscustomobject]@{ Path = $p; MB = [math]::Round($size / 1MB, 2) }
}

if ($list.Count -eq 0) { Say '没有可清理的东西。' }
else {
  Say ("待清理 {0} 项，共 {1} MB" -f $list.Count, [math]::Round($bytes / 1MB, 1))
  foreach ($row in $list) { Write-Host ("  {0,10} MB  {1}" -f $row.MB, $row.Path) -ForegroundColor DarkGray }
  if ($DryRun) { Say '-DryRun：什么都没删。'; return }
  foreach ($row in $list) { Remove-Item $row.Path -Recurse -Force }
  Say ("已释放 {0} MB" -f [math]::Round($bytes / 1MB, 1))
}

# ---------- 计划任务 ----------
if ($RemoveTasks) {
  foreach ($name in 'FairyTTS', 'FairyAssets') {
    if (Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue) {
      try {
        Unregister-ScheduledTask -TaskName $name -Confirm:$false -ErrorAction Stop
        Say "已注销计划任务 $name"
      } catch { Write-Host "[跳过] 注销 $name 失败：$($_.Exception.Message)" -ForegroundColor DarkGray }
    }
  }
}

Say '清理完成。D 盘上的 Fairy 本体与权重不受影响。'
