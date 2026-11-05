/**
 * Fairy skin — host half.
 *
 * The npm build ships the boot assets (splash.mp4, background still, greeting wavs),
 * so on first run we copy them into the shared data directory
 * (`%LOCALAPPDATA%\\fairy-hdd`) where the voice package's local service serves them.
 * Everything is best effort — a read-only or missing directory only costs the splash.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(HERE, 'assets');
const DATA = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'fairy-hdd');

const copyIfMissing = (from, to) => {
  try {
    if (!fs.existsSync(from) || fs.existsSync(to)) return false;
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
    return true;
  } catch {
    return false;
  }
};

export function apply() {
  // 71 MB 的拷贝放到下一轮事件循环，避免首次启动阻塞宿主
  setTimeout(() => { try { seed(); } catch { /* ignore */ } }, 800);
}

function seed() {
  try {
    if (!fs.existsSync(ASSETS)) return;
    fs.mkdirSync(path.join(DATA, 'cache'), { recursive: true });

    copyIfMissing(path.join(ASSETS, 'splash.mp4'), path.join(DATA, 'splash.mp4'));
    copyIfMissing(path.join(ASSETS, 'backdrop.png'), path.join(DATA, 'bef142d5-c8c0-4da0-afec-d61c90e18302.png'));

    const cache = path.join(ASSETS, 'cache');
    if (fs.existsSync(cache)) {
      for (const name of fs.readdirSync(cache)) {
        if (!name.toLowerCase().endsWith('.wav')) continue;
        copyIfMissing(path.join(cache, name), path.join(DATA, 'cache', name));
      }
    }
  } catch {
    /* assets are optional */
  }
}
