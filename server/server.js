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

// Sicherheits-Header für alle Antworten. CSP erlaubt eigene Skripte/Styles,
// data:/blob:-Bilder (Mahlzeitenfotos) und keine Framing durch Dritte.
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ')
};

function send(res, status, body, headers = {}) {
  const payload = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, { 'Cache-Control': 'no-store', ...SECURITY_HEADERS, ...headers });
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

// In-Memory-Rate-Limit gegen Brute-Force: es zählen nur FEHLversuche pro IP,
// ein erfolgreicher Login setzt den Zähler zurück (kein Aussperren legitimer
// Nutzer hinter geteilten IPs/NAT).
const loginAttempts = new Map();
const RL_WINDOW = 5 * 60 * 1000;
const RL_MAX = 8;
const clientIp = req => req.socket.remoteAddress || 'unknown';
function checkLoginRate(req) {
  const rec = loginAttempts.get(clientIp(req));
  if (rec && Date.now() <= rec.resetAt && rec.count >= RL_MAX) {
    throw store.httpError(429, 'Zu viele Anmeldeversuche. Bitte später erneut versuchen.');
  }
}
function recordLoginFailure(req) {
  const ip = clientIp(req);
  const now = Date.now();
  const rec = loginAttempts.get(ip);
  if (!rec || now > rec.resetAt) loginAttempts.set(ip, { count: 1, resetAt: now + RL_WINDOW });
  else rec.count += 1;
}
function recordLoginSuccess(req) { loginAttempts.delete(clientIp(req)); }
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
    checkLoginRate(req);
    const { email, password } = await readBody(req);
    const user = store.findUserByEmail(email || '');
    if (!user || !verifyPassword(password || '', user.passwordHash)) {
      recordLoginFailure(req);
      throw store.httpError(401, 'E-Mail oder Passwort ist falsch');
    }
    recordLoginSuccess(req);
    const token = store.createSession(user.id);
    return sendJson(res, 200, { token, state: store.stateFor(user) });
  }

  if (pathname === '/api/register' && method === 'POST') {
    checkLoginRate(req);
    const { email, name, password, consent } = await readBody(req);
    const emailOk = typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk || typeof name !== 'string' || name.trim().length < 2) {
      recordLoginFailure(req); throw store.httpError(400, 'Bitte gültigen Namen und eine E-Mail-Adresse angeben');
    }
    if (typeof password !== 'string' || password.length < 8) {
      recordLoginFailure(req); throw store.httpError(400, 'Passwort muss mindestens 8 Zeichen haben');
    }
    if (consent !== true) throw store.httpError(400, 'Bitte stimme der Verarbeitung deiner Daten zu');
    if (store.findUserByEmail(email)) throw store.httpError(409, 'Für diese E-Mail existiert bereits ein Konto');
    const user = store.registerClient({ email, name, password, consentAt: new Date().toISOString() });
    const token = store.createSession(user.id);
    return sendJson(res, 201, { token, state: store.stateFor(user) });
  }

  if (pathname === '/api/me/export' && method === 'GET') {
    const user = requireUser(req);
    return send(res, 200, store.exportData(user), {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="maestro-plan-export.json"'
    });
  }

  if (pathname === '/api/me' && method === 'DELETE') {
    const user = requireUser(req);
    if (user.role !== 'client') throw store.httpError(403, 'Nur Kundenkonten können sich hier selbst löschen');
    store.deleteAccount(user);
    const token = bearer(req);
    if (token) store.destroySession(token);
    return sendJson(res, 200, { ok: true });
  }

  if (pathname === '/api/password/forgot' && method === 'POST') {
    const { email } = await readBody(req);
    const token = store.createResetToken(email || '');
    // In Produktion geht der Link per E-Mail raus (hier bewusst nur geloggt/gestubbt).
    if (token) console.log(`[Passwort-Reset] Link für ${email}: /reset?token=${token}`);
    const body = { ok: true }; // immer neutral antworten (keine Konto-Enumeration)
    if (process.env.MAESTRO_DEV === '1' && token) body.devToken = token;
    return sendJson(res, 200, body);
  }

  if (pathname === '/api/password/reset' && method === 'POST') {
    const { token, password } = await readBody(req);
    if (typeof password !== 'string' || password.length < 8) throw store.httpError(400, 'Passwort muss mindestens 8 Zeichen haben');
    store.resetPassword(token, password);
    return sendJson(res, 200, { ok: true });
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
    const { text, to } = await readBody(req);
    return sendJson(res, 201, store.addMessage(user, text, to));
  }

  const clientMatch = pathname.match(/^\/api\/clients\/([A-Za-z0-9_-]+)$/);
  if (clientMatch && method === 'GET') {
    const user = requireUser(req);
    if (user.role !== 'trainer') throw store.httpError(403, 'Nur für Trainer');
    return sendJson(res, 200, store.clientDetail(user, clientMatch[1]));
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

// Hochgeladene Mahlzeitenfotos aus dem (ansonsten gesperrten) data/uploads-Ordner.
// Dateinamen sind serverseitig vergeben; nur der Basename wird verwendet.
function serveUpload(res, pathname) {
  const name = path.basename(decodeURIComponent(pathname.slice('/uploads/'.length)));
  if (!/^[A-Za-z0-9_.-]+\.(png|jpg|jpeg|webp)$/.test(name)) return send(res, 404, 'Not found');
  fs.readFile(path.join(store.UPLOADS_DIR, name), (err, buf) => {
    if (err) return send(res, 404, 'Not found');
    send(res, 200, buf, { 'Content-Type': MIME[path.extname(name).toLowerCase()] || 'application/octet-stream' });
  });
}

// Interne Pfade nie ausliefern (DB mit Passwort-Hashes/Tokens, Servercode, Dotfiles).
const STATIC_DENY = /^\/(data|server|node_modules|\.git)(\/|$)|\/\.[^/]/;

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '') rel = '/index.html';
  if (STATIC_DENY.test(rel)) return send(res, 403, 'Forbidden');
  // Path-Traversal verhindern
  const filePath = path.normalize(path.join(ROOT, rel));
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) return send(res, 403, 'Forbidden');
  fs.readFile(filePath, (err, buf) => {
    if (err) {
      // Verzeichnis (EISDIR) oder unbekannter Pfad → SPA-Fallback auf die App-Shell
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
    if (url.pathname.startsWith('/uploads/')) return serveUpload(res, url.pathname);
    return serveStatic(req, res, url.pathname);
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    sendJson(res, status, { error: err.message || 'Serverfehler' });
  }
});

store.load();
// Abgelaufene Sessions regelmäßig aufräumen (stündlich).
const sweepTimer = setInterval(() => store.sweepSessions(), 60 * 60 * 1000);
sweepTimer.unref?.();

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`Maestro Plan läuft auf http://${HOST}:${PORT}`);
  });
}

module.exports = server;
