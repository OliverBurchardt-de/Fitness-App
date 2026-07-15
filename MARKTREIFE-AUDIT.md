# Marktreife-Audit: The Maestro Plan

**Stand:** 15. Juli 2026 · Branch `claude/website-purpose-analysis-a3u0jg`
**Maßstab:** Nicht „funktioniert die Demo?", sondern „hält das dem Standard einer **marktführenden** Health-/Coaching-App stand?". Bewusst hart bewertet.

---

## Ehrliches Gesamturteil

**Nein – wir sind noch nicht auf dem Niveau „ganz groß".** Was existiert, ist ein **exzellenter Prototyp mit einem echten, aber minimalen Backend-Fundament**. Der Sprung von hier zu einer marktführenden App ist **größer als der bisher zurückgelegte Weg** – und die schwierigen 70–80 % (Compliance, Zahlungen, echte Infrastruktur, Mehrmandantenfähigkeit, Echtzeit, native Apps, Sicherheit auf Produktionsniveau) sind **weitgehend unangetastet**.

**Realistische Marktreife: ≈ 25–30 %.** (Meine frühere „50 %"-Angabe war zu optimistisch – sie maß den Weg zum MVP, nicht zum Marktstandard.)

### Zwei Dinge, die ich zu positiv dargestellt hatte – jetzt klar benannt

1. **Das Mahlzeitenfoto wird nie hochgeladen.** Der „Foto-Check-in" sendet nur einen Textvermerk und eine Nachricht „Foto gesendet". Der Trainer bekommt **das Bild gar nicht**. Der Kernnutzen (Ernährung per Foto beurteilen) ist damit faktisch nicht erfüllt. → `app.js` Zeile ~348–360.
2. **Der „geteilte" Server ist faktisch Ein-Kunden-Betrieb.** Jede Trainer-Anfrage wird hart auf `'anna'` gemappt (`user.role === 'client' ? user.id : 'anna'`). Die vier Kunden in der Liste (Jonas, Miriam, Daniel) sind **keine echten Nutzer** – kein Login, keine Daten. Echte Mehrmandantenfähigkeit fehlt. → `server/store.js`.

### Direkt in dieser Iteration behoben (verifiziert)

Beim Gegenprüfen fiel eine **echte Sicherheitslücke** auf, die sofort geschlossen wurde – plus die in unserer Hand liegenden Findings:

- 🔴 **DB-Leak geschlossen:** Der statische Server lieferte zuvor `/data/db.json` (Passwort-Hashes **und** Session-Tokens) aus. Jetzt werden `/data`, `/server`, `node_modules` und Dotfiles hart blockiert. Durch **automatischen Test abgesichert**.
- ✅ **Mahlzeitenfoto wird jetzt wirklich übertragen:** Bild-Upload (Typ-/Größenprüfung, serverseitiger Dateiname), Abruf über `/uploads/…`, Thumbnail im Trainer-Feed. Ende-zu-Ende im Browser verifiziert.
- ✅ **Security-Header** (CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) auf allen Antworten.
- ✅ **Login-Rate-Limiting** (Brute-Force-Schutz) und **Session-Aufräumen** (kein Ansammeln toter Tokens).
- ✅ **Automatisierte Tests + CI:** 13 Tests (Auth, geteilte Daten, Foto-Upload, Security-Header, blockierte interne Pfade, Rate-Limit) mit Node-Test-Runner; GitHub-Actions-Pipeline.

Die Kategorientabellen unten zeigen weiterhin den **ursprünglichen** Prüfstand; die obigen Punkte sind damit teilweise bereits abgehakt. **Weiterhin offen** bleiben v. a. echte Datenbank, Mehrmandantenfähigkeit, DSGVO, Zahlungen, echte Video-Calls, native Apps.

---

## Bewertung nach Kategorien

Legende: ✅ vorhanden · ⚠️ Ansatz/teilweise · ❌ fehlt · 🔴 Blocker für Marktstart

### A. Kernprodukt & Funktionstiefe
| Punkt | Status | Kommentar |
|---|---|---|
| Geführtes Training, Fortschritt, Chat, Termine | ✅ | Solide umgesetzt, geschlossene Loops |
| Mehrmandantenfähigkeit (viele Kunden je Trainer) | ❌ 🔴 | Server kennt real nur einen Kunden |
| Ernährungsfoto tatsächlich an Trainer | ❌ 🔴 | Bild wird nicht übertragen (s. o.) |
| Echte Video-Calls | ❌ 🔴 | Vollständig simuliert; kein Anbieter (Daily/Twilio/Zoom) |
| Übungs-/Wissensvideos | ❌ | Play-Button ohne Funktion, keine Mediathek-Backend |
| Plan-Builder speichert serverseitig je Kunde | ❌ | Änderungen sind lokal, „Zuweisen" ist ein Toast |
| Trainingshistorie / Langzeitauswertung | ❌ | Nur aggregierte Demo-Zahlen |

### B. Architektur & Skalierung
| Punkt | Status | Kommentar |
|---|---|---|
| Persistenz | ⚠️ | JSON-Datei mit **Vollüberschreibung pro Write** – nicht nebenläufigkeitssicher, Read-Modify-Write-Races, O(n), keine Transaktionen |
| Echte Datenbank | ❌ 🔴 | Kein Postgres/SQLite; Schnittstelle ist vorbereitet, aber nicht umgesetzt |
| Horizontale Skalierung / Statelessness | ❌ | Sessions im Prozess/Datei; kein geteilter Store (Redis o. ä.) |
| Migrations-/Schema-Management | ❌ | Nicht vorhanden |
| Media-Storage (Bilder/Videos) | ❌ 🔴 | Kein Objektspeicher (S3 o. ä.) |

### C. Sicherheit (Produktionsniveau)
| Punkt | Status | Kommentar |
|---|---|---|
| Passwort-Hashing | ✅ | scrypt + Salt |
| XSS-Maskierung, Path-Traversal-Schutz | ✅ | Umgesetzt |
| TLS/HTTPS | ❌ 🔴 | Server ist reines HTTP |
| Security-Header (CSP, HSTS, X-Content-Type-Options, Referrer-Policy) | ❌ 🔴 | Keine gesetzt |
| Rate-Limiting / Brute-Force-Schutz auf Login | ❌ 🔴 | Fehlt komplett |
| Token-Speicherung | ⚠️ | In `localStorage` → per XSS stehlbar; besser httpOnly-Cookie |
| Session-Hygiene | ⚠️ | TTL wird nur bei Nutzung geprüft; abgelaufene Sessions sammeln sich in der DB |
| CSRF-Betrachtung | ⚠️ | Durch Bearer-Header entschärft, aber nicht dokumentiert/getestet |
| Secrets-Management, Audit-Log | ❌ | Nicht vorhanden |

### D. Datenschutz & Recht (DSGVO) — bei Gesundheitsdaten Pflicht
| Punkt | Status | Kommentar |
|---|---|---|
| Einwilligungen (Art. 9 – besondere Kategorien) | ❌ 🔴 | UI-Attrappe, keine echte Einwilligung/Protokollierung |
| Datenexport (Art. 20) | ❌ 🔴 | Button ohne Funktion |
| Löschkonzept (Art. 17) | ❌ 🔴 | Nicht umgesetzt |
| Verschlüsselung ruhender Daten | ❌ | Klartext-JSON |
| AVV, Datenschutzerklärung, Impressum, Cookie-Consent | ❌ 🔴 | Fehlen; in DE zwingend |
| Aufbewahrung/Löschfristen, Datenminimierung | ❌ | Kein Konzept |

### E. Konten & Onboarding
| Punkt | Status | Kommentar |
|---|---|---|
| Registrierung / Einladungsflow | ❌ 🔴 | Nur 2 hartkodierte Seed-Konten |
| Passwort zurücksetzen / E-Mail-Verifizierung | ❌ 🔴 | Fehlt |
| Rollen-/Rechteverwaltung (mehrere Trainer, Team) | ❌ | Nur ein Trainer |
| 2FA | ❌ | Fehlt |
| Profilverwaltung (Foto, Stammdaten, Ziele) | ⚠️ | Nur statische Anzeige |

### F. Echtzeit & Sync
| Punkt | Status | Kommentar |
|---|---|---|
| Live-Aktualisierung | ⚠️ | 4-s-Polling mit Voll-Rerender; kein WebSocket/SSE, nicht sofort, verliert ggf. Scroll |
| Offline↔Online-Sync-Konflikte | ❌ | Demo-`localStorage` und Server werden nicht abgeglichen; Divergenz möglich |
| Optimistic UI mit Rollback | ⚠️ | Teilweise, ohne echtes Konflikthandling |

### G. Monetarisierung
| Punkt | Status | Kommentar |
|---|---|---|
| Zahlungen/Abos (Stripe o. ä.) | ❌ 🔴 | Nicht vorhanden – ohne Bezahlung kein Geschäftsmodell |
| Rechnungen, Steuer, Kündigung, Gutscheine | ❌ | Fehlen |

### H. Benachrichtigungen
| Punkt | Status | Kommentar |
|---|---|---|
| Push (Web/Mobile) | ❌ 🔴 | PWA hat keine Push-Integration |
| E-Mail (Termin-/Trainingserinnerungen) | ❌ 🔴 | Kein Versand |
| In-App-Benachrichtigungen | ⚠️ | Nur flüchtige Toasts |

### I. Qualitätssicherung & Betrieb
| Punkt | Status | Kommentar |
|---|---|---|
| Automatisierte Tests im Repo | ❌ 🔴 | Verifikation lief manuell und wurde entfernt – **keine** Tests eingecheckt |
| CI/CD-Pipeline | ❌ 🔴 | Fehlt |
| Fehler-Monitoring (Sentry o. ä.), Logging, Alerting | ❌ | Nur `console.error` |
| Backups & Wiederherstellung | ❌ 🔴 | Kein Backup der JSON-Daten |
| Health-/Readiness-Checks fürs Deployment | ⚠️ | `/api/health` existiert, sonst nichts |
| Analytics/Produkt-Telemetrie | ❌ | Nicht vorhanden |

### J. Barrierefreiheit & Internationalisierung
| Punkt | Status | Kommentar |
|---|---|---|
| Fokus/Tastatur/Reduced-Motion (Modale) | ✅ | Umgesetzt |
| Vollständiger a11y-Audit (Kontraste, Screenreader, Formulare, Tabelle) | ❌ | Nicht durchgeführt; kein axe/Lighthouse-CI |
| Internationalisierung (i18n) | ❌ | Nur Deutsch, Strings hartkodiert |

### K. Mobile & Distribution
| Punkt | Status | Kommentar |
|---|---|---|
| Installierbare PWA + Offline-Shell | ✅ | Vorhanden |
| Native Apps / App-Store-Präsenz | ❌ | Fehlt (für „ganz groß" i. d. R. erwartet) |
| Health-Integrationen (Apple Health, Google Fit, Wearables) | ❌ | Fehlen |

---

## Priorisierte Roadmap

### P0 – Blocker für einen seriösen Marktstart
1. **Echte Datenbank + Media-Storage** (Postgres + S3-kompatibel), JSON-Schicht ablösen.
2. **Mehrmandantenfähigkeit**: echte Kundenkonten, sauberes Datenmodell je Kunde.
3. **Konten-Basis**: Registrierung/Einladung, Passwort-Reset, E-Mail-Verifizierung.
4. **DSGVO**: Einwilligungen, Export, Löschung, Verschlüsselung, Rechtstexte.
5. **Sicherheit**: TLS, Security-Header, Rate-Limiting, Token-Härtung (httpOnly-Cookies).
6. **Zahlungen** (Stripe) inkl. Abo-Lebenszyklus.
7. **Foto-Check-in wirklich übertragen** + **echte Video-Calls** (Anbieter anbinden).
8. **Tests + CI/CD + Backups + Monitoring**.

### P1 – kurz nach Launch
- Echtzeit via WebSocket/SSE statt Polling; Offline-Sync mit Konfliktlösung.
- Push- und E-Mail-Benachrichtigungen (Termin-/Trainingserinnerungen).
- Plan-Builder serverseitig je Kunde; echte Trainingshistorie.
- Vollständiger a11y-Audit (Lighthouse/axe in CI).

### P2 – Skalierung/Differenzierung
- i18n, native Apps, Wearable-/Health-Integrationen, Team-/Mehrtrainer-Rollen, Analytics.

---

## Fazit in einem Satz

Wir haben ein **starkes Fundament und eine überzeugende Demo** – aber bis „ganz groß" fehlen die **teuren, unspektakulären Pflichtteile** (Compliance, Zahlungen, echte Infrastruktur, Sicherheit, Tests, Mehrmandantenfähigkeit, echte Medien/Video). Diese lassen sich nicht „im Repo faken"; sie brauchen externe Dienste, Betrieb und bewusste Produkt-/Rechtsentscheidungen.
