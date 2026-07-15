'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Isoliertes Datenverzeichnis, damit Tests echte Daten nicht anfassen.
const TMP = path.join(os.tmpdir(), 'maestro-test-' + process.pid);
process.env.MAESTRO_DATA_DIR = TMP;

let server, base;

before(async () => {
  fs.rmSync(TMP, { recursive: true, force: true });
  server = require('../server/server');
  await new Promise(res => server.listen(0, '127.0.0.1', res));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
  fs.rmSync(TMP, { recursive: true, force: true });
});

const api = (p, opts) => fetch(base + p, opts);
const login = async (email, password) =>
  (await api('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }));

// 1x1 PNG als data:-URL
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

test('health endpoint antwortet', async () => {
  const r = await api('/api/health');
  assert.strictEqual(r.status, 200);
  assert.strictEqual((await r.json()).ok, true);
});

test('Sicherheits-Header sind gesetzt', async () => {
  const r = await api('/api/health');
  assert.strictEqual(r.headers.get('x-content-type-options'), 'nosniff');
  assert.match(r.headers.get('content-security-policy') || '', /default-src 'self'/);
  assert.strictEqual(r.headers.get('x-frame-options'), 'DENY');
});

test('Login: korrekt gibt Token + State, falsch gibt 401', async () => {
  const ok = await login('anna@beispiel.de', 'prototyp');
  assert.strictEqual(ok.status, 200);
  const body = await ok.json();
  assert.ok(body.token);
  assert.strictEqual(body.state.user.role, 'client');

  const bad = await login('anna@beispiel.de', 'falsch');
  assert.strictEqual(bad.status, 401);
});

test('geschützter Endpunkt ohne Token gibt 401', async () => {
  const r = await api('/api/state');
  assert.strictEqual(r.status, 401);
});

test('geteilte Daten: Check-in der Kundin ist für den Trainer sichtbar', async () => {
  const anna = await (await login('anna@beispiel.de', 'prototyp')).json();
  const post = await api('/api/checkins', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + anna.token },
    body: JSON.stringify({ type: 'workout', label: 'Testtraining', note: 'ok' })
  });
  assert.strictEqual(post.status, 201);

  const sergio = await (await login('sergio@maestro-plan.de', 'prototyp')).json();
  const state = await (await api('/api/state', { headers: { Authorization: 'Bearer ' + sergio.token } })).json();
  assert.ok(state.checkins.some(c => c.label === 'Testtraining'), 'Trainer sieht den Check-in');
});

test('Mahlzeitenfoto wird gespeichert und ist abrufbar', async () => {
  const anna = await (await login('anna@beispiel.de', 'prototyp')).json();
  const res = await (await api('/api/checkins', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + anna.token },
    body: JSON.stringify({ type: 'meal', label: 'Foto', note: '', photo: PNG })
  })).json();
  const withPhoto = res.checkins.find(c => c.photoUrl);
  assert.ok(withPhoto, 'Check-in hat eine photoUrl');
  const img = await api('/' + withPhoto.photoUrl);
  assert.strictEqual(img.status, 200);
  assert.match(img.headers.get('content-type') || '', /image\/png/);
});

test('SICHERHEIT: interne Pfade werden nicht ausgeliefert', async () => {
  for (const p of ['/data/db.json', '/server/store.js', '/server/auth.js']) {
    const r = await api(p);
    assert.ok(r.status === 403 || r.status === 404, `${p} darf nicht 200 sein (war ${r.status})`);
    const body = await r.text();
    assert.ok(!body.includes('passwordHash'), `${p} leakt keine Hashes`);
  }
});

test('Mehrmandantenfähigkeit: Kundendaten sind isoliert', async () => {
  const anna = await (await login('anna@beispiel.de', 'prototyp')).json();
  const jonas = await (await login('jonas@beispiel.de', 'prototyp')).json();
  assert.strictEqual(anna.state.user.id, 'anna');
  assert.strictEqual(jonas.state.user.id, 'jonas');
  // Annas Thread darf Jonas' Nachrichten nicht enthalten
  const annaTexts = anna.state.messages.map(m => m.text).join(' ');
  assert.ok(!/meinen Plan nochmal/.test(annaTexts), 'Anna sieht Jonas-Nachricht nicht');
  // Fortschritt ist pro Kunde unterschiedlich
  assert.notStrictEqual(anna.state.progress.totalSessions, jonas.state.progress.totalSessions);
});

test('Trainer sieht echten Kunden-Roster und Detail je Kunde', async () => {
  const sergio = await (await login('sergio@maestro-plan.de', 'prototyp')).json();
  const auth = { Authorization: 'Bearer ' + sergio.token };
  const roster = sergio.state.clients.map(c => c.id).sort();
  assert.deepStrictEqual(roster, ['anna', 'daniel', 'jonas', 'miriam']);

  const detail = await (await api('/api/clients/jonas', { headers: auth })).json();
  assert.strictEqual(detail.client.id, 'jonas');
  assert.ok(detail.messages.some(m => /meinen Plan nochmal/.test(m.text)), 'Detail enthält Jonas-Thread');

  // Kunde darf die Trainer-Detailroute nicht nutzen
  const anna = await (await login('anna@beispiel.de', 'prototyp')).json();
  const forbidden = await api('/api/clients/jonas', { headers: { Authorization: 'Bearer ' + anna.token } });
  assert.strictEqual(forbidden.status, 403);
});

test('Trainer chattet gezielt mit einem bestimmten Kunden', async () => {
  const sergio = await (await login('sergio@maestro-plan.de', 'prototyp')).json();
  const post = await api('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + sergio.token },
    body: JSON.stringify({ to: 'miriam', text: 'Super Woche, Miriam!' })
  });
  assert.strictEqual(post.status, 201);
  const detail = await post.json();
  assert.ok(detail.messages.some(m => m.text === 'Super Woche, Miriam!'));

  // Miriam sieht die Nachricht, Jonas nicht
  const miriam = await (await login('miriam@beispiel.de', 'prototyp')).json();
  assert.ok(miriam.state.messages.some(m => m.text === 'Super Woche, Miriam!'));
  const jonas = await (await login('jonas@beispiel.de', 'prototyp')).json();
  assert.ok(!jonas.state.messages.some(m => m.text === 'Super Woche, Miriam!'));

  // Empfänger muss ein eigener Kunde sein
  const bad = await api('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + sergio.token },
    body: JSON.stringify({ to: 'sergio', text: 'x' })
  });
  assert.strictEqual(bad.status, 400);
});

test('Rate-Limiting greift nach vielen Fehlversuchen', async () => {
  let hit429 = false;
  for (let i = 0; i < 12; i++) {
    const r = await login('spam@beispiel.de', 'x');
    if (r.status === 429) { hit429 = true; break; }
  }
  assert.ok(hit429, 'nach mehreren Fehlversuchen kommt 429');
});
