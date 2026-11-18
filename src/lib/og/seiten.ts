/**
 * Liste aller Seiten, die ein eigenes Vorschaubild (Open Graph) bekommen.
 * Rechner und Ratgeber-Artikel kommen automatisch dazu.
 * Seiten, die hier fehlen (z. B. Impressum), nutzen das Startseiten-Bild.
 */
import { CALCULATORS, SITE } from '@/config/site';
import { alleArtikel } from '@/lib/ratgeber';

export interface OgSeite {
  /** Seitenpfad ohne Schrägstriche, z. B. "balkonkraftwerk-rechner" oder "ratgeber/grundlast-messen" */
  pfad: string;
  /** Kleine Beschriftung über dem Titel */
  kategorie: string;
  titel: string;
  untertitel: string;
}

/** Name der Bilddatei für die Startseite */
export const OG_START = 'start';

export async function ogSeiten(): Promise<OgSeite[]> {
  const rechner = CALCULATORS.filter((c) => c.status === 'live').map((c) => ({
    pfad: c.slug,
    kategorie: 'Rechner',
    titel: c.title,
    untertitel: c.teaser,
  }));

  const artikel = (await alleArtikel()).map((a) => ({
    pfad: `ratgeber/${a.id}`,
    kategorie: 'Ratgeber',
    titel: a.data.titel,
    untertitel: a.data.beschreibung,
  }));

  return [
    {
      pfad: OG_START,
      kategorie: SITE.claim,
      titel: 'Rechne in einer Minute aus, wo du beim Strom sparst.',
      untertitel: 'Kostenlose Rechner mit offenen Formeln, Quellen und ohne Cookies.',
    },
    ...rechner,
    {
      pfad: 'ratgeber',
      kategorie: 'Ratgeber',
      titel: 'Ratgeber: Strom sparen und Balkonkraftwerk',
      untertitel: 'Anleitungen und Hintergründe – kurz erklärt, mit Quellen und passenden Rechnern.',
    },
    ...artikel,
    {
      pfad: 'ueber-uns',
      kategorie: 'Über uns',
      titel: `Über ${SITE.name}`,
      untertitel: 'Wer hinter den Rechnern steht und wie wir arbeiten.',
    },
  ];
}

/** Pfad aus der URL ("/ratgeber/x/") → Bildadresse ("/og/ratgeber/x.png"), sonst Startseiten-Bild */
export async function ogBildFuer(pathname: string): Promise<string> {
  const pfad = pathname.replace(/^\/+|\/+$/g, '') || OG_START;
  const seiten = await ogSeiten();
  const treffer = seiten.some((s) => s.pfad === pfad);
  return `/og/${treffer ? pfad : OG_START}.png`;
}
