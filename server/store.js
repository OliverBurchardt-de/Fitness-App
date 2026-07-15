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
  const pw = hashPassword('prototyp');
  const clientSeeds = [
    { id: 'anna',   email: 'anna@beispiel.de',   name: 'Anna Weber',   initials: 'AW', plan: 'Strong Start',   status: 'Aktiv',            alert: false, last: 'Heute, 08:18' },
    { id: 'jonas',  email: 'jonas@beispiel.de',  name: 'Jonas Klein',  initials: 'JK', plan: 'Muscle Pro',     status: 'Check-in offen',   alert: true,  last: 'Gestern' },
    { id: 'miriam', email: 'miriam@beispiel.de', name: 'Miriam Roth',  initials: 'MR', plan: 'Lady Fit',       status: 'Aktiv',            alert: false, last: 'Vor 2 Std.' },
    { id: 'daniel', email: 'daniel@beispiel.de', name: 'Daniel Vogt',  initials: 'DV', plan: 'Back in Motion', status: 'Training verpasst', alert: true, last: 'Vor 4 Tagen' }
  ];
  const users = [
    { id: 'sergio', email: 'sergio@maestro-plan.de', name: 'Sergio Maestro', initials: 'SM', role: 'trainer', passwordHash: pw },
    ...clientSeeds.map(c => ({ ...c, role: 'client', trainerId: 'sergio', passwordHash: pw }))
  ];
  return {
    users,
    sessions: {},
    messages: [
      { id: 'm1', from: 'sergio', to: 'anna', text: 'Guten Morgen Anna! Heute steht dein Power-Workout an. Achte bei den Kniebeugen auf einen stabilen Rumpf. 💪', time: '08:12', createdAt: 1 },
      { id: 'm2', from: 'anna', to: 'sergio', text: 'Guten Morgen Sergio! Ich bin bereit. Das Knie fühlt sich heute auch gut an.', time: '08:18', createdAt: 2 },
      { id: 'm3', from: 'sergio', to: 'anna', text: 'Perfekt. Starte kontrolliert und gib mir danach kurz Feedback.', time: '08:20', createdAt: 3 },
      { id: 'm4', from: 'jonas', to: 'sergio', text: 'Kannst du dir meinen Plan nochmal ansehen?', time: 'Gestern', createdAt: 4 },
      { id: 'm5', from: 'miriam', to: 'sergio', text: 'Training erledigt! 💪', time: 'Vor 2 Std.', createdAt: 5 }
    ],
    checkins: [],
    progress: {
      anna:   { sessionsDone: 2, sessionsGoal: 3, totalSessions: 8,  adherence: 86, performance: 12 },
      jonas:  { sessionsDone: 1, sessionsGoal: 4, totalSessions: 15, adherence: 72, performance: 9 },
      miriam: { sessionsDone: 3, sessionsGoal: 3, totalSessions: 22, adherence: 94, performance: 15 },
      daniel: { sessionsDone: 0, sessionsGoal: 3, totalSessions: 5,  adherence: 58, performance: 4 }
    },
    appointments: {
      anna: { date: 'Dienstag, 14. Juli', time: '09:30', type: 'Persönlicher Video-Check-in', status: 'Bestätigt' },
      jonas: null, miriam: null, daniel: null
    },
    resets: {}
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

function persist() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + '.' + crypto.randomBytes(4).toString('hex') + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE); // atomarer Austausch
}

// Abgelaufene Sessions entfernen, damit sich in der Datei keine toten Tokens sammeln.
function sweepSessions() {
  let changed = false;
  for (const [token, session] of Object.entries(db.sessions)) {
    if (isExpired(session)) { delete db.sessions[token]; changed = true; }
  }
  if (changed) persist();
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

// --- Helfer ---------------------------------------------------------------
function publicUser(u) {
  return u && { id: u.id, email: u.email, name: u.name, initials: u.initials, role: u.role };
}
function clientsOf(trainerId) {
  return db.users.filter(u => u.role === 'client' && u.trainerId === trainerId);
}
function rosterEntry(c) {
  const p = db.progress[c.id] || {};
  const lastMsg = [...db.messages].reverse().find(m => m.from === c.id);
  return {
    id: c.id, name: c.name, initials: c.initials, plan: c.plan,
    adherence: p.adherence ?? 0, status: c.status, alert: !!c.alert, last: c.last,
    lastMessage: lastMsg ? lastMsg.text.slice(0, 60) : ''
  };
}
function threadBetween(clientId, trainerId, viewerId) {
  return db.messages
    .filter(m => (m.from === clientId && m.to === trainerId) || (m.from === trainerId && m.to === clientId))
    .sort((a, b) => a.createdAt - b.createdAt)
    .map(m => ({ mine: m.from === viewerId, from: m.from, text: m.text, time: m.time }));
}
function checkinsForClients(clientIds) {
  const set = new Set(clientIds);
  return db.checkins.filter(c => set.has(c.clientId)).sort((a, b) => b.createdAt - a.createdAt);
}

// --- Geteilter Zustand ----------------------------------------------------
function stateFor(user) {
  if (user.role === 'trainer') {
    const clients = clientsOf(user.id);
    return {
      user: publicUser(user),
      clients: clients.map(rosterEntry),
      checkins: checkinsForClients(clients.map(c => c.id)),
      messages: [],           // Trainer lädt Threads pro Kunde (clientDetail)
      progress: null,
      appointment: null
    };
  }
  // Kunde: nur eigene Daten
  return {
    user: publicUser(user),
    clients: [],
    messages: threadBetween(user.id, user.trainerId, user.id),
    checkins: db.checkins.filter(c => c.clientId === user.id).sort((a, b) => b.createdAt - a.createdAt),
    progress: db.progress[user.id],
    appointment: db.appointments[user.id] || null
  };
}

// Detailansicht eines Kunden für den Trainer (nur eigene Kunden).
function clientDetail(trainer, clientId) {
  const client = findUserById(clientId);
  if (!client || client.role !== 'client' || client.trainerId !== trainer.id) {
    throw httpError(404, 'Kunde nicht gefunden');
  }
  return {
    client: rosterEntry(client),
    progress: db.progress[clientId] || null,
    appointment: db.appointments[clientId] || null,
    checkins: db.checkins.filter(c => c.clientId === clientId).sort((a, b) => b.createdAt - a.createdAt),
    messages: threadBetween(clientId, trainer.id, trainer.id)
  };
}

// --- Mutationen -----------------------------------------------------------
let seq = Date.now();
function nextId(prefix) { return prefix + '_' + (++seq).toString(36); }

function touchClient(clientId, patch = {}) {
  const c = findUserById(clientId);
  if (c) Object.assign(c, patch);
}

function addMessage(user, text, toId) {
  const clean = String(text || '').slice(0, 2000).trim();
  if (!clean) throw httpError(400, 'Nachricht darf nicht leer sein');
  let from, to;
  if (user.role === 'client') {
    from = user.id; to = user.trainerId || 'sergio';
  } else {
    from = user.id; to = toId;
    const target = findUserById(to);
    if (!target || target.role !== 'client' || target.trainerId !== user.id) {
      throw httpError(400, 'Unbekannter Empfänger');
    }
  }
  db.messages.push({ id: nextId('m'), from, to, text: clean, time: 'Jetzt', createdAt: ++seq });
  persist();
  return user.role === 'client' ? stateFor(user) : clientDetail(user, to);
}

function addCheckin(user, { type, label, note, photo, clientId: bodyClientId }) {
  const clientId = user.role === 'client' ? user.id : bodyClientId;
  const client = findUserById(clientId);
  if (!client || client.role !== 'client') throw httpError(400, 'Unbekannter Kunde');
  const id = nextId('c');
  const entry = {
    id, clientId, client: client.name,
    type: type === 'meal' ? 'meal' : 'workout',
    label: String(label || '').slice(0, 200), note: String(note || '').slice(0, 500),
    time: 'Gerade eben', createdAt: ++seq
  };
  const photoUrl = storePhoto(id, photo);
  if (photoUrl) entry.photoUrl = photoUrl;
  db.checkins.push(entry);
  touchClient(clientId, { last: 'Gerade eben', alert: false, status: 'Aktiv' });
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
  const clientId = user.role === 'client' ? user.id : patch.clientId;
  const p = db.progress[clientId] || (db.progress[clientId] = { sessionsDone: 0, sessionsGoal: 3, totalSessions: 0, adherence: 0, performance: 0 });
  for (const key of ['sessionsDone', 'sessionsGoal', 'totalSessions', 'adherence', 'performance']) {
    if (typeof patch[key] === 'number' && Number.isFinite(patch[key])) p[key] = patch[key];
  }
  touchClient(clientId, { last: 'Gerade eben' });
  persist();
  return stateFor(user);
}

function setAppointment(user, appt) {
  const clientId = user.role === 'client' ? user.id : (appt && appt.clientId);
  if (!clientId) throw httpError(400, 'Kein Kunde angegeben');
  db.appointments[clientId] = appt ? {
    date: String(appt.date || '').slice(0, 80),
    time: String(appt.time || '').slice(0, 40),
    type: String(appt.type || 'Persönlicher Video-Check-in').slice(0, 80),
    status: String(appt.status || 'Bestätigt').slice(0, 40)
  } : null;
  persist();
  return stateFor(user);
}

// --- Registrierung & Passwort-Reset --------------------------------------
function initials(name) {
  return String(name).trim().split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || 'NN';
}

function registerClient({ email, name, password, consentAt }) {
  // Eindeutige, URL-taugliche ID aus dem lokalen E-Mail-Teil ableiten.
  const baseSlug = String(email).split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase() || 'kunde';
  let id = baseSlug;
  let n = 1;
  while (findUserById(id)) id = baseSlug + (++n);
  const user = {
    id, email: String(email).toLowerCase(), name: String(name).trim(), initials: initials(name),
    role: 'client', trainerId: 'sergio', plan: 'Starter', status: 'Neu', alert: false, last: 'Gerade registriert',
    consentAt: consentAt || null,
    passwordHash: hashPassword(password)
  };
  db.users.push(user);
  db.progress[id] = { sessionsDone: 0, sessionsGoal: 3, totalSessions: 0, adherence: 0, performance: 0 };
  db.appointments[id] = null;
  persist();
  return user;
}

// Erzeugt ein Reset-Token. Rückgabe null, wenn die E-Mail unbekannt ist –
// der Aufrufer antwortet trotzdem neutral (kein Konto-Enumeration-Leak).
function createResetToken(email) {
  const u = findUserByEmail(email);
  if (!u) return null;
  const token = createToken();
  db.resets = db.resets || {};
  db.resets[token] = { userId: u.id, createdAt: Date.now() };
  persist();
  return token;
}

function resetPassword(token, newPassword) {
  const rec = (db.resets || {})[token];
  if (!rec || (Date.now() - rec.createdAt) > 1000 * 60 * 60) throw httpError(400, 'Ungültiger oder abgelaufener Link');
  const u = findUserById(rec.userId);
  if (!u) throw httpError(400, 'Ungültiger Link');
  u.passwordHash = hashPassword(newPassword);
  delete db.resets[token];
  persist();
  return u;
}

// --- DSGVO-Selbstbedienung ------------------------------------------------
// Alle personenbezogenen Daten eines Nutzers als maschinenlesbare Kopie (Art. 20).
function exportData(user) {
  const id = user.id;
  return {
    exportedAt: new Date().toISOString(),
    profile: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan || null },
    consentAt: user.consentAt || null,
    progress: db.progress[id] || null,
    appointment: db.appointments[id] || null,
    messages: db.messages.filter(m => m.from === id || m.to === id),
    checkins: db.checkins.filter(c => c.clientId === id)
  };
}

// Konto und alle zugehörigen Daten unwiderruflich löschen (Art. 17).
function deleteAccount(user) {
  const id = user.id;
  db.users = db.users.filter(u => u.id !== id);
  db.messages = db.messages.filter(m => m.from !== id && m.to !== id);
  db.checkins = db.checkins.filter(c => c.clientId !== id);
  delete db.progress[id];
  delete db.appointments[id];
  for (const [token, s] of Object.entries(db.sessions)) if (s.userId === id) delete db.sessions[token];
  persist();
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
  publicUser, stateFor, clientDetail,
  addMessage, addCheckin, patchProgress, setAppointment,
  registerClient, createResetToken, resetPassword,
  exportData, deleteAccount,
  httpError, DB_FILE, UPLOADS_DIR
};
