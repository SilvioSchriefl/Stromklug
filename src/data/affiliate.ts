/**
 * Affiliate-Links – zentral verwaltet.
 *
 * So aktivierst du einen Link:
 * 1. Beim Partnerprogramm anmelden (z. B. Amazon PartnerNet, AWIN, Check24).
 * 2. Programm unten auf `aktiv: true` setzen (dann erscheint sein Pflichthinweis
 *    auf der Seite /affiliate-hinweis/).
 * 3. Bei AFFILIATE_LINKS die `url` eintragen.
 *
 * Leere `url` = der Link wird nirgends angezeigt.
 * Alle Links werden automatisch als "Anzeige" gekennzeichnet und mit
 * rel="sponsored nofollow" versehen.
 */

export interface AffiliateProgramm {
  id: string;
  name: string;
  aktiv: boolean;
  /** Pflichttext laut Teilnahmebedingungen des Programms */
  pflichthinweis: string;
}

export const AFFILIATE_PROGRAMME: AffiliateProgramm[] = [
  {
    id: 'amazon',
    name: 'Amazon PartnerNet',
    aktiv: false,
    // Wortlaut laut Amazon-Teilnahmebedingungen – bei Anmeldung prüfen
    pflichthinweis: 'Als Amazon-Partner verdienen wir an qualifizierten Verkäufen.',
  },
];

export interface AffiliateLinkEintrag {
  titel: string;
  beschreibung: string;
  /** Leer lassen, bis der Link vom Partnerprogramm vorliegt */
  url: string;
  buttonText: string;
  programm?: string;
}

export const AFFILIATE_LINKS = {
  'bkw-set': {
    titel: 'Balkonkraftwerk-Sets',
    beschreibung: 'Komplettsets mit 800-W-Wechselrichter und Halterung.',
    url: '',
    buttonText: 'Sets ansehen',
  },
  'bkw-speicher': {
    titel: 'Speicher für Balkonkraftwerke',
    beschreibung: 'Batteriespeicher, die überschüssigen Solarstrom für den Abend aufheben.',
    url: '',
    buttonText: 'Speicher ansehen',
  },
  strommessgeraet: {
    titel: 'Strommessgerät für die Steckdose',
    beschreibung: 'Misst, wie viel Strom ein Gerät wirklich verbraucht – auch im Standby.',
    url: '',
    buttonText: 'Messgeräte ansehen',
  },
  stromvergleich: {
    titel: 'Stromtarife vergleichen',
    beschreibung: 'Aktuelle Tarife für deine Postleitzahl vergleichen.',
    url: '',
    buttonText: 'Zum Tarifvergleich',
  },
} satisfies Record<string, AffiliateLinkEintrag>;

export type AffiliateId = keyof typeof AFFILIATE_LINKS;

/** Nur Links mit eingetragener URL */
export function aktiveLinks(ids: AffiliateId[]): (AffiliateLinkEintrag & { id: AffiliateId })[] {
  return ids.map((id) => ({ id, ...AFFILIATE_LINKS[id] })).filter((l) => l.url.trim() !== '');
}
