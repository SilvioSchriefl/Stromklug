/**
 * Zahlen deutsch formatieren (Komma als Dezimaltrennzeichen, Punkt als Tausender).
 * Wird von allen Rechnern für die Ergebnisanzeige genutzt.
 */

const euroFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const euroCentFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 1234.5 → "1.235 €" (gerundet auf ganze Euro) */
export function formatEuro(value: number): string {
  return euroFormatter.format(value);
}

/** 1234.5 → "1.234,50 €" */
export function formatEuroCent(value: number): string {
  return euroCentFormatter.format(value);
}

/** 1234.567, 1 → "1.234,6" */
export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * Nutzereingabe in eine Zahl umwandeln. Akzeptiert "0,35", "0.35" und "1.234,5".
 * Gibt NaN zurück, wenn keine gültige Zahl erkannt wird.
 */
export function parseGermanNumber(input: string): number {
  const trimmed = input.trim().replace(/\s/g, '');
  if (trimmed === '') return Number.NaN;
  // Enthält Komma → deutsches Format: Punkte sind Tausendertrenner
  const normalized = trimmed.includes(',') ? trimmed.replace(/\./g, '').replace(',', '.') : trimmed;
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return Number.NaN;
  return Number(normalized);
}
