# The Maestro Plan – Coaching App

Klickbarer Prototyp für die Personal-Training-App von Maestro Plan. Er zeigt sowohl die mobile Kundenerfahrung als auch Sergios Trainer-Dashboard – inzwischen mit echter Persistenz, geschlossenen Coaching-Loops und produktnaher Qualität (installierbare PWA, Offline-Betrieb, Barrierefreiheit).

Der Prototyp verwendet weiterhin ausschließlich Demo-Daten und hat noch kein produktives Backend – der Zustand lebt lokal im Browser.

## Starten

Am einfachsten über einen lokalen Webserver (nötig, damit Service Worker und Offline-Modus aktiv werden):

```bash
npx serve .
# oder
python3 -m http.server 8099
```

Danach die angezeigte lokale Adresse im Browser öffnen. Alternativ lässt sich `index.html` direkt öffnen – dann sind alle Abläufe nutzbar, nur die PWA-/Offline-Funktionen bleiben inaktiv.

Auf dem Einstiegsbildschirm kann zwischen Kunden- und Trainer-Perspektive gewechselt werden.

## Enthaltene Demo-Abläufe

- **Kunde:** Heute-Ansicht, Wochenplan, geführtes Training, Timer, Ernährungs-Check-ins mit Mahlzeitenfoto, Chat, sichtbare Terminbuchung, Video-Check-ins, Videothek und Fortschritt
- **Trainer:** Dashboard mit Live-Feed eingehender Check-ins, Kundenliste, Termin- und Call-Übersicht, Kundenfortschritt, Plan-Builder, Zuweisung, Ernährung, Mediathek und Kundenvorschau
- **Responsive** Darstellung für Smartphone und Desktop

## Produktnahe Qualitätsmerkmale

- **Persistenz:** Fortschritt, Wasser, Gewohnheiten, Chat, Termine und Plan überleben einen Reload (`localStorage`). Wer eingeloggt war, landet direkt wieder in der App.
- **Geschlossene Coaching-Loops:** Ein abgeschlossenes Training erhöht Wochenziel und Statistik und erscheint als Nachricht im Chat sowie im Trainer-Feed. Foto-Check-ins der Ernährung werden an Sergio gesendet. Eingetragene Wiederholungen/Gewichte werden gespeichert.
- **Installierbare PWA:** Web-App-Manifest, eigene Icons (inkl. maskable) und ein Service Worker, der die App-Shell cacht – die App ist installierbar und startet offline.
- **Barrierefreiheit:** Skip-Link, Modale mit Dialog-Rolle, Fokus-Falle, Schließen per `Escape` und Fokus-Rückgabe, Respekt für `prefers-reduced-motion`.
- **SEO/Social:** Open-Graph- und Twitter-Karten-Meta, Theme-Color, Apple-Web-App-Meta.

## Projektstruktur

```
index.html              App-Shell, Meta-Tags, PWA-Verknüpfungen
app.js                  UI-Rendering, Zustand, Persistenz, Interaktionen
styles.css              Markendesign (Gold/Lime, Oswald/Titillium)
sw.js                   Service Worker (Offline-App-Shell)
manifest.webmanifest    PWA-Manifest
assets/                 Logo, Fotos, Schriften, App-Icons
BEWERTUNG.md            Produktanalyse: Soll/Ist und Roadmap zum MVP
```

## Nächster Schritt Richtung Produkt

Der Weg zum echten Produkt ist kein Feinschliff, sondern der Aufbau des Fundaments: echtes Backend, Authentifizierung, eine gemeinsame Trainer-↔-Kunde-Datenbasis sowie DSGVO-konforme Verarbeitung der Gesundheitsdaten. Details und Priorisierung in [`BEWERTUNG.md`](BEWERTUNG.md).

> Hinweis: Demo-Daten · keine echten Gesundheitsdaten.
