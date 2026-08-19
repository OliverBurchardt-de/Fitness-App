# Übergabe an das Zielprojekt

Beitrag: **„Mit der KI sprechen statt prompten: Warum Erklären besser funktioniert
als Formulieren"** — überarbeitete Fassung eines bestehenden Homepage-Artikels von
Burchardt & Kollegen. Erstellt am 19.08.2026 nach den Skills `bk-blogartikel` und
`bk-schaubilder`.

Diese Arbeit ist versehentlich im Repository `Fitness-App` entstanden. Alles
Nötige liegt in diesem Ordner und ist selbsttragend — es gibt keine Abhängigkeit
zum umgebenden Projekt.

---

## 1. Was Sie wohin kopieren

| Datei | Zweck | Ziel |
|---|---|---|
| `artikel.md` | Publikationsinhalt als Markdown, die maßgebliche Fassung | Repository des Zielprojekts |
| `artikel-cms.html` | derselbe Text als fertiger HTML-Rumpf | direkt in den Beitragseditor |
| `schema-markup.html` | JSON-LD `BlogPosting` + `FAQPage` | in den `<head>` der Beitragsseite |
| `schaubild-schablone-sachverhalt.webp` | Schaubild 1 | Medienbibliothek |
| `schaubild-tippen-sprechen-tempo.webp` | Schaubild 2 | Medienbibliothek |
| `*.svg` | Quelldateien der Schaubilder | Repository, damit Texte änderbar bleiben |
| `cms-handoff.md` | Meta-Daten, Bildpositionen, Alt-Texte, Linkliste | Redaktion |
| `freigabeprotokoll.md` | Quellen, Rechenwege, offene Punkte | **intern, nie veröffentlichen** |
| `vorschau.src.html` / `vorschau.html` | Vorschauseite (Quelle / mit eingebetteten Bildern) | optional, nur zur Abstimmung |

Reihenfolge beim Einpflegen: erst die beiden WebP hochladen, dann in
`artikel-cms.html` die zwei Pfade `/wp-content/uploads/…` auf die echten
Medien-URLs ändern, dann den Rumpf einsetzen, zuletzt das Schema-Markup.

## 2. Meta-Daten

| Feld | Wert |
|---|---|
| H1 | Mit der KI sprechen statt prompten: Warum Erklären besser funktioniert als Formulieren |
| Meta-Title | Mit KI sprechen statt prompten — was besser funktioniert |
| Meta-Description | Die perfekte Prompt-Formel hat ausgedient. Warum gesprochene Erklärungen mehr Kontext liefern und wo der geschriebene Prompt in der Kanzlei bleibt. |
| Slug | `mit-ki-sprechen-statt-prompten` |
| `toc_mode` | `cms` |

Die H1 steht **nicht** in `artikel-cms.html`, weil das Redaktionssystem sie aus
dem Titelfeld erzeugt. Sonst steht sie zweimal auf der Seite.

## 3. Fünf Platzhalter im Schema-Markup

In `schema-markup.html` sind fünf Werte mit `XXX` markiert und vor dem
Veröffentlichen zu ersetzen: Erstveröffentlichungsdatum, Änderungsdatum, URL der
Autorenseite, Logo-URL, Beitragsbild-URL. Die URLs im `@id` und in
`mainEntityOfPage` unterstellen den Slug oben; wird ein anderer vergeben, sind sie
mitzuziehen.

Die fünf FAQ-Antworten im `FAQPage`-Objekt sind **wortgleich** zum sichtbaren
FAQ-Block. Das ist maschinell geprüft. Wer im Text nachbessert, ändert die
JSON-Datei mit, sonst wird das Markup ungültig.

## 4. Vier Entscheidungen, die im Verlauf gefallen sind

1. **Der `[PRÜFEN]`-Marker zum Prompting von Reasoning-Modellen ist aufgelöst.**
   Der Satz stützt sich jetzt auf zwei benannte Herstellerquellen: OpenAI
   („Reasoning best practices", Abschnitt „Avoid chain-of-thought prompts") und
   Anthropic („Extended thinking tips"). Die Behauptung „unter Umständen sogar
   schlechter" wurde gestrichen, weil keine der beiden Seiten sie trägt.
2. **Der `[OLIVER-INPUT]`-Marker ist entfernt**, ohne einen Fall zu erfinden. An
   seiner Stelle steht die Begründung, warum der gesprochene Weg das bessere
   Ergebnis liefert.
3. **Das eigene Diktiertempo ist aufgenommen:** 102 Wörter pro Minute aus der
   Auswertung des genutzten Werkzeugs, auf Rückfrage als Diktier- und nicht als
   Tipptempo bestätigt. Verrechnet mit dem gesprochenen Beispiel im Artikel
   (52 Wörter, gut 30 Sekunden). Rechenweg mit Zweitprüfung im Freigabeprotokoll.
4. **Die Überleitung zum ersten Schaubild wurde neu formuliert**, weil „Zählen Sie
   beide Texte einmal aus" offenließ, was gezählt wird.

## 5. Was im Zielprojekt noch offen ist

**Status: nicht freigabefähig.** Zwei Sperren:

1. **Quellen am Original prüfen.** Diese Sitzung hatte keinen ausgehenden
   Netzzugriff; alle fünf externen Quellen sind über Suchergebnisse belegt, aber
   keine Seite wurde geöffnet. Zu kontrollieren sind die Erreichbarkeit der fünf
   Links, die Zahlen 3,0 / 2,8 / 20,4 % / 63,4 % / 32 Teilnehmer gegen das
   arXiv-Abstract und die BStBK-Formulierung zur Auftragsverarbeitung gegen den
   PDF-Wortlaut.
2. **Abgleich mit dem bestehenden Artikel.** Der Vorgängerbeitrag auf
   burchardt-kollegen.de konnte nicht abgerufen werden. Zu klären: Welche
   Passagen bleiben, wird die bestehende URL weitergenutzt (dann überschreiben und
   `dateModified` pflegen) oder eine neue vergeben (dann 301 von alt auf neu)?

Dazu drei Warnungen: Beitragsbild ist nicht ausgewählt, der Alt-Text-Entwurf
dafür also vorläufig; die Autorenseite für `author.url` ist unbestätigt; die
beiden Herstellerlinks gehören bei jeder späteren Aktualisierung erneut auf den
Prüfstand, weil Produktdokumentation ohne Versionierung überschrieben wird.

## 6. Schaubilder neu erzeugen

Ändert sich eine Zahl im Text, muss das betroffene Bild neu gerendert werden — es
zieht nicht automatisch nach. Voraussetzung sind `cairosvg` und `Pillow`.

```bash
python3 - <<'PY'
import cairosvg
from PIL import Image
for name in ['schaubild-tippen-sprechen-tempo', 'schaubild-schablone-sachverhalt']:
    svg = open(name + '.svg', encoding='utf-8').read()
    vb = svg.split('viewBox="')[1].split('"')[0].split()
    breite = 1760
    hoehe = round(breite * float(vb[3]) / float(vb[2]))
    cairosvg.svg2png(url=name + '.svg', write_to='/tmp/tmp.png',
                     output_width=breite, output_height=hoehe,
                     background_color='white')
    Image.open('/tmp/tmp.png').convert('RGB').save(
        name + '.webp', 'WEBP', lossless=True, method=6)
PY
```

Vor jeder Ausgabe sind die Textbreiten rechnerisch zu prüfen (Georgia, Faktor 0,52
normal und 0,56 fett, mindestens 20 px Luft zur Kastengrenze). Die Vorgaben stehen
im Skill `bk-schaubilder`.

## 7. Vorschauseite neu bauen

`vorschau.html` ist `vorschau.src.html` mit den beiden WebP als Data-URI. Nach
einer Textänderung wird zuerst `vorschau.src.html` gepflegt, dann:

```bash
python3 - <<'PY'
import io, base64
v = io.open('vorschau.src.html', encoding='utf-8').read()
for platz, datei in [('SCHAUBILD_1', 'schaubild-tippen-sprechen-tempo.webp'),
                     ('SCHAUBILD_2', 'schaubild-schablone-sachverhalt.webp')]:
    v = v.replace(platz, 'data:image/webp;base64,' +
                  base64.b64encode(open(datei, 'rb').read()).decode())
io.open('vorschau.html', 'w', encoding='utf-8').write(v)
PY
```

## 8. Startpunkt für die Sitzung im Zielprojekt

Dieser Text lässt sich als erster Prompt verwenden:

> Im Ordner `<pfad>` liegt ein überarbeiteter Blogbeitrag für Burchardt &
> Kollegen samt Schaubildern, Schema-Markup, CMS-Handoff und internem
> Freigabeprotokoll. Lies `UEBERGABE.md` und `freigabeprotokoll.md`. Status ist
> „nicht freigabefähig"; offen sind die Kontrolle der fünf externen Quellen am
> Original und der Abgleich mit dem bestehenden Artikel auf
> burchardt-kollegen.de. Bitte arbeite beide Punkte ab und melde, was sich am
> Text dadurch ändert.
