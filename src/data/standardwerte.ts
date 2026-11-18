/**
 * Alle Standardwerte der Rechner – mit Quelle und Stand-Datum.
 *
 * WICHTIG: Wenn ein Wert aktualisiert wird, immer auch `stand` und ggf. `quelle`
 * anpassen. Die Rechner-Seiten zeigen diese Angaben automatisch an.
 */

export interface Standardwert {
  wert: number;
  einheit: string;
  /** Kurze Quellenangabe, wie sie auf der Seite erscheint */
  quelle: string;
  url?: string;
  /** Stand der Quelle im Format JJJJ-MM-TT */
  stand: string;
  /** true = eigene, begründete Annahme statt fester Quellenwert */
  annahme?: boolean;
}

export const STROMPREIS: Standardwert = {
  wert: 37.3,
  einheit: 'ct/kWh',
  quelle: 'BDEW-Strompreisanalyse Herbst 2026, Durchschnitt Haushalte im Jahresverlauf 2026',
  url: 'https://www.bdew.de/service/daten-und-grafiken/bdew-strompreisanalyse/',
  stand: '2026-10-28',
};

export const BKW_MODULLEISTUNG: Standardwert = {
  wert: 900,
  einheit: 'Wp',
  quelle: 'Typisches Set mit zwei Modulen à 450 Wp (Verbraucherzentrale nennt 450–500 W pro Modul als übliche Größe)',
  url: 'https://www.verbraucherzentrale.de/wissen/energie/erneuerbare-energien/steckersolar-solarstrom-vom-balkon-direkt-in-die-steckdose-44715',
  stand: '2026-07-24',
};

export const BKW_WECHSELRICHTER: Standardwert = {
  wert: 800,
  einheit: 'W',
  quelle: 'Gesetzliche Obergrenze für Steckersolargeräte (Umweltbundesamt)',
  url: 'https://www.umweltbundesamt.de/themen/klima-energie/erneuerbare-energien/photovoltaik/steckersolargeraete-balkonkraftwerke',
  stand: '2026-03-18',
};

export const BKW_MODULLEISTUNG_MAX: Standardwert = {
  wert: 2000,
  einheit: 'Wp',
  quelle: 'Gesetzliche Obergrenze der Modulleistung für Steckersolargeräte (Umweltbundesamt)',
  url: BKW_WECHSELRICHTER.url,
  stand: BKW_WECHSELRICHTER.stand,
};

export const BKW_ANSCHAFFUNG: Standardwert = {
  wert: 400,
  einheit: '€',
  quelle: 'Verbraucherzentrale: Set mit zwei Standardmodulen 200–300 €, Halterung 50–100 € pro Modul',
  url: BKW_MODULLEISTUNG.url,
  stand: '2026-07-24',
};

export const BKW_EIGENVERBRAUCH: Standardwert = {
  wert: 50,
  einheit: '%',
  quelle:
    'Vorsichtige Annahme für zwei Module. Beispiel der Verbraucherzentrale mit einem Modul: rund 70 % (200 von 280 kWh); kleine Anlagen erreichen höhere Anteile (Umweltbundesamt)',
  url: BKW_MODULLEISTUNG.url,
  stand: '2026-07-24',
  annahme: true,
};

export const BKW_EINSPEISEVERGUETUNG: Standardwert = {
  wert: 0,
  einheit: 'ct/kWh',
  quelle: 'Steckersolargeräte erhalten keine Einspeisevergütung (Umweltbundesamt)',
  url: BKW_WECHSELRICHTER.url,
  stand: BKW_WECHSELRICHTER.stand,
};

export const PV_ALTERUNG: Standardwert = {
  wert: 0.5,
  einheit: '% pro Jahr',
  quelle: 'Annahme: Leistungsverlust der Module durch Alterung, übliche Größenordnung aus Herstellergarantien',
  stand: '2026-11-18',
  annahme: true,
};

export const STROMPREIS_STEIGERUNG: Standardwert = {
  wert: 0,
  einheit: '% pro Jahr',
  quelle: 'Annahme: gleichbleibender Strompreis (vorsichtig gerechnet, Preisentwicklung ist nicht vorhersehbar)',
  stand: '2026-11-18',
  annahme: true,
};

/** "2026-10-28" → "Oktober 2026" */
export function formatStand(stand: string): string {
  const [jahr, monat] = stand.split('-').map(Number);
  const date = new Date(Date.UTC(jahr, monat - 1, 1));
  return new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}
