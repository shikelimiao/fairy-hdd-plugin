/**
 * Fairy skin — host half. Renders nothing; only keeps the two local services alive:
 *   9880  GPT-SoVITS voice API (Fairy timbre)
 *   9890  splash / greeting asset server
 * Paths come from fairy.config.json next to this file (written by install.ps1).
 * A missing engine or missing script is skipped silently — the skin still works, muted.
 *
 * 更新安全（v1.3）：9890 以独立 node.exe 运行（nodeExe → <root>/node/node.exe → $FAIRY_NODE），
 * 不再借用 DeepSeek Harness.exe，避免 detached 进程在 app 退出后锁死安装目录、
 * 让 electron-updater 的静默安装静默失败。
 */
import { spawn } from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULTS = { root: 'D:/Fairy', gptDir: 'D:/GPT-SoVITS/GPT-SoVITS-v2-240821' };

let cfg = { ...DEFAULTS };
try {
  cfg = { ...DEFAULTS, ...JSON.parse(fs.readFileSync(path.join(HERE, 'fairy.config.json'), 'utf8')) };
} catch {
  /* first run without config: fall back to defaults */
}

const server = path.join(cfg.root, 'voice', 'serve_assets.mjs');
const python = path.join(cfg.gptDir, 'runtime', 'python.exe');

/** Standalone node runtime outside the DSH install dir — safe to keep running across updates. */
function resolveNode() {
  const candidates = [
    cfg.nodeExe,
    path.join(cfg.root, 'node', 'node.exe'),
    process.env.FAIRY_NODE,
    'D:/DeepSeek/fairy-runtime/node.exe',
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {
      /* unreadable path: try the next one */
    }
  }
  return null;
}

const NODE = resolveNode();

const SERVICES = [
  {
    port: 9880,
    ready: fs.existsSync(python),
    command: python,
    args: ['api_v2.py', '-a', '127.0.0.1', '-p', '9880'],
    cwd: cfg.gptDir,
  },
  {
    port: 9890,
    ready: fs.existsSync(server),
    script: server,
    cwd: path.dirname(server),
  },
];

function portOpen(port, timeout = 900) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port });
    let settled = false;
    const finish = (open) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(open);
    };
    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
    setTimeout(() => finish(false), timeout);
  });
}

function launch(service) {
  const env = { ...process.env };
  let command = service.command;
  let args = service.args ? [...service.args] : [];
  if (service.script) {
    if (NODE) {
      command = NODE;
      args = [service.script, ...args];
    } else {
      // fallback: the pre-1.3 behaviour (locks the app exe during updates)
      command = process.execPath;
      args = [service.script, ...args];
      env.ELECTRON_RUN_AS_NODE = '1';
    }
  }
  const child = spawn(command, args, {
    cwd: service.cwd,
    env,
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.on('error', () => {});
  child.unref();
}

export function apply() {
  for (const service of SERVICES) {
    if (!service.ready) continue;
    portOpen(service.port).then((open) => {
      if (!open) launch(service);
    }).catch(() => {});
  }
}
