'use strict';
// Persistenzschicht: JSON-Datei mit atomarem Schreiben hinter einer schmalen
// Repository-Schnittstelle. Bewusst austauschbar – für Produktion würde man hier
// SQLite/Postgres einsetzen, ohne die aufrufende API zu ändern.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { hashPassword, createToken, isExpired } = require('./auth');

// Datenverzeichnis per Env überschreibbar (Deployment-Konfiguration / isolierte Tests).
const DATA_DIR = process.env.MAESTRO_DATA_DIR || path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

function seed() {
  return {
    users: [
      { id: 'anna', email: 'anna@beispiel.de', name: 'Anna Weber', initials: 'AW', role: 'client', trainerId: 'sergio', passwordHash: hashPassword('prototyp') },
      { id: 'sergio', email: 'sergio@maestro-plan.de', name: 'Sergio Maestro', initials: 'SM', role: 'trainer', passwordHash: hashPassword('prototyp') }
    ],
    sessions: {},
    messages: [
      { id: 'm1', from: 'sergio', to: 'anna', text: 'Guten Morgen Anna! Heute steht dein Power-Workout an. Achte bei den Kniebeugen auf einen stabilen Rumpf. 💪', time: '08:12', createdAt: 1 },
      { id: 'm2', from: 'anna', to: 'sergio', text: 'Guten Morgen Sergio! Ich bin bereit. Das Knie fühlt sich heute auch gut an.', time: '08:18', createdAt: 2 },
      { id: 'm3', from: 'sergio', to: 'anna', text: 'Perfekt. Starte kontrolliert und gib mir danach kurz Feedback.', time: '08:20', createdAt: 3 }
    ],
    checkins: [],
    progress: { anna: { sessionsDone: 2, sessionsGoal: 3, totalSessions: 8, adherence: 86, performance: 12 } },
    appointments: { anna: { date: 'Dienstag, 14. Juli', time: '09:30', type: 'Persönlicher Video-Check-in', status: 'Bestätigt' } },
    clients: [
      { name: 'Anna Weber', initials: 'AW', plan: 'Strong Start', adherence: 86, status: 'Aktiv', alert: false, last: 'Heute, 08:18' },
      { name: 'Jonas Klein', initials: 'JK', plan: 'Muscle Pro', adherence: 72, status: 'Check-in offen', alert: true, last: 'Gestern' },
      { name: 'Miriam Roth', initials: 'MR', plan: 'Lady Fit', adherence: 94, status: 'Aktiv', alert: false, last: 'Vor 2 Std.' },
      { name: 'Daniel Vogt', initials: 'DV', plan: 'Back in Motion', adherence: 58, status: 'Training verpasst', alert: true, last: 'Vor 4 Tagen' }
    ]
  };
}

let db;

function load() {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    db = seed();
    persist();
  }
  sweepSessions();
}

// Abgelaufene Sessions entfernen, damit sich in der Datei keine toten Tokens sammeln.
function sweepSessions() {
  let changed = false;
  for (const [token, session] of Object.entries(db.sessions)) {
    if (isExpired(session)) { delete db.sessions[token]; changed = true; }
  }
  if (changed) persist();
}

function persist() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + '.' + crypto.randomBytes(4).toString('hex') + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE); // atomarer Austausch
}

// --- Auth -----------------------------------------------------------------
function findUserByEmail(email) {
  return db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
}
function findUserById(id) { return db.users.find(u => u.id === id); }

function createSession(userId) {
  const token = createToken();
  db.sessions[token] = { userId, createdAt: Date.now() };
  persist();
  return token;
}
function destroySession(token) {
  if (db.sessions[token]) { delete db.sessions[token]; persist(); }
}
function userForToken(token) {
  const session = db.sessions[token];
  if (isExpired(session)) {
    if (session) { delete db.sessions[token]; persist(); }
    return null;
  }
  return findUserById(session.userId) || null;
}

// --- Öffentlicher Zustand (ohne Geheimnisse) ------------------------------
function publicUser(u) {
  return u && { id: u.id, email: u.email, name: u.name, initials: u.initials, role: u.role };
}

// Der Coaching-Datensatz, den beide Rollen teilen. Nachrichten werden pro
// Betrachter als „mine“ markiert.
function stateFor(user) {
  const clientId = user.role === 'client' ? user.id : 'anna';
  return {
    user: publicUser(user),
    messages: db.messages
      .filter(m => m.from === clientId || m.to === clientId)
      .sort((a, b) => a.createdAt - b.createdAt)
      .map(m => ({ mine: m.from === user.id, from: m.from, text: m.text, time: m.time })),
    checkins: db.checkins.slice().sort((a, b) => b.createdAt - a.createdAt),
    progress: db.progress[clientId],
    appointment: db.appointments[clientId] || null,
    clients: db.clients
  };
}

// --- Mutationen -----------------------------------------------------------
let seq = Date.now();
function nextId(prefix) { return prefix + '_' + (++seq).toString(36); }

function addMessage(user, text) {
  const clean = String(text || '').slice(0, 2000).trim();
  if (!clean) throw httpError(400, 'Nachricht darf nicht leer sein');
  const to = user.role === 'client' ? (user.trainerId || 'sergio') : 'anna';
  db.messages.push({ id: nextId('m'), from: user.id, to, text: clean, time: 'Jetzt', createdAt: ++seq });
  persist();
  return stateFor(user);
}

function addCheckin(user, { type, label, note, photo }) {
  const clientId = user.role === 'client' ? user.id : 'anna';
  const client = findUserById(clientId);
  const id = nextId('c');
  const entry = {
    id, clientId, client: client ? client.name : 'Anna Weber',
    type: type === 'meal' ? 'meal' : 'workout',
    label: String(label || '').slice(0, 200), note: String(note || '').slice(0, 500),
    time: 'Gerade eben', createdAt: ++seq
  };
  const photoUrl = storePhoto(id, photo);
  if (photoUrl) entry.photoUrl = photoUrl;
  db.checkins.push(entry);
  persist();
  return stateFor(user);
}

// Speichert ein Base64-Bild aus einem data:-URL sicher ab (Typ-/Größenprüfung,
// serverseitig vergebener Dateiname) und gibt die Abruf-URL zurück.
function storePhoto(id, photo) {
  if (typeof photo !== 'string') return null;
  const m = photo.match(/^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!m) return null;
  const buf = Buffer.from(m[2], 'base64');
  if (!buf.length || buf.length > 4 * 1024 * 1024) return null; // max. 4 MB
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOADS_DIR, id + '.' + ext), buf);
  return 'uploads/' + id + '.' + ext;
}

function patchProgress(user, patch) {
  const clientId = user.role === 'client' ? user.id : 'anna';
  const p = db.progress[clientId] || (db.progress[clientId] = { sessionsDone: 0, sessionsGoal: 3, totalSessions: 0, adherence: 0, performance: 0 });
  for (const key of ['sessionsDone', 'sessionsGoal', 'totalSessions', 'adherence', 'performance']) {
    if (typeof patch[key] === 'number' && Number.isFinite(patch[key])) p[key] = patch[key];
  }
  const roster = db.clients.find(c => c.name === (findUserById(clientId)?.name));
  if (roster) { roster.adherence = p.adherence; roster.last = 'Gerade eben'; }
  persist();
  return stateFor(user);
}

function setAppointment(user, appt) {
  const clientId = user.role === 'client' ? user.id : 'anna';
  db.appointments[clientId] = appt ? {
    date: String(appt.date || '').slice(0, 80),
    time: String(appt.time || '').slice(0, 40),
    type: String(appt.type || 'Persönlicher Video-Check-in').slice(0, 80),
    status: String(appt.status || 'Bestätigt').slice(0, 40)
  } : null;
  persist();
  return stateFor(user);
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = {
  load, seed, sweepSessions,
  findUserByEmail, findUserById,
  createSession, destroySession, userForToken,
  publicUser, stateFor,
  addMessage, addCheckin, patchProgress, setAppointment,
  httpError, DB_FILE, UPLOADS_DIR
};
