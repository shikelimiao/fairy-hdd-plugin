<#
  Fairy · SAPI 应急语音端点
  在 127.0.0.1:9880 上提供与 GPT-SoVITS 同形的 /tts 接口，声源是 Windows 自带语音。
  用途：没装 GPT-SoVITS 时先让皮肤"能出声"，零下载、零显存。
  必须用 Windows PowerShell 5.1 跑（powershell.exe），pwsh 7 默认没装 System.Speech。

  用法：
    powershell -NoProfile -ExecutionPolicy Bypass -File .\sapi_tts.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File .\sapi_tts.ps1 -Port 9881 -MaxRequests 1
#>
[CmdletBinding()]
param(
  [int]$Port = 9880,
  [string]$Voice = '',
  [int]$Rate = -2,            # -10..10，负数更慢更像播报
  [int]$MaxRequests = 0       # 0 = 常驻
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech | Out-Null

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
if (-not $Voice) {
  $zh = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -like 'zh*' } |
    Sort-Object @{ Expression = { if ($_.VoiceInfo.Gender -eq 'Female') { 0 } else { 1 } } } |
    Select-Object -First 1
  if ($zh) { $Voice = $zh.VoiceInfo.Name }
}
if ($Voice) { $synth.SelectVoice($Voice) } else { Write-Warning '没有中文语音，将用系统默认音色。' }
$synth.Rate = $Rate
Write-Host "[sapi] 端口 $Port 已就绪 · 音色 $Voice · rate $Rate"

$listener = New-Object System.Net.Sockets.TcpListener([Net.IPAddress]::Loopback, $Port)
$listener.Start()
$served = 0

function Send-Bytes($stream, [byte[]]$bytes) {
  if ($bytes.Length -gt 0) { $stream.Write($bytes, 0, $bytes.Length) }
  $stream.Flush()
}

function Send-Response($stream, [string]$status, [string]$type, [byte[]]$body) {
  $head = "HTTP/1.1 $status`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`n" +
          "Access-Control-Allow-Origin: *`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
  Send-Bytes $stream ([Text.Encoding]::ASCII.GetBytes($head))
  Send-Bytes $stream $body
}

# 读完整一个请求：先读到头部结束，再按 Content-Length 以**字节**为单位补齐 body
function Read-Request($stream) {
  $ms = New-Object System.IO.MemoryStream
  $buf = New-Object byte[] 65536
  $read = $stream.Read($buf, 0, $buf.Length)
  if ($read -le 0) { return $null }
  $ms.Write($buf, 0, $read)
  $all = $ms.ToArray()

  $headEnd = [Text.Encoding]::ASCII.GetString($all).IndexOf("`r`n`r`n")
  $tries = 0
  while ($headEnd -lt 0 -and $tries -lt 20) {
    $read = $stream.Read($buf, 0, $buf.Length)
    if ($read -le 0) { break }
    $ms.Write($buf, 0, $read)
    $all = $ms.ToArray()
    $headEnd = [Text.Encoding]::ASCII.GetString($all).IndexOf("`r`n`r`n")
    $tries++
  }
  $ms.Dispose()
  if ($headEnd -lt 0) { return $null }

  $head = [Text.Encoding]::UTF8.GetString($all, 0, $headEnd)
  $bodyStart = $headEnd + 4
  $cl = 0
  foreach ($line in ($head -split "`r`n")) {
    if ($line -match '^(?i)content-length:\s*(\d+)') { $cl = [int]$matches[1] }
  }
  $have = $all.Length - $bodyStart
  while ($have -lt $cl -and $tries -lt 40) {
    $read = $stream.Read($buf, 0, $buf.Length)
    if ($read -le 0) { break }
    $ms2 = New-Object System.IO.MemoryStream
    $ms2.Write($all, 0, $all.Length)
    $ms2.Write($buf, 0, $read)
    $all = $ms2.ToArray()
    $ms2.Dispose()
    $have = $all.Length - $bodyStart
    $tries++
  }
  $bodyText = ''
  if ($cl -gt 0 -and $have -gt 0) {
    $bodyText = [Text.Encoding]::UTF8.GetString($all, $bodyStart, [Math]::Min($cl, $have))
  }
  return [pscustomobject]@{ Head = $head; Body = $bodyText }
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $stream.ReadTimeout = 15000
      $req = Read-Request $stream
      if (-not $req) { continue }

      $requestLine = ($req.Head -split "`r`n")[0]
      $parts = $requestLine -split ' '
      if ($parts.Count -lt 2) { continue }
      $target = $parts[1]

      $path = ($target -split '\?')[0]
      $query = @{}
      if ($target.Contains('?')) {
        foreach ($pair in ($target -split '\?')[1] -split '&') {
          if (-not $pair) { continue }
          $kv = $pair -split '=', 2
          $key = [Uri]::UnescapeDataString($kv[0])
          $val = if ($kv.Count -gt 1) { [Uri]::UnescapeDataString($kv[1].Replace('+', ' ')) } else { '' }
          $query[$key] = $val
        }
      }

      if ($path -in '/', '/health', '/control', '/set_gpt_weights', '/set_sovits_weights') {
        Send-Response $stream '200 OK' 'text/plain' ([Text.Encoding]::UTF8.GetBytes('{"status":"ok","engine":"sapi"}'))
        continue
      }

      $text = $query['text']
      if (-not $text -and $req.Body) {
        try {
          $json = $req.Body | ConvertFrom-Json
          $text = $json.text
          if ($json.speed_factor -and [double]$json.speed_factor -ne 1.0) {
            $synth.Rate = [Math]::Max(-10, [Math]::Min(10, [int]($Rate * [double]$json.speed_factor)))
          }
        } catch { $text = $req.Body }
      }
      if ($path -ne '/tts' -or -not $text) {
        Send-Response $stream '404 Not Found' 'text/plain' ([Text.Encoding]::UTF8.GetBytes('not found'))
        continue
      }

      $ms = New-Object System.IO.MemoryStream
      $synth.SetOutputToWaveStream($ms)
      $synth.Speak([string]$text)
      $synth.SetOutputToNull()
      $wav = $ms.ToArray()
      $ms.Dispose()
      Send-Response $stream '200 OK' 'audio/wav' $wav
      $served++
      if ($MaxRequests -gt 0 -and $served -ge $MaxRequests) { break }
    } catch {
      Write-Warning "[sapi] 请求失败：$($_.Exception.Message)"
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
  $synth.Dispose()
  Write-Host "[sapi] 已停止，服务 $served 次"
}
