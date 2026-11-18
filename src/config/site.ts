/**
 * Zentrale Einstellungen der Seite.
 * Name und Texte hier ändern – sie werden überall automatisch übernommen.
 */
export const SITE = {
  name: 'Stromklug', // TODO: Arbeitsname, später ersetzen
  claim: 'Rechner für Strom und Energie sparen',
  description:
    'Kostenlose Rechner rund um Balkonkraftwerk, Stromkosten und Stromanbieter-Wechsel. Mit offenen Formeln, Quellen und ohne Cookies.',
  locale: 'de_DE',
  lang: 'de',
  // TODO [CLOUDFLARE]: Token aus Cloudflare Web Analytics eintragen (cookielos).
  // Leer lassen = keine Statistik.
  cloudflareAnalyticsToken: '',
} as const;

export type CalculatorStatus = 'live' | 'bald';

export interface CalculatorEntry {
  slug: string; // URL, z. B. /balkonkraftwerk-rechner/
  title: string;
  teaser: string;
  status: CalculatorStatus;
}

/**
 * Liste aller Rechner. Neue Rechner hier eintragen, dann erscheinen sie
 * automatisch auf der Startseite und im Menü.
 * Status "bald" = Karte wird angezeigt, aber noch nicht verlinkt.
 */
export const CALCULATORS: CalculatorEntry[] = [
  {
    slug: 'balkonkraftwerk-rechner',
    title: 'Balkonkraftwerk-Rechner',
    teaser: 'Wie viel Strom erzeugt dein Balkonkraftwerk und wann hat es sich bezahlt gemacht?',
    status: 'live',
  },
  {
    slug: 'stromkosten-rechner',
    title: 'Stromkosten eines Geräts',
    teaser: 'Was kostet der Kühlschrank, der Fernseher oder die Spielkonsole pro Jahr?',
    status: 'live',
  },
  {
    slug: 'balkonkraftwerk-speicher-rechner',
    title: 'Batteriespeicher fürs Balkonkraftwerk',
    teaser: 'Lohnt sich ein Speicher, oder ist er teurer als der Strom, den er rettet?',
    status: 'bald',
  },
  {
    slug: 'standby-kosten-rechner',
    title: 'Standby-Kosten im Haushalt',
    teaser: 'Wie viel Geld verlieren Geräte, die nur auf „Bereitschaft“ stehen?',
    status: 'bald',
  },
  {
    slug: 'stromanbieter-wechsel-rechner',
    title: 'Stromanbieter-Wechsel',
    teaser: 'Wie viel sparst du, wenn du vom aktuellen Tarif zu einem günstigeren wechselst?',
    status: 'bald',
  },
];

export const NAV_LINKS = [
  { href: '/', label: 'Start' },
  { href: '/#rechner', label: 'Rechner' },
  { href: '/ueber-uns/', label: 'Über uns' },
];

export const FOOTER_LINKS = [
  { href: '/ueber-uns/', label: 'Über uns' },
  { href: '/kontakt/', label: 'Kontakt' },
  { href: '/affiliate-hinweis/', label: 'Affiliate-Hinweis' },
  { href: '/impressum/', label: 'Impressum' },
  { href: '/datenschutz/', label: 'Datenschutz' },
];
