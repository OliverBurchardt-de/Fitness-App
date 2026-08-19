# CMS-Handoff — „Mit der KI sprechen statt prompten“

## Meta-Daten (Redaktionsvorschlag)

| Feld | Wert | Zeichen |
|---|---|---|
| Meta-Title | Mit KI sprechen statt prompten — was besser funktioniert | 55 |
| Meta-Description | Die perfekte Prompt-Formel hat ausgedient. Warum gesprochene Erklärungen mehr Kontext liefern und wo der geschriebene Prompt in der Kanzlei bleibt. | 149 |
| Slug | `mit-ki-sprechen-statt-prompten` | — |
| Kategorie | Digitalisierung / Kanzlei | — |
| `toc_mode` | `cms` (Standard) — im Markdown steht kein Inhaltsverzeichnis | — |

**Wichtig zum Slug:** Der Beitrag ersetzt einen bestehenden Artikel zum selben
Thema. Ist dessen URL bereits indexiert, wird **nicht** neu angelegt, sondern der
bestehende Beitrag überschrieben und `dateModified` gepflegt. Nur wenn eine neue
URL vergeben wird, gehört eine 301-Weiterleitung von der alten auf die neue.

## Schaubilder

Beide Dateien liegen als WebP (verlustfrei, 1760 px Breite) und als SVG-Quelle
bei. Wird eine Zahl im Text geändert, muss das Bild neu erzeugt werden.

### Schaubild 1 — `schaubild-schablone-sachverhalt.webp`

- **Position:** direkt nach den beiden Beispielzitaten im Abschnitt „Derselbe Fall, zwei Eingaben“
- **Alt-Text:** Gegenüberstellung zweier Eingaben zum selben Fall: Die getippte Schablone enthält drei Vorgaben zu Rolle und Form, eine Angabe zu Ziel und Abgrenzung und keine Angabe zum Sachverhalt. Die gesprochene Erklärung enthält keine Rollenvorgabe, fünf Angaben zu Ziel und Abgrenzung, drei erbetene Rückfragen und drei Angaben zum Sachverhalt.
- **Bildunterschrift:** Die Schablone beschreibt, wie geantwortet werden soll. Über den Fall selbst sagt sie nichts — und genau das kann kein Modell ergänzen.

### Schaubild 2 — `schaubild-tippen-sprechen-tempo.webp`

- **Position:** im Abschnitt „Warum beim Sprechen mehr ankommt“, nach dem Absatz zur Studie
- **Alt-Text:** Vergleich zweier Eingabewege auf dem Smartphone: Beim Tippen liegt das Tempo im Verhältnis bei 1,0-fach, beim Sprechen bei 3,0-fach; die Fehlerquote ist im Englischen um 20,4 Prozent niedriger und die Eingabe auf Mandarin 2,8-fach schneller, gemessen an 32 Teilnehmern.
- **Bildunterschrift:** Der Faktor drei ist nicht der Punkt. Der Punkt ist, was Sie in derselben Minute alles unterbringen, statt es aus Bequemlichkeit wegzulassen.

## Beitragsbild

Noch offen. Vorschlag: Aufnahme eines Diktats im Kanzleialltag — Person mit
Kopfhörer oder Telefon vor einem geöffneten Notebook, Blick auf den Bildschirm,
kein Stockfoto-Handschlag.

- **Alt-Text-Entwurf** (erst nach Auswahl des tatsächlichen Bildes final): Mitarbeiterin diktiert eine Fallbeschreibung in ein Notebook, auf dem eine KI-Oberfläche geöffnet ist.
- **Bildunterschrift:** nicht erforderlich.

Kein Bild zwischen H1 und Einstieg.

## Schema-Markup

Datei `schema-markup.html`, in den `<head>` der Beitragsseite. Enthält zwei
Objekte in einem `@graph`:

- `BlogPosting` mit `headline`, `author` (Person mit Autorenseite), `publisher`,
  `datePublished`, `dateModified`, `image`, `mainEntityOfPage`
- `FAQPage` mit den fünf Fragen des sichtbaren FAQ-Blocks

Die mit `XXX` markierten Werte sind vor der Veröffentlichung zu ersetzen:
Erstveröffentlichungsdatum, Änderungsdatum, URL der Autorenseite, Logo-URL,
Beitragsbild-URL.

**Zwei Bedingungen für das FAQ-Markup:** Es bleibt nur gültig, solange der
sichtbare FAQ-Block auf der Seite steht, und die Antworttexte müssen wortgleich
zum Artikel bleiben. Beides ist geprüft; wer im Text nachbessert, ändert die
JSON-Datei mit.

**Erwartung dämpfen:** Google zeigt FAQ-Rich-Results für Seiten wie diese seit
der Einschränkung 2023 nicht mehr regelmäßig an. Das Markup ist trotzdem
sinnvoll, weil es die Frage-Antwort-Struktur maschinenlesbar macht — ein Rich
Result ist damit aber nicht versprochen.

Nach dem Einbau einmal durch den Rich-Results-Test und den Schema-Validator
schicken.

## Interne Links im Text

| Ankertext | Ziel | Status |
|---|---|---|
| Kanzl.AI | `https://www.burchardt-kollegen.de/leistungen/kanzl-ai/` | Leistungsseite, einziger Link dieser Art, steht dort, wo die Frage nach der Umgebung entsteht |

Weitere interne Links sind nicht gesetzt, weil keine passende Zielseite bestätigt
ist. Kandidaten, falls vorhanden: ein bestehender Beitrag zu Datenschutz beim
KI-Einsatz und einer zur KI-Richtlinie in der Kanzlei — beide bitte prüfen und
dann im Abschnitt „Was in der Kanzlei zusätzlich gilt“ ergänzen.

## Externe Links im Text

| Ankertext | Ziel |
|---|---|
| dreimal so schnell wie das Tippen | `https://arxiv.org/abs/1608.07323` |
| FAQ-Katalog zum KI-Einsatz im Berufsstand | `https://www.bstbk.de/downloads/bstbk/digitalisierung/BStBK_FAQ-KI_end.pdf` |
| KI-Verordnung (EU) 2024/1689 | `https://eur-lex.europa.eu/eli/reg/2024/1689/oj` |

Alle drei vor der Veröffentlichung einmal anklicken — siehe Freigabeprotokoll.

## Vertikaler Rhythmus

Unverändert wie im Theme eingestellt: viel Abstand über einer Überschrift, wenig
darunter; Absatzabstand nur nach unten. Keine beitragsindividuelle Anpassung
nötig.
