# Blogbeitrag „Mit der KI sprechen statt prompten“

Überarbeitete Fassung des bestehenden Homepage-Artikels zur Spracheingabe bei KI,
erstellt nach dem Skill `bk-blogartikel` und `bk-schaubilder`.

| Datei | Inhalt |
|---|---|
| `UEBERGABE.md` | Übergabe an das Zielprojekt: was wohin, Entscheidungen, offene Punkte |
| `artikel.md` | Publikationsinhalt, reines Markdown |
| `artikel-cms.html` | derselbe Text als HTML-Rumpf für den Beitragseditor |
| `cms-handoff.md` | Meta-Daten, Bildpositionen, Alt-Texte, Links, Schema-Hinweise |
| `freigabeprotokoll.md` | Intern. Quellen, Auszählungen, offene Punkte. Nicht veröffentlichen. |
| `schema-markup.html` | JSON-LD für den `<head>`: BlogPosting + FAQPage |
| `schaubild-schablone-sachverhalt.svg/.webp` | Schaubild 1: Auszählung beider Beispieleingaben |
| `schaubild-tippen-sprechen-tempo.svg/.webp` | Schaubild 2: Tempo- und Fehlervergleich nach Ruan u. a. 2016 |
| `vorschau.src.html` | Quelle der Vorschauseite, Bilder noch als Platzhalter |
| `vorschau.html` | Vorschauseite mit eingebetteten Bildern (als Artifact veröffentlicht) |

**Status: nicht freigabefähig.** Offene Punkte stehen im Freigabeprotokoll.

Die WebP-Dateien werden aus den SVG erzeugt:

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
