# Fairy 语音引擎一键安装（npm 包 dsh-fairy-voice 附带）
#   powershell -NoProfile -ExecutionPolicy Bypass -File setup-engine.ps1
#   powershell -NoProfile -ExecutionPolicy Bypass -File setup-engine.ps1 -Target D:\AI\GPT-SoVITS -Full
#   powershell -NoProfile -ExecutionPolicy Bypass -File setup-engine.ps1 -PackageZip D:\downloads\GPT-SoVITS-v2-240821.zip

param(
  [string]$Target = (Join-Path $env:LOCALAPPDATA 'fairy-hdd\engine'),
  [string]$Version = 'GPT-SoVITS-v2-240821',
  [string]$PackageZip,
  [switch]$Full,
  [switch]$KeepZip
)

$ErrorActionPreference = 'Stop'
function Say($m) { Write-Host "[Fairy] $m" -ForegroundColor Cyan }
function Warn($m) { Write-Host "[警告] $m" -ForegroundColor Yellow }

$MIRRORS = @('', 'https://gh-proxy.com/', 'https://ghproxy.net/')

function Get-WithMirrors([string]$url, [string]$out) {
  foreach ($prefix in $MIRRORS) {
    $try = $url
    if ($prefix.Length -gt 0 -and $url.StartsWith('https://github.com')) { $try = $prefix + $url }
    try {
      Say "下载 $try"
      $ProgressPreference = 'SilentlyContinue'
      Invoke-WebRequest -Uri $try -OutFile $out -TimeoutSec 1800
      if ((Get-Item $out).Length -gt 1MB) { return }
    } catch {
      Warn "失败：$($_.Exception.Message)"
      Remove-Item $out -Force -ErrorAction SilentlyContinue
    }
  }
  throw '所有镜像都失败了，请手动下载后用 -PackageZip 指定本地文件'
}

# ---------- 1. 引擎 ----------
$python = Join-Path $Target 'runtime\python.exe'
if (Test-Path $python) {
  Say "引擎已存在：$Target"
} else {
  New-Item -ItemType Directory -Force -Path $Target | Out-Null
  if (-not $PackageZip) {
    $PackageZip = Join-Path $env:TEMP ($Version + '.zip')
    if (-not (Test-Path $PackageZip)) {
      $url = 'https://github.com/RVC-Boss/GPT-SoVITS/releases/download/20240821v2/' + $Version + '.zip'
      Get-WithMirrors $url $PackageZip
    }
  } else {
    Say "使用本地压缩包：$PackageZip"
  }
  Say '解压引擎（约 3 GB，需要几分钟）'
  $staging = Join-Path $env:TEMP ('fairy-engine-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
  Expand-Archive -Path $PackageZip -DestinationPath $staging -Force
  $inner = Get-ChildItem $staging -Directory | Select-Object -First 1
  $source = $staging
  if ($inner -and (Test-Path (Join-Path $inner.FullName 'runtime\python.exe'))) { $source = $inner.FullName }
  Copy-Item (Join-Path $source '*') $Target -Recurse -Force
  Remove-Item $staging -Recurse -Force -ErrorAction SilentlyContinue
  if (-not $KeepZip) { Remove-Item $PackageZip -Force -ErrorAction SilentlyContinue }
  Say "引擎就位：$Target"
}

# ---------- 2. 权重 ----------
$weights = Join-Path $Target 'weights'
New-Item -ItemType Directory -Force -Path $weights | Out-Null
$ckpt = Join-Path $weights 'Fairy-e10.ckpt'
$pth = Join-Path $weights 'Fairy_e10_s870.pth'
if ((Test-Path $ckpt) -and (Test-Path $pth)) {
  Say '权重已存在'
} else {
  $bundle = Join-Path $env:TEMP 'Fairy-Complete-v1.3.zip'
  if (-not (Test-Path $bundle)) {
    $u = 'https://github.com/shikelimiao/fairy-hdd-plugin/releases/download/v1.3.0/Fairy-Complete-v1.3.zip'
    Get-WithMirrors $u $bundle
  } else {
    Say "复用已下载的部署包：$bundle"
  }
  Say '从部署包中提取语音权重'
  $tmp = Join-Path $env:TEMP ('fairy-weights-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
  New-Item -ItemType Directory -Force -Path $tmp | Out-Null
  tar -xf $bundle -C $tmp 'Fairy-Complete-v1.3/voice/weights' 2>$null
  Copy-Item (Join-Path $tmp 'Fairy-Complete-v1.3\voice\weights\*') $weights -Force
  Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
  Say '权重就位'
}

# ---------- 3. 推理配置 ----------
$cfgDir = Join-Path $Target 'GPT_SoVITS\configs'
if (Test-Path $cfgDir) {
  $hasCuda = $false
  try {
    $probe = & $python -c 'import torch;print(torch.cuda.is_available())' 2>$null
    if ($probe -eq 'True') { $hasCuda = $true }
  } catch { }
  $yaml = Join-Path $cfgDir 'tts_infer.yaml'
  if (Test-Path $yaml) { Copy-Item $yaml ($yaml + '.fairy-bak') -Force }
  $device = 'cpu'
  $half = 'False'
  if ($hasCuda) { $device = 'cuda'; $half = 'True' }
  $unix = $Target -replace '\\', '/'
  $lines = @(
    'custom:',
    '  bert_base_path: GPT_SoVITS/pretrained_models/chinese-roberta-wwm-ext-large',
    '  cnhuhbert_base_path: GPT_SoVITS/pretrained_models/chinese-hubert-base',
    ('  device: ' + $device),
    ('  is_half: ' + $half),
    ('  t2s_weights_path: ' + $unix + '/weights/Fairy-e10.ckpt'),
    ('  vits_weights_path: ' + $unix + '/weights/Fairy_e10_s870.pth'),
    '  version: v2'
  )
  Set-Content -Path $yaml -Value $lines -Encoding UTF8
  Say ("推理配置：device=" + $device + " is_half=" + $half)
}

# ---------- 4. 可选 CUDA ----------
if ($Full) {
  Say '安装 CUDA 版 torch（约 2.7 GB）'
  & $python -m pip install --upgrade pip
  & $python -m pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu128
}

# ---------- 5. 环境变量与提示 ----------
[Environment]::SetEnvironmentVariable('FAIRY_GPT_DIR', $Target, 'User')
Say ("已设置 FAIRY_GPT_DIR=" + $Target + "（重开终端生效）")
Write-Host ''
Write-Host '下一步：' -ForegroundColor Green
$pythonExe = Join-Path $Target 'runtime\python.exe'
$apiFile = Join-Path $Target 'api_v2.py'
Write-Host ('  1) 启动语音引擎： "{0}" "{1}" -a 127.0.0.1 -p 9880' -f $pythonExe, $apiFile)
Write-Host '  2) 或重启 DSH：语音插件会自动发现引擎并改用 Fairy 音色'
Write-Host '  3) 想先试听：安装部署包并运行 install.ps1 -Voice sovits'
