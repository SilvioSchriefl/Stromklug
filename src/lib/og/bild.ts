/**
 * Zeichnet ein Vorschaubild (1200 × 630 Pixel) als PNG.
 * Läuft nur beim Bauen der Seite (npm run build), nie im Browser.
 * satori wandelt das Layout in ein SVG um, resvg macht daraus ein PNG.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { SITE } from '@/config/site';
import type { OgSeite } from './seiten';

export const OG_BREITE = 1200;
export const OG_HOEHE = 630;

const FARBEN = {
  gruen: '#047857',
  gruenDunkel: '#065f46',
  gruenHell: '#ecfdf5',
  blau: '#1d4ed8',
  text: '#0f172a',
  textWeich: '#334155',
};

// Schriftdateien werden nur einmal geladen
let schriften: Promise<{ name: string; data: Buffer; weight: 400 | 700 | 800 }[]> | undefined;
function ladeSchriften() {
  const ordner = join(process.cwd(), 'node_modules/@fontsource/inter/files');
  schriften ??= Promise.all(
    ([400, 700, 800] as const).map(async (weight) => ({
      name: 'Inter',
      weight,
      data: await readFile(join(ordner, `inter-latin-${weight}-normal.woff`)),
    })),
  );
  return schriften;
}

const BLITZ_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#047857"/><path d="M18 4 8 18h7l-2 10 11-15h-7l1-9z" fill="#fff"/></svg>',
  );

/** Kürzt Text an einer Wortgrenze, damit er nicht über den Rand läuft */
export function kuerzen(text: string, max: number): string {
  if (text.length <= max) return text;
  const schnitt = text.slice(0, max - 2); // Platz für " …"
  const letztesLeerzeichen = schnitt.lastIndexOf(' ');
  return `${schnitt.slice(0, letztesLeerzeichen > max * 0.6 ? letztesLeerzeichen : schnitt.length).replace(/[,.;:–-]+$/, '')} …`;
}

type Knoten = { type: string; props: Record<string, unknown> & { style?: Record<string, unknown> } };
const el = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Knoten => ({
  type,
  props: { style, children, ...extra },
});

// satori zählt den Innenabstand zur Größe dazu – deshalb hier abziehen
const RAND_X = 72;
const RAND_OBEN = 56;
const RAND_UNTEN = 64;
const INHALT_BREITE = OG_BREITE - 2 * RAND_X;
const INHALT_HOEHE = OG_HOEHE - RAND_OBEN - RAND_UNTEN;

export async function zeichneOgBild(seite: OgSeite): Promise<Buffer> {
  const titel = kuerzen(seite.titel, 80);
  const titelGroesse = titel.length > 55 ? 58 : 68;

  const baum = el(
    'div',
    {
      width: INHALT_BREITE,
      height: INHALT_HOEHE,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: `${RAND_OBEN}px ${RAND_X}px ${RAND_UNTEN}px`,
      backgroundImage: `linear-gradient(135deg, ${FARBEN.gruenHell} 0%, #ffffff 60%, #eff6ff 100%)`,
      fontFamily: 'Inter',
      color: FARBEN.text,
      position: 'relative',
    },
    [
      // Kopf: Logo + Name
      el('div', { display: 'flex', alignItems: 'center', gap: 20 }, [
        el('img', { width: 64, height: 64 }, undefined, { src: BLITZ_SVG, width: 64, height: 64 }),
        el('div', { fontSize: 40, fontWeight: 800, color: FARBEN.text }, SITE.name),
      ]),
      // Mitte: Kategorie, Titel, Untertitel (feste Breite, damit der Text umbricht)
      el('div', { display: 'flex', flexDirection: 'column', gap: 20, width: INHALT_BREITE }, [
        el(
          'div',
          {
            display: 'flex',
            alignSelf: 'flex-start',
            fontSize: 26,
            fontWeight: 700,
            color: FARBEN.gruenDunkel,
            backgroundColor: '#d1fae5',
            padding: '8px 20px',
            borderRadius: 999,
          },
          seite.kategorie,
        ),
        el(
          'div',
          { display: 'flex', width: INHALT_BREITE, fontSize: titelGroesse, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1 },
          titel,
        ),
        el(
          'div',
          { display: 'flex', width: INHALT_BREITE, fontSize: 30, fontWeight: 400, lineHeight: 1.35, color: FARBEN.textWeich },
          kuerzen(seite.untertitel, 120),
        ),
      ]),
      // Fuß: Vertrauensmerkmale
      el(
        'div',
        { display: 'flex', fontSize: 24, fontWeight: 700, color: FARBEN.gruen },
        'Offene Formeln · Quellen mit Datum · Keine Cookies',
      ),
      // Grüner Streifen am unteren Rand
      el('div', { position: 'absolute', left: 0, bottom: 0, width: OG_BREITE, height: 16, backgroundColor: FARBEN.gruen }),
    ],
  );

  const svg = await satori(baum as never, { width: OG_BREITE, height: OG_HOEHE, fonts: await ladeSchriften() });
  return new Resvg(svg, { fitTo: { mode: 'width', value: OG_BREITE } }).render().asPng();
}
