/** Hilfsfunktionen für Ratgeber-Artikel (nur beim Bauen der Seite). */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Artikel = CollectionEntry<'ratgeber'>;

/** Alle veröffentlichten Artikel, neueste zuerst */
export async function alleArtikel(): Promise<Artikel[]> {
  const artikel = await getCollection('ratgeber', (a) => !a.data.entwurf);
  return artikel.sort((a, b) => b.data.veroeffentlicht.getTime() - a.data.veroeffentlicht.getTime());
}

/** Artikel, die auf einen bestimmten Rechner verweisen */
export async function artikelZuRechner(slug: string): Promise<Artikel[]> {
  return (await alleArtikel()).filter((a) => a.data.rechner.includes(slug));
}

export function formatDatum(d: Date): string {
  return new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}
