#!/usr/bin/env node
// dsh-fairy-setup — 一键准备 Fairy 语音引擎
//   npx dsh-fairy-setup            （下载引擎 + 权重，CPU 推理）
//   npx dsh-fairy-setup --full     （额外安装 CUDA 版 torch）
//   npx dsh-fairy-setup --target D:\AI\GPT-SoVITS
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(here, '..', 'scripts', 'setup-engine.ps1');

if (!fs.existsSync(script)) {
  console.error('找不到 setup-engine.ps1（包可能不完整）');
  process.exit(1);
}

const args = process.argv.slice(2);
const forwarded = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--target' || args[i] === '-Target') {
    forwarded.push('-Target', args[i + 1]);
    i += 1;
  } else if (args[i] === '--full' || args[i] === '-Full') {
    forwarded.push('-Full');
  } else if (args[i] === '--zip' || args[i] === '-PackageZip') {
    forwarded.push('-PackageZip', args[i + 1]);
    i += 1;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log('用法: dsh-fairy-setup [--target <目录>] [--zip <本地 GPT-SoVITS 压缩包>] [--full]');
    process.exit(0);
  }
}

console.log('[Fairy] 启动引擎安装脚本（PowerShell）…');
const result = spawnSync('powershell.exe', [
  '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, ...forwarded,
], { stdio: 'inherit' });

process.exit(result.status ?? 1);
