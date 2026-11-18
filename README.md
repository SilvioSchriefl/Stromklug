# Stromklug

Kostenlose Rechner rund um Strom sparen und Balkonkraftwerk – schnell, ohne Cookies, mit offenen Formeln und Quellen.

- **Live:** https://stromklug.pages.dev (später eigene Domain)
- **Code:** https://github.com/SilvioSchriefl/Stromklug

> „Stromklug“ ist ein Arbeitsname. Er steht zentral in `src/config/site.ts` und lässt sich dort ändern.

---

## Inhalt

1. [Auf einen Blick](#auf-einen-blick)
2. [Erste Schritte auf deinem PC](#erste-schritte-auf-deinem-pc)
3. [Die wichtigsten Befehle](#die-wichtigsten-befehle)
4. [Änderungen veröffentlichen](#änderungen-veröffentlichen)
5. [Wo steht was?](#wo-steht-was)
6. [Häufige Aufgaben](#häufige-aufgaben)
7. [Neuen Ratgeber-Artikel ergänzen](#neuen-ratgeber-artikel-ergänzen)
8. [Neuen Rechner ergänzen](#neuen-rechner-ergänzen)
9. [Qualitätsregeln](#qualitätsregeln)
10. [Wenn etwas nicht klappt](#wenn-etwas-nicht-klappt)

---

## Auf einen Blick

| Baustein | Wofür |
|---|---|
| **Astro** | Baut aus den Vorlagen fertige, statische HTML-Seiten (sehr schnell, gut für Google). |
| **TypeScript** | JavaScript mit Typprüfung – findet Tippfehler, bevor die Seite online geht. |
| **Tailwind CSS** | Gestaltung direkt über Klassen wie `text-lg` oder `bg-brand-50`. |
| **Vitest** | Automatische Tests für die Rechenlogik. |
| **Cloudflare Pages** | Hosting. Jede Änderung auf GitHub geht automatisch online. |

**Grundprinzip:** Rechenlogik und Oberfläche sind getrennt. Die Logik steckt in `src/lib/calculators/` und wird getestet. Die Seiten in `src/pages/` zeigen nur an.

---

## Erste Schritte auf deinem PC

Einmalig nötig: **Node.js** und **Git** (sind bereits installiert).

1. Terminal im Projektordner öffnen.
2. Abhängigkeiten installieren (nur beim ersten Mal oder nach Updates):
   ```bash
   npm install
   ```
3. Entwicklungs-Server starten:
   ```bash
   npm run dev
   ```
4. Im Browser öffnen: http://localhost:4321 – Änderungen an Dateien erscheinen sofort.
5. Beenden mit `Strg + C` im Terminal.

---

## Die wichtigsten Befehle

| Befehl | Was er macht |
|---|---|
| `npm run dev` | Startet die Seite lokal unter http://localhost:4321 |
| `npm test` | Führt alle Rechentests aus |
| `npm run check` | Prüft Tippfehler und Typen in allen Dateien |
| `npm run build` | Baut die fertige Seite in den Ordner `dist/` |
| `npm run verify` | **Alles zusammen:** Tests, Prüfung, Build und HTML-Prüfung. Vor jedem Veröffentlichen ausführen! |

Die HTML-Prüfung findet u. a. fehlende Leerzeichen („rund5 €“) und Seiten ohne oder mit mehreren Hauptüberschriften.

---

## Änderungen veröffentlichen

```bash
npm run verify
```

Wenn alles grün ist:

```bash
git add -A
```

```bash
git commit -m "Kurz beschreiben, was sich geändert hat"
```

```bash
git push
```

Cloudflare baut die Seite danach automatisch neu. Nach 1–2 Minuten ist die Änderung live. Den Stand siehst du im Cloudflare-Dashboard unter *Workers & Pages → stromklug*.

---

## Wo steht was?

```
src/
├── config/
│   ├── site.ts             ← Seitenname, Menü, Liste aller Rechner
│   └── rechtliches.ts      ← DEINE Daten für Impressum & Datenschutz
├── data/
│   ├── standardwerte.ts    ← alle Standardwerte mit Quelle und Stand
│   ├── affiliate.ts        ← Affiliate-Links (leer = unsichtbar)
│   └── pvgis-*.json        ← Solardaten der EU (per Skript erzeugt)
├── lib/
│   ├── calculators/        ← Rechenlogik + Tests (*.test.ts) + Texte (*-ausgabe.ts)
│   ├── ui/calculator.ts    ← verbindet Formular und Rechenlogik im Browser
│   └── format.ts           ← deutsche Zahlen/Euro-Formatierung
├── components/
│   ├── calculator/         ← Rechner-Bausteine (Felder, Ergebnis, Rahmen)
│   └── affiliate/          ← Werbe-Box und „Anzeige“-Kennzeichnung
├── layouts/                ← Seitenvorlagen (Basis, Rechner, Text)
├── content/ratgeber/       ← Ratgeber-Artikel als Markdown
├── pages/                  ← jede Datei = eine Seite (Dateiname = Adresse)
└── styles/global.css       ← Farben, Schrift, Grundgestaltung
scripts/                    ← Hilfsskripte (PVGIS-Daten holen, HTML prüfen)
public/                     ← Dateien, die 1:1 online gehen (robots.txt, Favicon, _headers)
```

---

## Häufige Aufgaben

### Einen Standardwert aktualisieren (z. B. Strompreis)

1. `src/data/standardwerte.ts` öffnen.
2. Beim Eintrag (z. B. `STROMPREIS`) `wert`, `quelle`, `url` und **`stand`** anpassen.
3. `npm run verify` – fertig. Alle Rechner, Beispiele, FAQ-Texte und Quellentabellen übernehmen den neuen Wert automatisch.

> Tests, die einen bestimmten Wert erwarten, nutzen eigene feste Zahlen. Sie schlagen deshalb nicht fehl, wenn du einen Standardwert änderst.

### Deine Daten ins Impressum eintragen

`src/config/rechtliches.ts` öffnen und die Felder füllen. Leere Felder erscheinen auf der Seite als gelber **[PLATZHALTER]**. Danach die Texte rechtlich prüfen lassen.

### Einen Affiliate-Link aktivieren

1. In `src/data/affiliate.ts` bei `AFFILIATE_PROGRAMME` das Programm auf `aktiv: true` setzen (dann erscheint sein Pflichthinweis auf `/affiliate-hinweis/`).
2. Bei `AFFILIATE_LINKS` die `url` eintragen.

Die Box erscheint automatisch auf den passenden Rechnern – gekennzeichnet als „Anzeige“ und mit `rel="sponsored nofollow"`.

### Eigene Domain eintragen

Die Domain an zwei Stellen ersetzen (Suche nach `stromklug.example`):

- `astro.config.mjs` → `SITE_URL`
- `public/robots.txt` → Zeile `Sitemap:`

Dann in Cloudflare unter *Workers & Pages → stromklug → Custom domains* die Domain verbinden.

### Cloudflare-Statistik einschalten (optional)

Token aus *Cloudflare → Web Analytics* in `src/config/site.ts` bei `cloudflareAnalyticsToken` eintragen. Der passende Abschnitt in der Datenschutzerklärung erscheint dann automatisch. Vorher die rechtliche Einordnung prüfen (§ 25 TDDDG ist bei solchen Skripten umstritten).

### PVGIS-Solardaten neu holen (selten nötig)

```bash
node scripts/fetch-pvgis.mjs
```

```bash
node scripts/fetch-pvgis-tage.mjs
```

---

## Neuen Ratgeber-Artikel ergänzen

Artikel sind einfache Textdateien im **Markdown**-Format. Überschriften mit `##`, fett mit `**Text**`, Links mit `[Text](/adresse/)`.

1. **Vorlage kopieren:** `src/content/ratgeber/_vorlage.md` kopieren und umbenennen, z. B. in `balkonkraftwerk-anmelden.md`.
   Der Dateiname wird zur Adresse: `/ratgeber/balkonkraftwerk-anmelden/`
   (nur Kleinbuchstaben, Zahlen und Bindestriche; Dateien mit `_` am Anfang werden ignoriert).

2. **Kopfbereich ausfüllen** (zwischen den `---`-Linien):

   | Feld | Bedeutung |
   |---|---|
   | `titel` | Überschrift und Seitentitel (10–70 Zeichen) |
   | `beschreibung` | Text für Google (50–170 Zeichen) |
   | `veroeffentlicht` | Datum im Format `2026-11-18` |
   | `aktualisiert` | optional, Datum der letzten inhaltlichen Änderung |
   | `rechner` | passende Rechner, z. B. `- balkonkraftwerk-rechner` |
   | `quellen` | genutzte Quellen mit `titel`, `url` und `stand` |
   | `entwurf` | `true` = nicht veröffentlichen, `false` = veröffentlichen |

3. **Text schreiben.** Nur Fakten mit Quelle, keine Füllwörter. Mit `##` gliedern (die Hauptüberschrift `#` setzt die Seite selbst aus `titel`).

4. **Ansehen:** `npm run dev` → http://localhost:4321/ratgeber/

5. **Prüfen und veröffentlichen:** `npm run verify`, dann wie oben committen und pushen.

**Automatisch erledigt:** Der Artikel erscheint in der Ratgeber-Übersicht, in der Sitemap und unter „Ratgeber zum Thema“ auf jedem Rechner, der in `rechner` steht. Oben im Artikel gibt es Buttons zu diesen Rechnern.

Fehlt ein Pflichtfeld oder ist ein Text zu lang, bricht `npm run verify` mit einer Meldung ab, die das Feld nennt.

---

## Neuen Rechner ergänzen

Ein Rechner besteht aus **vier Teilen**. Am Beispiel eines Rechners „Lohnt sich LED?“ (alte Lampe gegen LED tauschen):

### Schritt 1: Rechenlogik – `src/lib/calculators/led.ts`

Nur Rechnen, keine Oberfläche. Eingaben rein, Ergebnis raus.

```ts
export interface LedEingabe {
  altW: number;
  neuW: number;
  stundenProTag: number;
  strompreisCt: number;
}

export interface LedErgebnis {
  ersparnisKwh: number;
  ersparnisEuro: number;
}

export function berechneLed(e: LedEingabe): LedErgebnis {
  const ersparnisKwh = ((e.altW - e.neuW) * e.stundenProTag * 365) / 1000;
  return { ersparnisKwh, ersparnisEuro: ersparnisKwh * (e.strompreisCt / 100) };
}
```

### Schritt 2: Tests – `src/lib/calculators/led.test.ts`

Mit einfachen Zahlen, die man im Kopf nachrechnen kann:

```ts
import { describe, expect, it } from 'vitest';
import { berechneLed } from './led';

describe('berechneLed', () => {
  it('60 W → 10 W, 2 h täglich, 40 ct = 36,5 kWh und 14,60 €', () => {
    const r = berechneLed({ altW: 60, neuW: 10, stundenProTag: 2, strompreisCt: 40 });
    expect(r.ersparnisKwh).toBeCloseTo(36.5, 6);
    expect(r.ersparnisEuro).toBeCloseTo(14.6, 6);
  });
});
```

`npm test` muss grün sein, bevor es weitergeht.

### Schritt 3: Ergebnistexte – `src/lib/calculators/led-ausgabe.ts`

Wandelt das Ergebnis in Texte um. Die Schlüssel (`ersparnis`, `satz` …) tauchen auf der Seite als `data-out="…"` wieder auf.

```ts
import { formatEuroCent, formatNumber } from '@/lib/format';
import type { LedEingabe, LedErgebnis } from './led';

export function ausgabeLed(r: LedErgebnis, _e: LedEingabe): Record<string, string> {
  return {
    ersparnis: formatEuroCent(r.ersparnisEuro),
    satz: `Mit der LED sparst du rund ${formatNumber(r.ersparnisKwh)} kWh und ${formatEuroCent(r.ersparnisEuro)} im Jahr.`,
    kwh: `${formatNumber(r.ersparnisKwh)} kWh`,
    sticky: `${formatEuroCent(r.ersparnisEuro)}/Jahr`,
  };
}
```

### Schritt 4: Seite – `src/pages/led-rechner.astro`

Der Dateiname wird zur Adresse (`/led-rechner/`). Die Bausteine kümmern sich um Gestaltung, Prüfung der Eingaben, Barrierefreiheit und die mobile Ergebnisleiste.

```astro
---
import CalculatorLayout from '@/layouts/CalculatorLayout.astro';
import CalculatorShell from '@/components/calculator/CalculatorShell.astro';
import NumberField from '@/components/calculator/NumberField.astro';
import StrompreisField from '@/components/calculator/StrompreisField.astro';
import ResultMain from '@/components/calculator/ResultMain.astro';
import ResultTiles from '@/components/calculator/ResultTiles.astro';
import SourcesTable from '@/components/SourcesTable.astro';
import { berechneLed, type LedEingabe } from '@/lib/calculators/led';
import { ausgabeLed } from '@/lib/calculators/led-ausgabe';
import { STROMPREIS } from '@/data/standardwerte';

const standard: LedEingabe = { altW: 60, neuW: 8, stundenProTag: 3, strompreisCt: STROMPREIS.wert };
const aus = ausgabeLed(berechneLed(standard), standard);

const faq = [
  { frage: 'Echte Frage 1?', antwort: 'Antwort mit Quelle.' },
  // … 4–6 echte Fragen
];
---

<CalculatorLayout
  title="LED-Rechner: Lohnt sich der Tausch?"
  description="Meta-Description für Google, 120–160 Zeichen."
  h1="LED-Rechner: Was spart der Tausch?"
  intro="Ein bis zwei Sätze, was der Rechner beantwortet."
  slug="led-rechner"
  faq={faq}
  related={['stromkosten-rechner', 'standby-kosten-rechner']}
>
  <CalculatorShell id="led">
    <Fragment slot="result">
      <ResultMain label="Ersparnis pro Jahr" valueKey="ersparnis" value={aus.ersparnis} sentenceKey="satz" sentence={aus.satz} />
      <ResultTiles tiles={[{ label: 'Weniger Verbrauch', key: 'kwh', value: aus.kwh }]} />
    </Fragment>

    <NumberField formId="led" name="altW" label="Alte Lampe" unit="W" value={standard.altW} min={1} max={500} />
    <NumberField formId="led" name="neuW" label="LED" unit="W" value={standard.neuW} min={0} max={500} />
    <NumberField formId="led" name="stunden" label="Stunden pro Tag" unit="h" value={standard.stundenProTag} min={0} max={24} />
    <StrompreisField formId="led" />

    <p slot="sticky" class="flex justify-between text-sm">
      <span>Ersparnis</span><strong data-out="sticky">{aus.sticky}</strong>
    </p>
  </CalculatorShell>

  <article class="prose-page mt-12">
    <h2>So rechnen wir</h2>
    <p>Formel und Annahmen …</p>
  </article>
  <SourcesTable rows={[{ name: 'Strompreis', wert: STROMPREIS, decimals: 1 }]} />

  <article class="prose-page mt-10">
    <h2>Rechenbeispiel</h2>
    <p>…</p>
    <h2>Typische Fehler</h2>
    <ul><li>…</li></ul>
  </article>
</CalculatorLayout>

<script>
  import { setupCalculator } from '@/lib/ui/calculator';
  import { berechneLed } from '@/lib/calculators/led';
  import { ausgabeLed } from '@/lib/calculators/led-ausgabe';

  setupCalculator('led', {
    read: (f) => ({
      altW: f.number('altW'),
      neuW: f.number('neuW'),
      stundenProTag: f.number('stunden'),
      strompreisCt: f.number('strompreis'),
    }),
    compute: berechneLed,
    outputs: ausgabeLed,
  });
</script>
```

**Wichtig:** `id` bei `CalculatorShell`, `formId` bei den Feldern und der erste Wert in `setupCalculator('led', …)` müssen gleich sein. Die `name`-Werte der Felder sind die Namen in `f.number('…')`.

### Schritt 5: In die Liste eintragen – `src/config/site.ts`

```ts
{
  slug: 'led-rechner',
  title: 'LED-Rechner',
  teaser: 'Was spart der Tausch alter Lampen gegen LED?',
  status: 'live',   // 'bald' = Karte ohne Link
},
```

Jetzt erscheint der Rechner auf der Startseite und kann bei anderen Rechnern unter `related` verlinkt werden.

### Schritt 6: Prüfen und veröffentlichen

`npm run verify` → committen → pushen.

### Weitere Bausteine

| Baustein | Wofür | Beispiel |
|---|---|---|
| `SelectField` | Auswahlliste | Ausrichtung im Balkonkraftwerk-Rechner |
| `showWhen="modus=wert"` + `hidden` | Feld nur bei bestimmter Auswahl zeigen | Stromkosten-Rechner |
| `<Fragment slot="advanced">` | Aufklappbereich „Weitere Annahmen“ | Speicher-Rechner |
| `GeraetZeile` | kompakte Zeile Name/Anzahl/Watt | Standby-Rechner |
| `hints` in `setupCalculator` | gelbe Hinweise unter dem Ergebnis | Balkonkraftwerk-Rechner |
| `AffiliateBox` | Werbe-Box (unsichtbar ohne URL) | alle Rechner |

---

## Qualitätsregeln

- **Keine erfundenen Fakten.** Jeder Standardwert bekommt eine Quelle mit Stand-Datum in `standardwerte.ts`. Eigene Annahmen mit `annahme: true` markieren.
- **Zahlen im Text aus der Rechenlogik erzeugen,** nicht abtippen – dann passen Text und Rechner immer zusammen (siehe Rechenbeispiele in den bestehenden Seiten).
- **Leerzeichen-Falle:** Steht ein `{wert}` oder ein Link `<a>` am Anfang einer neuen Zeile, verschluckt Astro das Leerzeichen davor. Lösung: `{' '}` ans Ende der vorherigen Zeile setzen. `npm run verify` findet solche Stellen.
- **Jede Seite:** eigener `title`, eigene `description`, genau eine Hauptüberschrift.
- **Hinweis „Schätzung, keine Beratung“** erscheint automatisch in jedem Rechner.
- **Keine externen Skripte, Schriften oder Cookies** ohne vorherige Prüfung.

---

## Wenn etwas nicht klappt

| Problem | Lösung |
|---|---|
| `npm` oder `git` wird nicht gefunden | Terminal schließen und neu öffnen (nach der Installation nötig). |
| `npm test` schlägt fehl | Die Meldung nennt Test und erwarteten Wert. Rechenlogik oder Test prüfen. |
| `npm run check` meldet einen Fehler | Datei und Zeile stehen in der Meldung – meist ein Tippfehler im Feldnamen. |
| HTML-Prüfung meldet „Leerzeichen fehlt“ | An der genannten Stelle `{' '}` einfügen (siehe Qualitätsregeln). |
| Seite ist nach `git push` nicht aktuell | 2 Minuten warten, dann im Cloudflare-Dashboard nachsehen, ob der Build fehlgeschlagen ist. |
| Rechner zeigt nichts an / reagiert nicht | Browser-Konsole öffnen (F12). Meist stimmt ein Feldname in `f.number('…')` nicht mit `name="…"` überein. |
