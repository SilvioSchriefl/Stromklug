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

// ---------- Batteriespeicher fürs Balkonkraftwerk ----------

export const SPEICHER_MEHRKOSTEN: Standardwert = {
  wert: 750,
  einheit: '€',
  quelle: 'Verbraucherzentrale: Aufpreis für einen Speicher ca. 500 bis 1.000 Euro (Mittelwert)',
  url: BKW_MODULLEISTUNG.url,
  stand: '2026-07-24',
};

export const SPEICHER_KAPAZITAET: Standardwert = {
  wert: 2,
  einheit: 'kWh',
  quelle: 'Typische Größe aktueller Balkonkraftwerk-Speicher (nutzbare Kapazität laut Datenblatt prüfen)',
  stand: '2026-11-18',
  annahme: true,
};

export const SPEICHER_WIRKUNGSGRAD: Standardwert = {
  wert: 85,
  einheit: '%',
  quelle:
    'Vorsichtige Annahme für Laden + Entladen. Zum Vergleich: große Hausspeicher erreichen in der HTW-Stromspeicher-Inspektion 2026 Systemkennzahlen von 89 bis 97 %',
  url: 'https://solar.htw-berlin.de/studien/stromspeicher-inspektion-2026/',
  stand: '2026-11-18',
  annahme: true,
};

export const SPEICHER_STANDBY: Standardwert = {
  wert: 5,
  einheit: 'W',
  quelle:
    'Annahme für den Eigenverbrauch des Speichers. Zum Vergleich: In der HTW-Stromspeicher-Inspektion 2026 lagen einige Hausspeicher im Standby unter 6 W',
  url: 'https://solar.htw-berlin.de/studien/stromspeicher-inspektion-2026/',
  stand: '2026-11-18',
  annahme: true,
};

export const HAUSHALT_GRUNDLAST: Standardwert = {
  wert: 100,
  einheit: 'W',
  quelle:
    'Annahme für den durchschnittlichen Verbrauch abends und nachts (Kühlschrank, Router, Standby-Geräte). Am besten selbst messen',
  stand: '2026-11-18',
  annahme: true,
};

export const SPEICHER_LEBENSDAUER: Standardwert = {
  wert: 10,
  einheit: 'Jahre',
  quelle: 'Annahme: Nutzungsdauer des Speichers, orientiert an üblichen Herstellergarantien',
  stand: '2026-11-18',
  annahme: true,
};

// ---------- Standby ----------

const EU_STANDBY_URL = 'https://energy-efficient-products.ec.europa.eu/product-list/standby-networked-standby-and-mode_en';

export const EU_STANDBY_OHNE_ANZEIGE: Standardwert = {
  wert: 0.5,
  einheit: 'W',
  quelle: 'EU-Höchstwert für neue Geräte im Bereitschaftsbetrieb ohne Anzeige (Verordnung (EU) 2023/826, gilt seit 09.05.2025)',
  url: EU_STANDBY_URL,
  stand: '2025-05-09',
};

export const EU_STANDBY_MIT_ANZEIGE: Standardwert = {
  wert: 0.8,
  einheit: 'W',
  quelle: 'EU-Höchstwert für neue Geräte im Bereitschaftsbetrieb mit Anzeige, z. B. Uhr oder Statuslicht (Verordnung (EU) 2023/826)',
  url: EU_STANDBY_URL,
  stand: '2025-05-09',
};

export const EU_STANDBY_VERNETZT: Standardwert = {
  wert: 2,
  einheit: 'W',
  quelle: 'EU-Höchstwert für neue Geräte im vernetzten Bereitschaftsbetrieb, z. B. per WLAN oder App einschaltbar (Verordnung (EU) 2023/826)',
  url: EU_STANDBY_URL,
  stand: '2025-05-09',
};

export const STANDBY_STUNDEN: Standardwert = {
  wert: 20,
  einheit: 'h pro Tag',
  quelle: 'Annahme: Geräte werden etwa 4 Stunden am Tag benutzt und stehen die übrige Zeit im Standby',
  stand: '2026-11-18',
  annahme: true,
};

// ---------- Stromanbieter-Wechsel ----------

const MONITORING_URL =
  'https://data.bundesnetzagentur.de/Bundesnetzagentur/SharedDocs/Mediathek/Monitoringberichte/MonitoringberichtEnergie2025.pdf';

export const PREIS_GRUNDVERSORGUNG: Standardwert = {
  wert: 44.93,
  einheit: 'ct/kWh',
  quelle:
    'Bundesnetzagentur/Bundeskartellamt, Monitoringbericht 2025: Durchschnittspreis Grundversorgung inkl. Grundpreis-Anteil (2.500–5.000 kWh, Stichtag 01.04.2025)',
  url: MONITORING_URL,
  stand: '2025-04-01',
};

export const PREIS_ANDERER_LIEFERANT: Standardwert = {
  wert: 38.2,
  einheit: 'ct/kWh',
  quelle:
    'Bundesnetzagentur/Bundeskartellamt, Monitoringbericht 2025: Durchschnittspreis Vertrag bei einem anderen Lieferanten inkl. Grundpreis-Anteil (Stichtag 01.04.2025)',
  url: MONITORING_URL,
  stand: '2025-04-01',
};

export const VERBRAUCH_3_PERSONEN_HAUS: Standardwert = {
  wert: 3500,
  einheit: 'kWh/Jahr',
  quelle: 'Stromspiegel 2025 (co2online): 3-Personen-Haushalt im Haus, ohne elektrische Warmwasserbereitung',
  url: 'https://www.stromspiegel.de/',
  stand: '2025-05-01',
};

/** "2026-10-28" → "Oktober 2026" */
export function formatStand(stand: string): string {
  const [jahr, monat] = stand.split('-').map(Number);
  const date = new Date(Date.UTC(jahr, monat - 1, 1));
  return new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}
