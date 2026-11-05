/**
 * Fairy voice — local service (127.0.0.1:9890).
 *
 *   GET  /fairy.json   runtime config for client plugins (ref audio path, prompt, ports)
 *   ANY  /tts          CORS proxy to the voice engine on 9880
 *   GET  /cache/<name> greeting wavs produced by the deployment package (optional)
 *   GET  /splash.mp4   boot video when the deployment assets are present (optional)
 *   GET  /             tiny status page
 */
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.FAIRY_PORT || 9890);
const TTS_PORT = 9880;
const DATA = process.env.FAIRY_DATA || path.join(process.env.LOCALAPPDATA || os.homedir(), 'fairy-hdd');
const REF = process.env.FAIRY_REF || path.join(HERE, 'ref', 'fairy_ref.wav');
const PROMPT = process.env.FAIRY_PROMPT || '了解我会如同主人使唤我一般使唤它，并且让它不敢有怨言。';

const readState = () => {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA, 'config.json'), 'utf8'));
  } catch {
    return {};
  }
};

const sendJson = (res, code, value) => {
  const body = JSON.stringify(value);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
};

const sendFile = (res, file, type) => {
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*', 'Content-Length': data.length });
    res.end(data);
  });
};

const MIME = {
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8',
};

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    });
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);

  if (url.pathname === '/fairy.json') {
    const state = readState();
    sendJson(res, 200, {
      refAudio: state.refAudio || REF.replace(/\\/g, '/'),
      prompt: state.prompt || PROMPT,
      ttsPort: TTS_PORT,
      root: HERE.replace(/\\/g, '/'),
      splash: fs.existsSync(path.join(DATA, 'splash.mp4')) ? 'http://127.0.0.1:9890/splash.mp4' : null,
      greeting: (index) => `http://127.0.0.1:9890/cache/greet_${index}.wav`,
      version: 1,
    });
    return;
  }

  if (url.pathname === '/tts') {
    const target = `http://127.0.0.1:${TTS_PORT}${req.url || ''}`;
    const upstream = http.request(target, {
      method: req.method,
      headers: { ...req.headers, host: `127.0.0.1:${TTS_PORT}` },
    }, (up) => {
      res.writeHead(up.statusCode || 502, {
        ...up.headers,
        'Access-Control-Allow-Origin': '*',
      });
      up.pipe(res);
    });
    upstream.on('error', () => sendJson(res, 502, { error: 'voice engine unreachable', port: TTS_PORT }));
    req.pipe(upstream);
    return;
  }

  if (url.pathname === '/cache/' || url.pathname.startsWith('/cache/')) {
    const name = path.basename(url.pathname);
    sendFile(res, path.join(DATA, 'cache', name), 'audio/wav');
    return;
  }

  if (url.pathname === '/splash.mp4') {
    sendFile(res, path.join(DATA, 'splash.mp4'), 'video/mp4');
    return;
  }

  if (url.pathname === '/ref/fairy_ref.wav') {
    sendFile(res, REF, 'audio/wav');
    return;
  }

  if (url.pathname === '/') {
    sendJson(res, 200, { service: 'fairy-hdd', data: DATA, ref: REF, docs: '/fairy.json' });
    return;
  }

  const ext = path.extname(url.pathname);
  if (MIME[ext]) {
    sendFile(res, path.join(DATA, path.basename(url.pathname)), MIME[ext]);
    return;
  }

  res.writeHead(404);
  res.end('not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('fairy voice service on', PORT);
});
