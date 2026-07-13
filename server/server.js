'use strict';
// The Maestro Plan – Anwendungsserver (ohne externe Abhängigkeiten).
// Serviert das statische Frontend und eine JSON-REST-API unter /api auf einem
// gemeinsamen Origin (kein CORS nötig). Persistenz und Auth in store.js/auth.js.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const store = require('./store');
const { verifyPassword } = require('./auth');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 4173;
const HOST = process.env.HOST || '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf', '.ico': 'image/x-icon'
};

function send(res, status, body, headers = {}) {
  const payload = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, { 'Cache-Control': 'no-store', ...headers });
  res.end(payload);
}
function sendJson(res, status, obj) {
  send(res, status, obj, { 'Content-Type': 'application/json; charset=utf-8' });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > 5 * 1024 * 1024) { reject(store.httpError(413, 'Anfrage zu groß')); req.destroy(); return; }
      data += chunk;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch { reject(store.httpError(400, 'Ungültiges JSON')); }
    });
    req.on('error', reject);
  });
}

function bearer(req) {
  const h = req.headers['authorization'] || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}
function requireUser(req) {
  const user = store.userForToken(bearer(req));
  if (!user) throw store.httpError(401, 'Nicht angemeldet');
  return user;
}

async function handleApi(req, res, pathname) {
  const method = req.method;

  if (pathname === '/api/health' && method === 'GET') {
    return sendJson(res, 200, { ok: true, service: 'maestro-plan', time: Date.now() });
  }

  if (pathname === '/api/login' && method === 'POST') {
    const { email, password } = await readBody(req);
    const user = store.findUserByEmail(email || '');
    if (!user || !verifyPassword(password || '', user.passwordHash)) {
      throw store.httpError(401, 'E-Mail oder Passwort ist falsch');
    }
    const token = store.createSession(user.id);
    return sendJson(res, 200, { token, state: store.stateFor(user) });
  }

  if (pathname === '/api/logout' && method === 'POST') {
    const token = bearer(req);
    if (token) store.destroySession(token);
    return sendJson(res, 200, { ok: true });
  }

  if (pathname === '/api/state' && method === 'GET') {
    return sendJson(res, 200, store.stateFor(requireUser(req)));
  }

  if (pathname === '/api/messages' && method === 'POST') {
    const user = requireUser(req);
    const { text } = await readBody(req);
    return sendJson(res, 201, store.addMessage(user, text));
  }

  if (pathname === '/api/checkins' && method === 'POST') {
    const user = requireUser(req);
    return sendJson(res, 201, store.addCheckin(user, await readBody(req)));
  }

  if (pathname === '/api/progress' && method === 'PATCH') {
    const user = requireUser(req);
    return sendJson(res, 200, store.patchProgress(user, await readBody(req)));
  }

  if (pathname === '/api/appointment' && (method === 'PUT' || method === 'DELETE')) {
    const user = requireUser(req);
    const appt = method === 'DELETE' ? null : await readBody(req);
    return sendJson(res, 200, store.setAppointment(user, appt));
  }

  throw store.httpError(404, 'Endpunkt nicht gefunden');
}

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '') rel = '/index.html';
  // Path-Traversal verhindern
  const filePath = path.normalize(path.join(ROOT, rel));
  if (!filePath.startsWith(ROOT)) return send(res, 403, 'Forbidden');
  fs.readFile(filePath, (err, buf) => {
    if (err) {
      // SPA-Fallback auf die App-Shell
      return fs.readFile(path.join(ROOT, 'index.html'), (e2, shell) =>
        e2 ? send(res, 404, 'Not found') : send(res, 200, shell, { 'Content-Type': MIME['.html'] }));
    }
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, buf, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url.pathname);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
    return serveStatic(req, res, url.pathname);
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    sendJson(res, status, { error: err.message || 'Serverfehler' });
  }
});

store.load();
server.listen(PORT, HOST, () => {
  console.log(`Maestro Plan läuft auf http://${HOST}:${PORT}`);
});

module.exports = server;
