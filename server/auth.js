'use strict';
// Authentifizierung ohne externe Abhängigkeiten:
// - Passwörter werden mit scrypt + zufälligem Salt gehasht (nie im Klartext gespeichert)
// - Sessions sind opake Zufallstokens, serverseitig gespeichert und damit widerrufbar
const crypto = require('node:crypto');

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 Tage

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  const [scheme, salt, expected] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !expected) return false;
  const actual = crypto.scryptSync(String(password), salt, 64).toString('hex');
  const a = Buffer.from(actual, 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

function isExpired(session) {
  return !session || (Date.now() - session.createdAt) > SESSION_TTL_MS;
}

module.exports = { hashPassword, verifyPassword, createToken, isExpired, SESSION_TTL_MS };
