# Mit der KI sprechen statt prompten: Warum Erklären besser funktioniert als Formulieren

Es gibt kaum eine Kanzlei-Fortbildung zu künstlicher Intelligenz, in der nicht irgendwann die Sammlung der guten Prompts auftaucht. „Du bist ein erfahrener Steuerberater." „Gehe Schritt für Schritt vor." „Antworte in exakt fünf Abschnitten." „Wenn du das verstanden hast, antworte nur mit OK." Wer diese Zeilen kennt, hat auch die Tabellen gesehen, in denen sie gesammelt und gepflegt werden, als handle es sich um Formulierungsmuster für Einspruchsschreiben.

Ich halte diesen Aufwand für die tägliche Arbeit inzwischen für verschwendet. Nicht, weil die Formeln nie funktioniert hätten — sie waren der Behelf, mit dem man schwächeren Modellen etwas abgerungen hat. Sondern weil sie ein Problem lösen, das es in dieser Form nicht mehr gibt, und dabei genau das verdrängen, worauf es ankommt: den Sachverhalt.

Die interessantere Frage lautet nicht mehr „Wie schreibe ich den perfekten Prompt?", sondern „Wie erkläre ich der KI mein Problem so, wie ich es einem kompetenten Kollegen erklären würde?" Und für diese Aufgabe ist die Tastatur selten das beste Werkzeug.

## Woher die Zauberformeln kommen

Frühe Sprachmodelle reagierten auf knappe, mehrdeutige Eingaben unzuverlässig. Wer nur „Wie ist das mit dem Firmenwagen?" tippte, bekam eine beliebige Allgemeinplatzsammlung. Also hat man gelernt, die Modelle zu führen: eine Rolle zuweisen, ein Ausgabeformat vorschreiben, das Denken in Schritte zerlegen. Das war kein Aberglaube, das war ein Workaround, und er hat gewirkt.

Aus dem Workaround ist ein Ritual geworden. Es gibt Kurse, Vorlagenmärkte und Kanzleihandbücher für Formulierungen, deren Zweck darin besteht, eine technische Schwäche auszugleichen, die bei den aktuellen Modellen weitgehend behoben ist. Die Anbieter selbst raten inzwischen davon ab, den Denkweg vorzuschreiben: Modelle, die intern ohnehin in Schritten arbeiten, werden durch die Anweisung „denke Schritt für Schritt" nicht besser, unter Umständen sogar schlechter.

`[PRÜFEN: Wortlaut und aktuelle URL der Anbieter-Dokumentation zum Prompting von Reasoning-Modellen ergänzen — in dieser Umgebung war kein Zugriff auf die Originalseite möglich]`

Was bleibt, ist eine Beschäftigung mit der Verpackung. Der Nutzer feilt an der Anrede des Modells, während die Information fehlt, die das Modell nicht erraten kann.

## Derselbe Fall, zwei Eingaben

Ein Beispiel aus der Beratungspraxis, bewusst ein alltäglicher Fall: Eine Zahnarzt-GmbH überlässt ihrem Gesellschafter-Geschäftsführer ein Fahrzeug, das auch privat gefahren wird.

So sieht die getippte Schablone aus:

> „Du bist Steuerexperte. Analysiere folgenden Fall nach deutschem Steuerrecht. Berücksichtige alle relevanten Aspekte. Erstelle eine Gliederung. Nenne Risiken."

Und so die gesprochene Erklärung, in einem Zug diktiert:

> „Ich habe eine Zahnarzt-GmbH, die ein Fahrzeug auch privat nutzen lässt. Ich will zunächst keine fertige Stellungnahme, sondern eine strukturierte Liste der steuerlichen Themen, die ich prüfen muss: Umsatzsteuer, Lohnsteuer, verdeckte Gewinnausschüttung und Dokumentation. Bitte denke aus Sicht einer deutschen Steuerkanzlei, nenne Unsicherheiten klar und stelle mir die drei wichtigsten Rückfragen zuerst."

Zählen Sie beide Texte einmal aus, dann wird der Unterschied unangenehm deutlich.

![Gegenüberstellung zweier Eingaben zum selben Fall: Die getippte Schablone enthält drei Vorgaben zu Rolle und Form, eine Angabe zu Ziel und Abgrenzung und keine Angabe zum Sachverhalt. Die gesprochene Erklärung enthält keine Rollenvorgabe, fünf Angaben zu Ziel und Abgrenzung, drei erbetene Rückfragen und drei Angaben zum Sachverhalt.](schaubild-schablone-sachverhalt.webp)

*Die Schablone beschreibt, wie geantwortet werden soll. Über den Fall selbst sagt sie nichts — und genau das kann kein Modell ergänzen.*

Die zweite Eingabe ist nicht länger, weil jemand mehr Mühe investiert hätte. Sie ist länger, weil beim Sprechen automatisch mitkommt, was man beim Tippen weglässt: die Rechtsform, die tatsächliche Nutzung, das Ziel der Anfrage, die Grenze des Auftrags. Und sie erlaubt sofortige Korrektur, sobald die erste Rückfrage kommt: „Der Gesellschafter ist zugleich Geschäftsführer." „Es gibt ein Fahrtenbuch." „Bitte nur die Folgen für die Lohnabrechnung."

`[OLIVER-INPUT: Falls ein eigener Fall aus der Kanzlei genannt werden soll, an dem sich der Unterschied gezeigt hat — hier ist die Stelle dafür. Ohne freigegebenes Beispiel bleibt der Abschnitt beim Modellfall.]`

## Warum beim Sprechen mehr ankommt

Der erste Grund ist banal und trotzdem entscheidend: Tempo. In einer Untersuchung von Ruan und anderen aus dem Jahr 2016 haben 32 Teilnehmer denselben Text einmal auf der Smartphone-Tastatur getippt und einmal diktiert. Die Spracheingabe war im Englischen [dreimal so schnell wie das Tippen](https://arxiv.org/abs/1608.07323), bei einer um 20,4 Prozent niedrigeren Fehlerquote; auf Mandarin lag der Faktor bei 2,8.

![Vergleich zweier Eingabewege auf dem Smartphone: Beim Tippen liegt das Tempo im Verhältnis bei 1,0-fach, beim Sprechen bei 3,0-fach; die Fehlerquote ist im Englischen um 20,4 Prozent niedriger und die Eingabe auf Mandarin 2,8-fach schneller, gemessen an 32 Teilnehmern.](schaubild-tippen-sprechen-tempo.webp)

*Der Faktor drei ist nicht der Punkt. Der Punkt ist, was Sie in derselben Minute alles unterbringen, statt es aus Bequemlichkeit wegzulassen.*

Die Studie misst Texteingabe, nicht Beratungsqualität, und sie ist an kurzen Sätzen auf einem Smartphone entstanden. Übertragen Sie den Faktor nicht auf jedes Diktat am Schreibtisch. Was sie belegt, ist die Richtung: Der Weg über die Stimme ist breiter, und breitere Wege werden voller.

Dazu kommen drei Effekte, die sich schlecht messen, aber täglich zeigen. Beim Sprechen sinkt die Hemmschwelle bei Fragen, die noch nicht fertig gedacht sind — man muss keinen Text komponieren, sondern nur anfangen. Der Gedankengang bleibt erhalten: Hypothese, Einschränkung, Beispiel, Kurskorrektur, so wie man tatsächlich arbeitet und nicht wie eine einmal abgeschickte Anweisung. Und die Nachschärfung im Dialog kostet Sekunden statt eines neuen Anlaufs.

Nicht zuletzt ist der Weg über die Stimme barriereärmer. Wer nicht schnell tippt oder ohnehin den halben Tag am Bildschirm sitzt, gewinnt dabei mehr als nur Zeit; unterwegs, zwischen zwei Terminen oder während der Aktendurchsicht ist er oft der einzige praktikable.

## Wo der geschriebene Prompt bleibt

Sprache ersetzt kein klares Denken. Sie ersetzt die künstliche Prompt-Literatur — nicht den schriftlichen Auftrag, wenn es auf dessen Wortlaut ankommt.

Schreiben Sie, wenn eines dieser Merkmale zutrifft:

- **Das Ergebnis muss reproduzierbar sein.** Zwei gesprochene Erklärungen desselben Sachverhalts sind nie identisch; zwei identische Textbausteine schon.
- **Es geht um Struktur statt Fließtext**, also um Tabellen, Vorlagen, JSON oder Code. Dort ist die Anweisung selbst das Format.
- **Der Wortlaut wird später geprüft.** Eine steuerlich oder rechtlich relevante Formulierung, die in ein Mandantenschreiben wandert, muss man gegenlesen können — auch die Frage, aus der sie entstanden ist.
- **Der Ablauf wiederholt sich.** Was zwanzigmal im Monat gleich läuft, gehört in einen festen Prompt und nicht jedes Mal neu ins Mikrofon.
- **Vor der Eingabe ist eine bewusste Prüfung nötig**, weil Mandantendaten betroffen sind. Getippter Text lässt sich vor dem Absenden noch einmal lesen. Gesprochenes ist schon draußen.

Der letzte Punkt ist der wichtigste, und er führt zum eigentlichen Kanzleithema.

## Was in der Kanzlei zusätzlich gilt

Spracheingabe beschleunigt die Erfassung, nicht die Zulässigkeit. An der Verschwiegenheitspflicht ändert das Mikrofon nichts: Wer Mandantendaten in ein KI-System gibt, bezieht einen Dritten in ein Mandatsverhältnis ein, und das ist berufsrechtlich und datenschutzrechtlich zu unterlegen. Die Bundessteuerberaterkammer hat dazu einen [FAQ-Katalog zum KI-Einsatz im Berufsstand](https://www.bstbk.de/downloads/bstbk/digitalisierung/BStBK_FAQ-KI_end.pdf) veröffentlicht, der die Linie zusammenfasst: Vertrauliche Daten dürfen an einen KI-Dienstleister nur, wenn dieser vertraglich strikt zur Verschwiegenheit verpflichtet ist, die datenschutzrechtliche Prüfung dokumentiert vorliegt und ein Auftragsverarbeitungsvertrag geschlossen ist.

Beim Diktieren verschärft sich das Problem, weil man beiläufig mehr sagt. Genau die Details, die die Antwort besser machen — Ort, Branche, Betriebsgröße, Familienverhältnisse —, machen einen Mandanten bestimmbar, auch ohne dass sein Name fällt. Der Vorteil der Methode ist zugleich ihr Risiko.

Dazu kommt eine Pflicht, die viele Kanzleien noch nicht auf dem Schirm haben: Nach Art. 4 der [KI-Verordnung (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj) müssen Betreiber von KI-Systemen dafür sorgen, dass ihre Mitarbeiter über ausreichende KI-Kompetenz verfügen. Diese Vorschrift gilt seit dem 2. Februar 2025 und trifft auch die Kanzlei, die „nur" ein Standardmodell nutzt. Ein Zertifikat verlangt sie nicht, wohl aber ein dokumentiertes, zum Risiko passendes Vorgehen.

## Wie ich die Arbeit aufteilen würde

Aus beidem ergibt sich eine Reihenfolge, die ich für tragfähig halte:

1. **Sprechen**, um Sachverhalt, Ziel und Abgrenzung schnell und vollständig zu erfassen.
2. **Dialogisch weiterarbeiten** und die Rückfragen des Modells zulassen, statt die erste Antwort zu bewerten.
3. **Schriftlich prüfen und festhalten**, sobald das Ergebnis fachlich, rechtlich oder für die Akte relevant wird.
4. **Feste Prompts nur dort**, wo ein Ablauf wiederkehrt und zuverlässig automatisiert werden soll.

Welcher Schritt in welcher Umgebung stattfinden darf, entscheidet die Datenlage, nicht die Bequemlichkeit. Wie wir das in unserer Kanzlei aufsetzen, beschreiben wir unter [Kanzl.AI](https://www.burchardt-kollegen.de/leistungen/kanzl-ai/).

## Was daraus folgt

Die neue Kompetenz ist nicht die perfekte Formel. Sie besteht darin, einer Maschine den richtigen Kontext zu geben: Was ist der Fall, was soll herauskommen, was gilt nicht, wo bin ich unsicher. Das ist dieselbe Fähigkeit, die einen guten Aktenvermerk von einem schlechten unterscheidet, und sie war noch nie an eine Tastatur gebunden.

Die Stimme ist also nicht das Ende des Promptens. Sie ist das Ende des Prompt-Theaters — und der Anfang eines Gesprächs, für das man vorher wissen muss, was man eigentlich fragen will.

## Häufige Fragen

**Welche Software brauche ich, um mit einer KI zu sprechen?**

In der Regel keine zusätzliche. Die verbreiteten KI-Oberflächen haben ein Mikrofonsymbol im Eingabefeld, Windows und macOS bringen eigene Diktierfunktionen mit, und für längere Diktate gibt es spezialisierte Werkzeuge. Die Auswahl entscheidet sich nicht an der Bedienung, sondern daran, wo die Aufnahme verarbeitet wird, wie lange sie gespeichert bleibt und ob der Anbieter zur Verschwiegenheit verpflichtet werden kann. Diese Prüfung gehört vor die erste Nutzung.

**Reicht es, den Namen des Mandanten wegzulassen?**

Nein. Ein Sachverhalt kann eine Person auch ohne Namen bestimmbar machen; Ort, Branche, Rechtsform und Betriebsgröße genügen oft, gerade in einer überschaubaren Region. Beim Diktieren rutschen solche Angaben besonders leicht mit hinein, weil man erzählt statt formuliert. Tragfähig ist deshalb nur eine Umgebung, in der die Eingabe berufs- und datenschutzrechtlich abgesichert ist. Das Weglassen des Namens ersetzt sie nicht.

**Wie lang sollte eine gesprochene Erklärung sein?**

So lang, bis Sachverhalt, Ziel und Abgrenzung gesagt sind — meist eine bis drei Minuten. Kürzer wird es selten vollständig, länger beginnt man meist, Antworten vorwegzunehmen, die man besser dem Modell überlässt. Ein brauchbarer Selbsttest: Könnte ein Kollege, der den Fall nicht kennt, nach dieser Erklärung sinnvoll nachfragen? Dann reicht sie auch für die KI.

**Was mache ich, wenn die Spracherkennung Fachbegriffe falsch schreibt?**

Weitersprechen und im nächsten Satz korrigieren. Ein verunglücktes Wort im Fließtext ist kein Grund, die Eingabe neu zu beginnen, weil sich der gemeinte Begriff meist aus dem Zusammenhang ergibt. Anders liegt es bei Zahlen, Namen, Daten und Aktenzeichen: Die tippen Sie besser selbst oder lesen sie vor dem Absenden gegen, weil ein Zahlendreher hier keine Nachfrage auslöst, sondern eine falsche Antwort.

**Lohnt sich eine Prompt-Schulung im Team dann überhaupt noch?**

Für die tägliche Arbeit kaum, für wiederkehrende Abläufe schon. Wer Mitarbeitern Formelsammlungen beibringt, trainiert eine Fertigkeit, die mit jeder Modellgeneration weniger trägt. Sinnvoll bleibt die Schulung dort, wo feste Prompts in einen Prozess eingebaut werden, und vor allem dort, wo es um Datenschutz, Verschwiegenheit und die Bewertung von Antworten geht — das ist ohnehin der Teil, den Art. 4 der KI-Verordnung von jeder Kanzlei verlangt.
