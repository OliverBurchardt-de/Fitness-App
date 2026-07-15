# The Maestro Plan – Coaching App

Personal-Training- und Coaching-App von Maestro Plan mit mobiler Kundenerfahrung und Sergios Trainer-Dashboard. Die App läuft in zwei Modi:

- **Connected Mode** – mit dem mitgelieferten Node-Backend: echte Anmeldung (gehashte Passwörter, Sessions), eine **geteilte Trainer-↔-Kunde-Datenbank** und Live-Sync zwischen beiden Rollen.
- **Demo-/Offline-Modus** – ohne Server: alle Abläufe funktionieren lokal, der Zustand wird im Browser (`localStorage`) gespeichert.

Das Frontend erkennt automatisch, ob ein Server erreichbar ist, und wählt den passenden Modus.

## Starten

### Als vollständiges Produkt (mit Backend, empfohlen)

Benötigt nur Node.js (keine externen Abhängigkeiten):

```bash
npm start
# Server läuft auf http://127.0.0.1:4173
```

Die App im Browser öffnen und mit den Seed-Konten anmelden:

| Rolle | E-Mail | Passwort |
|-------|--------|----------|
| Trainer | `sergio@maestro-plan.de` | `prototyp` |
| Kundin | `anna@beispiel.de` | `prototyp` |
| Kunde | `jonas@beispiel.de` | `prototyp` |
| Kundin | `miriam@beispiel.de` | `prototyp` |
| Kunde | `daniel@beispiel.de` | `prototyp` |

Der Trainer betreut **mehrere echte Kundenkonten** mit jeweils eigenem Fortschritt, Chat, Terminen und Check-ins. Zwei Fenster/Geräte gleichzeitig zeigen den Live-Sync: Ein Check-in einer Kundin erscheint sofort im Trainer-Dashboard, eine Antwort des Trainers landet direkt im Chat des jeweiligen Kunden – und ist für andere Kunden nicht sichtbar.

### Nur als Demo (ohne Backend)

```bash
npx serve .        # oder: python3 -m http.server 8099
```

Ohne erreichbaren Server läuft die App im Demo-Modus; auf dem Einstiegsbildschirm kann per Umschalter zwischen Kunden- und Trainer-Perspektive gewechselt werden. `index.html` lässt sich auch direkt öffnen – dann bleiben nur PWA-/Offline-Funktionen inaktiv.

## Enthaltene Demo-Abläufe

- **Kunde:** Heute-Ansicht, Wochenplan, geführtes Training, Timer, Ernährungs-Check-ins mit Mahlzeitenfoto, Chat, sichtbare Terminbuchung, Video-Check-ins, Videothek und Fortschritt
- **Trainer:** Dashboard mit Live-Feed eingehender Check-ins, Kundenliste, Termin- und Call-Übersicht, Kundenfortschritt, Plan-Builder, Zuweisung, Ernährung, Mediathek und Kundenvorschau
- **Responsive** Darstellung für Smartphone und Desktop

## Produktnahe Qualitätsmerkmale

- **Echtes Backend (dependency-frei):** Node-Server mit Authentifizierung (scrypt-gehashte Passwörter, widerrufbare Session-Tokens), JSON-Datenschicht mit atomarem Schreiben und REST-API. Statisches Frontend und API laufen auf einem gemeinsamen Origin (kein CORS).
- **Konten & Onboarding:** Selbst-Registrierung neuer Kunden (Validierung von Name, E-Mail-Format, Passwortstärke und Eindeutigkeit) und Passwort-Reset per Token. Die App wird auf den angemeldeten Nutzer personalisiert. (Der E-Mail-Versand des Reset-Links ist bewusst gestubbt/geloggt – siehe unten.)
- **DSGVO-Selbstbedienung:** Einwilligung bei der Registrierung (mit Zeitstempel), Datenexport als JSON-Download (Art. 20) und unwiderrufliche Kontolöschung inkl. aller zugehörigen Daten (Art. 17).
- **Mehrmandantenfähigkeit:** Ein Trainer betreut mehrere echte Kundenkonten; Daten sind pro Kunde isoliert (Kunde A sieht Kunde B nicht). Der Trainer chattet gezielt mit einem ausgewählten Kunden und sieht dessen echte Detaildaten.
- **Geteilte Trainer-↔-Kunde-Daten:** Chat, Check-ins, Fortschritt und Termine liegen serverseitig; beide Rollen sehen denselben Stand. Sanftes Live-Polling hält die Ansichten aktuell, ohne Eingaben zu stören.
- **Geschlossene Coaching-Loops:** Ein abgeschlossenes Training erhöht Wochenziel und Statistik und erscheint als Nachricht im Chat sowie im Trainer-Feed. Foto-Check-ins der Ernährung werden an Sergio gesendet. Eingetragene Wiederholungen/Gewichte werden gespeichert.
- **Persistenz & Offline:** Im Connected Mode über den Server, im Demo-Modus über `localStorage`. Wer eingeloggt war, landet direkt wieder in der App.
- **Installierbare PWA:** Web-App-Manifest, eigene Icons (inkl. maskable) und ein Service Worker, der die App-Shell cacht – die App ist installierbar und startet offline.
- **Barrierefreiheit:** Skip-Link, Modale mit Dialog-Rolle, Fokus-Falle, Schließen per `Escape` und Fokus-Rückgabe, Respekt für `prefers-reduced-motion`.
- **Sicherheit:** Passwörter nie im Klartext, Session-Tokens serverseitig widerrufbar und automatisch aufgeräumt, Login-Rate-Limiting, Sicherheits-Header (CSP u. a.), Maskierung von Nutzereingaben (XSS-Schutz), Schutz vor Path-Traversal, und interne Pfade (`/data`, `/server`) werden nie ausgeliefert.
- **Ernährungsfoto:** Das Mahlzeitenfoto wird im Connected Mode tatsächlich hochgeladen (Typ-/Größenprüfung) und erscheint als Thumbnail im Trainer-Feed.
- **Automatisierte Tests & CI:** Test-Suite mit Node's eingebautem Runner (`npm test`, keine Abhängigkeiten) für Auth, geteilte Daten, Foto-Upload und Sicherheit; GitHub-Actions-Pipeline prüft jeden Push.
- **SEO/Social:** Open-Graph- und Twitter-Karten-Meta, Theme-Color, Apple-Web-App-Meta.

## Projektstruktur

```
index.html              App-Shell, Meta-Tags, PWA-Verknüpfungen
app.js                  UI-Rendering, Zustand, Interaktionen, Connected/Demo-Modus
api-client.js           Fetch-Client für die REST-API (Connected Mode)
styles.css              Markendesign (Gold/Lime, Oswald/Titillium)
sw.js                   Service Worker (Offline-App-Shell)
manifest.webmanifest    PWA-Manifest
server/
  server.js             HTTP-Server: statisches Serving + REST-API + Sicherheit
  store.js              Persistenz (JSON) + Domänenlogik + Foto-Upload
  auth.js               Passwort-Hashing (scrypt) und Session-Tokens
tests/                  Automatisierte Tests (Node-Test-Runner, keine Deps)
.github/workflows/      CI-Pipeline (Syntax-Check + Tests)
assets/                 Logo, Fotos, Schriften, App-Icons
BEWERTUNG.md            Produktanalyse: Soll/Ist und Roadmap zum MVP
MARKTREIFE-AUDIT.md     Kritisches Audit gegen den Marktstandard
```

Tests lokal ausführen:

```bash
npm test        # 23 Tests (Auth, Registrierung/Reset, DSGVO, Mehrmandanten, Foto, Sicherheit)
npm run check   # Syntax-Check aller JS-Dateien
```

## Konfiguration (Umgebungsvariablen)

| Variable | Zweck |
|----------|-------|
| `PORT` / `HOST` | Server-Adresse (Default `127.0.0.1:4173`) |
| `MAESTRO_DATA_DIR` | Ablageort der Laufzeitdaten (Default `./data`) |
| `MAESTRO_DEV` | `=1` gibt den Passwort-Reset-Token in der API-Antwort zurück (nur Entwicklung/Tests; **niemals in Produktion**) |

Die Laufzeitdaten des Servers liegen unter `data/db.json` (wird beim ersten Start aus Seed-Daten erzeugt und ist per `.gitignore` ausgenommen).

## API-Überblick

| Methode & Pfad | Zweck |
|----------------|-------|
| `GET /api/health` | Erreichbarkeitscheck (steuert den Connected Mode) |
| `POST /api/login` · `POST /api/logout` | Anmeldung / Abmeldung |
| `POST /api/register` | Selbst-Registrierung neuer Kunden |
| `POST /api/password/forgot` · `/api/password/reset` | Passwort-Reset per Token |
| `GET /api/me/export` · `DELETE /api/me` | DSGVO: Datenexport / Kontolöschung |
| `GET /api/state` | Geteilter Coaching-Zustand für den angemeldeten Nutzer |
| `GET /api/clients/:id` | Kundendetail + Chat-Thread (nur Trainer, nur eigene Kunden) |
| `POST /api/messages` | Chat-Nachricht senden (Trainer: an bestimmten Kunden) |
| `POST /api/checkins` | Trainings-/Ernährungs-Check-in |
| `PATCH /api/progress` | Fortschritt aktualisieren |
| `PUT`/`DELETE /api/appointment` | Termin buchen / absagen |

## Nächster Schritt Richtung Produkt

Das Fundament steht: Backend, Authentifizierung und geteilte Datenbasis. Für den Marktstart folgen der Austausch der JSON-Datenschicht gegen eine echte Datenbank (die Repository-Schnittstelle in `store.js` ist dafür vorbereitet), Kalender-/Video-Anbindung sowie DSGVO-konforme Verarbeitung der Gesundheitsdaten. Details und Priorisierung in [`BEWERTUNG.md`](BEWERTUNG.md).

> Hinweis: Seed-/Demo-Daten · keine echten Gesundheitsdaten.
