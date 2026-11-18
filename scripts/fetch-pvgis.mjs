/**
 * Holt Ertragsdaten von PVGIS (EU-Kommission, Joint Research Centre) und
 * schreibt sie nach src/data/pvgis-deutschland.json.
 *
 * Aufruf (nur nötig, wenn die Daten aktualisiert werden sollen):
 *   node scripts/fetch-pvgis.mjs
 *
 * Standort: geografische Mitte Deutschlands (ca. 51,0° N, 10,0° O).
 * Systemverluste: 14 % (PVGIS-Standard: Kabel, Wechselrichter, Verschmutzung).
 */
import { writeFile, mkdir } from 'node:fs/promises';

const LAT = 51.0;
const LON = 10.0;
const LOSS = 14;
const API = 'https://re.jrc.ec.europa.eu/api/v5_3';

// PVGIS-Azimut: 0 = Süd, -90 = Ost, 90 = West, 180 = Nord
const ORIENTATIONS = {
  sued: 0,
  suedost: -45,
  suedwest: 45,
  ost: -90,
  west: 90,
  nordost: -135,
  nordwest: 135,
  nord: 180,
};
const TILTS = [0, 15, 30, 45, 60, 90];
// Verhältnis Modulleistung (Wp) zu Wechselrichterleistung (W)
const RATIOS = [1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4];

async function getJson(url) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // Netzwerkfehler → erneut versuchen
    }
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
  throw new Error(`PVGIS-Anfrage fehlgeschlagen: ${url}`);
}

async function yearlyYield(angle, aspect) {
  const url = `${API}/PVcalc?lat=${LAT}&lon=${LON}&peakpower=1&loss=${LOSS}&angle=${angle}&aspect=${aspect}&outputformat=json`;
  const data = await getJson(url);
  return { kwhPerKwp: data.outputs.totals.fixed.E_y, meteo: data.inputs.meteo_data };
}

/** Anteil der Energie, der bei begrenzter Wechselrichterleistung übrig bleibt. */
async function clippingCurve(angle, aspect) {
  const url = `${API}/seriescalc?lat=${LAT}&lon=${LON}&peakpower=1&loss=${LOSS}&angle=${angle}&aspect=${aspect}&pvcalculation=1&startyear=2019&endyear=2023&outputformat=json`;
  const data = await getJson(url);
  const p = data.outputs.hourly.map((h) => h.P / 1000); // kW bei 1 kWp
  const total = p.reduce((a, b) => a + b, 0);
  return RATIOS.map((ratio) => {
    const cap = 1 / ratio; // Wechselrichter-Grenze bezogen auf 1 kWp
    const kept = p.reduce((a, v) => a + Math.min(v, cap), 0);
    return Math.round((kept / total) * 10000) / 10000;
  });
}

const yields = {};
const clipping = {};
let meteo;

for (const [name, aspect] of Object.entries(ORIENTATIONS)) {
  yields[name] = {};
  clipping[name] = {};
  for (const tilt of TILTS) {
    const y = await yearlyYield(tilt, aspect);
    meteo = y.meteo;
    yields[name][tilt] = Math.round(y.kwhPerKwp);
    clipping[name][tilt] = await clippingCurve(tilt, aspect);
    console.log(`${name.padEnd(9)} ${String(tilt).padStart(2)}° → ${Math.round(y.kwhPerKwp)} kWh/kWp`);
  }
}

const output = {
  quelle: 'PVGIS 5.3, Europäische Kommission – Joint Research Centre',
  quelleUrl: 'https://re.jrc.ec.europa.eu/pvg_tools/de/',
  abgerufen: new Date().toISOString().slice(0, 10),
  standort: { lat: LAT, lon: LON, beschreibung: 'Geografische Mitte Deutschlands' },
  systemverlusteProzent: LOSS,
  wetterdaten: meteo,
  einheit: 'kWh pro kWp und Jahr',
  ertrag: yields,
  begrenzung: {
    beschreibung:
      'Anteil des Jahresertrags, der bei Begrenzung durch den Wechselrichter erhalten bleibt (Stundenwerte 2019–2023).',
    verhaeltnisse: RATIOS,
    anteil: clipping,
  },
};

await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
await writeFile(new URL('../src/data/pvgis-deutschland.json', import.meta.url), JSON.stringify(output, null, 2) + '\n');
console.log('Gespeichert: src/data/pvgis-deutschland.json');
