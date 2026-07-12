# Bewertung: The Maestro Plan – Coaching-App

**Stand:** 12. Juli 2026 · Branch `claude/website-purpose-analysis-a3u0jg`
**Zweck dieses Dokuments:** Klären, *was die App leisten soll*, *was sie heute leistet*, und daraus *priorisierte nächste Schritte* ableiten. Es wird an dieser Stelle noch **nichts umgebaut** – dies ist eine reine Bewertung als Entscheidungsgrundlage.

---

## 1. Zusammenfassung

„The Maestro Plan" ist eine **Personal-Training- und Coaching-App** für den Trainer **Sergio Maestro** und seine Kunden (Beispielkundin: Anna Weber). Sie bildet die **komplette Betreuung digital ab**: Training, Ernährung, Chat, Termine und Video-Check-ins – aus **zwei Perspektiven** (Kunden-App mobil, Trainer-Dashboard Desktop).

**Kernbefund:** Als **klickbarer Prototyp** erfüllt die App ihren Zweck sehr gut – die Produktvision ist vollständig und markengerecht erlebbar. Als **echtes Produkt** fehlt praktisch die gesamte technische Grundlage: kein Backend, keine Datenbank, keine echte Anmeldung, keine Verbindung zwischen Trainer und Kunde. Das ist im Prototyp offen und ehrlich so kommuniziert.

**Reifegrad:** ▓▓▓▓▓▓▓▓░░ Konzept/Demo ≈ 85 %  ·  ▓░░░░░░░░░ Produkt/MVP ≈ 5 %

---

## 2. Soll-Zustand (Produktvision)

Abgeleitet aus README, UI-Texten und Funktionsumfang. Die App **soll**:

### Kunden-App (mobil)
1. **Heute** – Tagesstart mit Motivation, Wochenfortschritt, direkter Einstieg ins Training
2. **Plan** – Wochen-Trainingsplan, erledigte/kommende Einheiten
3. **Geführtes Training** – Übung für Übung, Sätze abhaken, Werte/Gewicht erfassen, Intervall-Timer, Anstrengung (RPE), Abschluss-Feedback an den Trainer
4. **Ernährung** – Mahlzeiten-Check-ins, **Foto einer Mahlzeit** mit Notiz an Sergio, Wasser-Tracker, Gewohnheiten
5. **Chat** – direkter Draht zum Trainer
6. **Termine** – Video-Check-ins buchen, verschieben, absagen, **Call direkt starten**
7. **Mehr** – Videothek, Fortschritt (Gewicht/Leistung), Datenschutz/Einwilligungen

### Trainer-Dashboard (Desktop)
1. **Übersicht** – Kennzahlen + „Handlungsbedarf heute"
2. **Kunden** – Liste mit Status/Quote, Detailansicht mit Verlauf
3. **Termine & Calls** – Tagesplan aller Check-ins, Call starten
4. **Plan-Builder** – Trainingspläne bauen, Übungen verwalten, Live-Vorschau, Versionierung, Zuweisung
5. **Ernährung / Mediathek / Nachrichten** – Pläne, Videos/PDFs, Kundenkommunikation

### Qualitätsanspruch (implizit)
- Starke, konsistente Marke (Gold/Lime, Oswald/Titillium, „Inspiring your health")
- Persönliches, motivierendes Coaching-Gefühl – nicht generisch
- Datenschutzbewusstsein (Gesundheitsdaten)

---

## 3. Ist-Zustand (was heute funktioniert)

Technik: reine **statische Web-App** – `index.html` + `app.js` (~850 Zeilen) + `styles.css`. Zustand in einer JS-Variablen `state`. Kein Build, keine Abhängigkeiten, kein Server.

**Funktioniert als Klick-Demo:**
- ✅ Rollen-Umschalter (Kunde / Sergio) auf dem Login
- ✅ Alle Kunden-Views inkl. geführtem Training mit funktionierendem Timer, Satz-Abhaken, RPE-Slider, Abschlussscreen
- ✅ Ernährung inkl. **echtem lokalem Foto-Upload mit Vorschau** (via `URL.createObjectURL`)
- ✅ Chat: eigene Nachrichten erscheinen sofort in der Liste
- ✅ Termine buchen/verschieben/absagen + Call-Modal
- ✅ Trainer-Dashboard, Kundenliste + Detail-Modal, Termine, **funktionierender Plan-Builder** (Übungen hinzufügen/entfernen mit Live-Vorschau)
- ✅ Responsive, saubere Marke, Toast-Feedback, gute Accessibility-Ansätze (`aria-label`, `aria-live`)

---

## 4. Gap-Analyse: Soll vs. Ist

| Funktion | Soll | Ist | Lücke |
|---|---|---|---|
| **Login / Konten** | Echte Anmeldung, Nutzerkonten | Fake – nur Rollen-Umschalter, Passwort „prototyp" | 🔴 Groß |
| **Datenspeicherung** | Persistente Daten | Nur im Arbeitsspeicher, nach Reload weg | 🔴 Groß |
| **Trainer ↔ Kunde** | Gemeinsame Datenbasis | Zwei getrennte Demos, keine echte Verbindung | 🔴 Groß |
| **Chat** | Echtes Messaging beидseitig | Nur eigene Nachrichten lokal, keine Zustellung | 🔴 Groß |
| **Termine / Video-Calls** | Kalender + Video-Anbieter | Simuliert („beim echten Anbieter") | 🔴 Groß |
| **Foto-Check-in** | Upload zum Trainer + Feedback | Nur lokale Vorschau, kein Versand | 🟠 Mittel |
| **Plan-Builder** | Speichern, versionieren, zuweisen | UI funktioniert, aber flüchtig; „speichern" = Toast | 🟠 Mittel |
| **Fortschritt/Statistik** | Echte Werte aus Trainings | Fest verdrahtete Demo-Zahlen | 🟠 Mittel |
| **Datenschutz/DSGVO** | Echte Einwilligungen, Export, Löschung | UI-Attrappe (Buttons ohne Funktion) | 🔴 Groß (Gesundheitsdaten!) |
| **Videothek/Mediathek** | Echte Videos/PDFs | Platzhalter-Kacheln | 🟠 Mittel |
| **Benachrichtigungen** | Erinnerungen an Termine/Training | Nicht vorhanden | 🟡 Klein |

---

## 5. Bewertung nach Dimensionen

**Design / UX – sehr stark.** Klare Marke, durchgängige Typografie und Farbwelt, motivierende Tonalität, gute mobile/Desktop-Trennung. Für einen Prototyp überdurchschnittlich.

**Code-Qualität – solide für einen Prototyp, aber am Limit.** Alles in einer 850-Zeilen-Datei mit vielen Inline-Styles und String-HTML. Für die Demo ok, für ein Produkt nicht tragfähig – es fehlen Modul-Struktur, Trennung von Daten/Logik/Darstellung und Tests.

**Technische Reife – niedrig (bewusst).** Kein Backend, keine Persistenz, keine echte Auth. Das ist für V0 vollkommen legitim, aber der Abstand zum Produkt ist groß.

**Sicherheit / DSGVO – kritischer Punkt fürs Produkt.** Es geht um **Gesundheits- und Ernährungsdaten** (besondere Kategorie nach Art. 9 DSGVO). Der Prototyp weist korrekt darauf hin, dass keine echten Daten verarbeitet werden. Sobald echte Nutzer dazukommen, sind Einwilligungen, Verschlüsselung, Datenexport und Löschkonzept **Pflicht, nicht Kür**.

---

## 6. Priorisierte Empfehlungen (Roadmap-Vorschlag)

Reihenfolge als Diskussionsgrundlage – nichts davon ist bereits umgesetzt:

**Kurzfristig (Prototyp schärfen, ohne Backend)**
1. Zustand über `localStorage` persistent machen → Demo überlebt Reload
2. Code in Module aufteilen (Daten / Views / Logik) – Basis für alles Weitere
3. Kleine UX-Lücken schließen (z. B. Foto-Check-in-„Senden" sichtbar in Chat/Trainer spiegeln)

**Mittelfristig (Weg zum MVP)**
4. Backend + Datenbank + echte Authentifizierung
5. Gemeinsame Trainer↔Kunde-Datenbasis (der eigentliche Produktkern)
6. Echter Chat und echte Terminbuchung (Kalender-/Video-Anbieter anbinden)

**Vor dem Live-Gang (Pflicht)**
7. DSGVO: echte Einwilligungen, Verschlüsselung, Datenexport & Löschung
8. Automatisierte Tests + Deployment-Pipeline

---

## 7. Fazit

Der Entwickler-Auftrag – **die Produktvision klickbar und markengerecht erlebbar machen** – ist **erfüllt**. Der Prototyp zeigt überzeugend, *was die App sein will*: persönliches, digitales Personal-Coaching mit enger Trainer-Kunde-Beziehung.

Der Schritt zum echten Produkt ist jedoch **kein Feinschliff, sondern ein Neubau des Fundaments** (Backend, Persistenz, Auth, DSGVO). Die nächste Entscheidung sollte daher bewusst sein: **Demo weiter verfeinern** oder **Fundament fürs MVP legen**.
