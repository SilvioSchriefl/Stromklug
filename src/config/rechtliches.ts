/**
 * DEINE ANGABEN für Impressum, Datenschutz und Kontakt.
 *
 * Trage hier einmal deine Daten ein – sie erscheinen dann automatisch auf allen
 * Rechtsseiten. Leere Felder werden auf der Seite als gelber PLATZHALTER angezeigt,
 * damit du nichts übersiehst.
 *
 * Hinweis: Die Texte sind Vorlagen und keine Rechtsberatung. Lass sie vor dem
 * Start prüfen (z. B. Generator von eRecht24 oder Anwalt).
 */
export const BETREIBER = {
  /** Vor- und Nachname (bei Firma: Firmenname + Rechtsform + Vertretungsberechtigte) */
  name: '',
  /** Straße und Hausnummer – ladungsfähige Anschrift, kein Postfach */
  strasse: '',
  /** PLZ und Ort */
  plzOrt: '',
  land: 'Deutschland',
  /** E-Mail-Adresse für Anfragen */
  email: '',
  /** Telefonnummer (empfohlen als zweiter schneller Kontaktweg) */
  telefon: '',
  /** Umsatzsteuer-ID, falls vorhanden – sonst leer lassen, dann wird die Zeile ausgeblendet */
  ustId: '',
  /** Wirtschafts-Identifikationsnummer, falls vorhanden – sonst leer lassen */
  wirtschaftsId: '',
};

/** Verantwortlich für redaktionelle Inhalte (§ 18 Abs. 2 MStV) – meist dieselbe Person */
export const REDAKTION = {
  name: '',
  anschrift: '', // leer = gleiche Anschrift wie oben
};

/** Stand der Datenschutzerklärung – bei jeder inhaltlichen Änderung anpassen */
export const DATENSCHUTZ_STAND = '2026-11-18';

/**
 * Zuständige Datenschutz-Aufsichtsbehörde deines Bundeslandes
 * (Liste: https://www.bfdi.bund.de/DE/Service/Anschriften/Laender/Laender-node.html)
 */
export const AUFSICHTSBEHOERDE = {
  name: '',
  url: '',
};
