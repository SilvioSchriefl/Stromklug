/**
 * Holt PVGIS-Stundenwerte und verdichtet sie zu einem Tagesprofil für den
 * Speicher-Rechner. Ergebnis: src/data/pvgis-tagesprofil.json
 *
 * Für jeden Tag des Jahres (1–365, Durchschnitt 2019–2023):
 * - anteil: Anteil des Tages am Jahresertrag (Summe aller Tage = 1)
 * - dunkel: Stunden ohne nennenswerte Solarleistung (Abend + Nacht + Morgen)
 *
 * Aufruf: node scripts/fetch-pvgis-tage.mjs
 */
import { writeFile } from 'node:fs/promises';

const LAT = 51.0;
const LON = 10.0;
const LOSS = 14;
const START = 2019;
const END = 2023;
const API = 'https://re.jrc.ec.europa.eu/api/v5_3';
/** Unter dieser Leistung (W pro kWp) zählt eine Stunde als "dunkel" */
const SCHWELLE_W = 10;

const MONTAGEN = {
  senkrechtSued: [{ angle: 90, aspect: 0 }],
  geneigtSued: [{ angle: 30, aspect: 0 }],
  // Ost/West: Mittel aus Ost- und Westausrichtung, beide senkrecht
  senkrechtOstWest: [
    { angle: 90, aspect: -90 },
    { angle: 90, aspect: 90 },
  ],
};

async function getJson(url) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // erneut versuchen
    }
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
  throw new Error(`PVGIS-Anfrage fehlgeschlagen: ${url}`);
}

/** Liefert pro Tag des Jahres: Energie (Wh pro kWp) und dunkle Stunden, gemittelt über die Jahre */
async function tageswerte({ angle, aspect }) {
  const url = `${API}/seriescalc?lat=${LAT}&lon=${LON}&peakpower=1&loss=${LOSS}&angle=${angle}&aspect=${aspect}&pvcalculation=1&startyear=${START}&endyear=${END}&outputformat=json`;
  const data = await getJson(url);
  const energie = new Array(365).fill(0);
  const dunkel = new Array(365).fill(0);
  const jahre = END - START + 1;
  for (const h of data.outputs.hourly) {
    // Format: "20190101:0010"
    const y = Number(h.time.slice(0, 4));
    const m = Number(h.time.slice(4, 6));
    const d = Number(h.time.slice(6, 8));
    if (m === 2 && d === 29) continue; // Schalttag auslassen
    const doy = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86400000);
    const tag = isLeap(y) && m > 2 ? doy - 1 : doy;
    energie[tag] += h.P / jahre;
    if (h.P < SCHWELLE_W) dunkel[tag] += 1 / jahre;
  }
  return { energie, dunkel };
}

function isLeap(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

const profile = {};

for (const [name, varianten] of Object.entries(MONTAGEN)) {
  const energie = new Array(365).fill(0);
  const dunkel = new Array(365).fill(0);
  for (const v of varianten) {
    const t = await tageswerte(v);
    t.energie.forEach((e, i) => (energie[i] += e / varianten.length));
    t.dunkel.forEach((s, i) => (dunkel[i] += s / varianten.length));
  }
  const summe = energie.reduce((a, b) => a + b, 0);
  profile[name] = {
    jahresertragKwhProKwp: Math.round(summe / 1000),
    anteil: energie.map((e) => Math.round((e / summe) * 1e6) / 1e6),
    dunkel: dunkel.map((s) => Math.round(s * 100) / 100),
  };
  console.log(`${name}: ${profile[name].jahresertragKwhProKwp} kWh/kWp`);
}

const output = {
  quelle: 'PVGIS 5.3, Europäische Kommission – Joint Research Centre (Stundenwerte)',
  quelleUrl: 'https://re.jrc.ec.europa.eu/pvg_tools/de/',
  abgerufen: new Date().toISOString().slice(0, 10),
  standort: { lat: LAT, lon: LON, beschreibung: 'Geografische Mitte Deutschlands' },
  jahre: [START, END],
  schwelleDunkelWProKwp: SCHWELLE_W,
  profile,
};

await writeFile(new URL('../src/data/pvgis-tagesprofil.json', import.meta.url), JSON.stringify(output) + '\n');
console.log('Gespeichert: src/data/pvgis-tagesprofil.json');
