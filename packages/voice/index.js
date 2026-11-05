/**
 * Fairy voice — host half.
 *
 * Makes an npm/market install behave like the deployment package:
 *   1. resolves its own package directory (so no absolute path is needed),
 *   2. keeps a local service on 9890 that publishes the runtime config
 *      (`GET /fairy.json`) and proxies `/tts` to the voice engine,
 *   3. starts a voice engine on 9880 when none is running:
 *      GPT-SoVITS if a python install is found, otherwise the bundled SAPI shim.
 *
 * Everything is best effort: a missing engine only mutes playback.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REF = path.join(HERE, 'ref', 'fairy_ref.wav');
const SERVER = path.join(HERE, 'server.mjs');
const SAPI = path.join(HERE, 'scripts', 'sapi_tts.ps1');

const DATA = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'fairy-hdd');
const PROMPT = '了解我会如同主人使唤我一般使唤它，并且让它不敢有怨言。';

const GPT_CANDIDATES = [
  process.env.FAIRY_GPT_DIR,
  'D:/GPT-SoVITS/GPT-SoVITS-v2-240821',
  'C:/GPT-SoVITS/GPT-SoVITS-v2-240821',
  '/opt/GPT-SoVITS/GPT-SoVITS-v2-240821',
].filter(Boolean);

const portOpen = (port, timeout = 700) => new Promise((resolve) => {
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

const launch = (command, args, options) => {
  try {
    const child = spawn(command, args, {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
      ...options,
    });
    child.on('error', () => {});
    child.unref();
  } catch {
    /* missing executable: stay muted */
  }
};

const findGpt = () => GPT_CANDIDATES.find((dir) => {
  try { return fs.existsSync(path.join(dir, 'runtime', 'python.exe')); } catch { return false; }
});

const writeState = () => {
  try {
    fs.mkdirSync(path.join(DATA, 'cache'), { recursive: true });
    const state = {
      refAudio: REF.replace(/\\/g, '/'),
      prompt: PROMPT,
      promptLang: 'zh',
      textLang: 'zh',
      ttsPort: 9880,
      root: HERE.replace(/\\/g, '/'),
      version: 1,
    };
    fs.writeFileSync(path.join(DATA, 'config.json'), JSON.stringify(state, null, 2), 'utf8');
  } catch {
    /* read-only profile: the server falls back to its own defaults */
  }
};

const configAlive = async (port) => {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/fairy.json`, { signal: AbortSignal.timeout(900) });
    return res.ok;
  } catch {
    return false;
  }
};

const ensureServer = async () => {
  // 已有本服务的实例在跑就直接用
  if (await configAlive(9890)) return;
  // 端口被别的程序占用（例如旧版部署包的素材服务）：换到 9891
  const port = (await portOpen(9890)) ? 9891 : 9890;
  launch(process.execPath, [SERVER], {
    env: {
      ...process.env,
      FAIRY_DATA: DATA,
      FAIRY_REF: REF,
      FAIRY_PROMPT: PROMPT,
      FAIRY_PORT: String(port),
      ELECTRON_RUN_AS_NODE: '1',
    },
  });
};

const ensureEngine = async () => {
  if (await portOpen(9880)) return;
  const gpt = findGpt();
  if (gpt) {
    launch(path.join(gpt, 'runtime', 'python.exe'), ['api_v2.py', '-a', '127.0.0.1', '-p', '9880'], {
      cwd: gpt,
      env: { ...process.env, TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD: '1' },
    });
    return;
  }
  if (process.platform === 'win32' && fs.existsSync(SAPI)) {
    launch('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', SAPI, '-Port', '9880'], {});
  }
};

export function apply() {
  writeState();
  ensureServer();
  ensureEngine();
}
