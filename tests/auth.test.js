'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { hashPassword, verifyPassword, createToken } = require('../server/auth');

test('hashPassword erzeugt gesalzenen scrypt-Hash (kein Klartext)', () => {
  const stored = hashPassword('geheim');
  assert.match(stored, /^scrypt\$[a-f0-9]+\$[a-f0-9]+$/);
  assert.ok(!stored.includes('geheim'));
});

test('gleiche Passwörter erzeugen unterschiedliche Hashes (Salt)', () => {
  assert.notStrictEqual(hashPassword('x'), hashPassword('x'));
});

test('verifyPassword akzeptiert korrekt und lehnt falsch ab', () => {
  const stored = hashPassword('richtig');
  assert.strictEqual(verifyPassword('richtig', stored), true);
  assert.strictEqual(verifyPassword('falsch', stored), false);
});

test('verifyPassword ist robust gegen fehlerhafte Eingaben', () => {
  assert.strictEqual(verifyPassword('x', null), false);
  assert.strictEqual(verifyPassword('x', 'kaputt'), false);
});

test('createToken erzeugt hinreichend lange, eindeutige Tokens', () => {
  const a = createToken();
  const b = createToken();
  assert.ok(a.length >= 32);
  assert.notStrictEqual(a, b);
});
