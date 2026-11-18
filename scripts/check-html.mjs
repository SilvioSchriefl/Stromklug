/**
 * Prüft die gebauten Seiten (dist/) auf typische Fehler:
 * - fehlende Leerzeichen vor Links/fettem Text oder vor Zahlen
 *   (Astro verschluckt Zeilenumbrüche vor {ausdruck} und <a> – Lösung: {' '} ans Zeilenende)
 * - nicht genau eine <h1> pro Seite
 *
 * Aufruf: node scripts/check-html.mjs (läuft automatisch in "npm run verify")
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

async function htmlDateien(dir) {
  const eintraege = await readdir(dir, { withFileTypes: true });
  const dateien = await Promise.all(
    eintraege.map((e) => {
      const pfad = join(dir, e.name);
      if (e.isDirectory()) return htmlDateien(pfad);
      return e.name.endsWith('.html') ? [pfad] : [];
    }),
  );
  return dateien.flat();
}

const MUSTER = [
  { name: 'Leerzeichen vor Link/fett fehlt', re: /[a-zäöüß,](?=<(?:a |strong>))/g },
  {
    name: 'Leerzeichen vor Zahl fehlt',
    re: /\b(?:rund|etwa|für|abzüglich|Anschaffung|statt|von|bei|auf|nach|und|ca\.)(?=[\d−+])/g,
  },
];

let fehler = 0;
for (const datei of await htmlDateien(DIST)) {
  const roh = await readFile(datei, 'utf8');
  const html = roh.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '');
  const name = datei.slice(DIST.length);

  for (const { name: art, re } of MUSTER) {
    for (const m of html.matchAll(re)) {
      const kontext = html.slice(Math.max(0, m.index - 30), m.index + 20).replace(/\s+/g, ' ');
      console.error(`✗ ${name}: ${art} … ${kontext} …`);
      fehler++;
    }
  }

  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) {
    console.error(`✗ ${name}: ${h1} × <h1> (erwartet: genau 1)`);
    fehler++;
  }
}

if (fehler > 0) {
  console.error(`\n${fehler} Problem(e) gefunden.`);
  process.exit(1);
}
console.log('✓ HTML-Prüfung bestanden');
