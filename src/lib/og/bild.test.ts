import { describe, expect, it } from 'vitest';
import { kuerzen } from './bild';

describe('kuerzen', () => {
  it('lässt kurze Texte unverändert', () => {
    expect(kuerzen('Stromkosten berechnen', 80)).toBe('Stromkosten berechnen');
  });

  it('kürzt lange Texte an einer Wortgrenze und hängt … an', () => {
    const text = 'Wie viel Strom erzeugt dein Balkonkraftwerk und wann hat es sich bezahlt gemacht?';
    const ergebnis = kuerzen(text, 40);
    expect(ergebnis.length).toBeLessThanOrEqual(40);
    expect(ergebnis.endsWith(' …')).toBe(true);
    expect(text.startsWith(ergebnis.slice(0, -2))).toBe(true);
  });

  it('entfernt Satzzeichen vor den Auslassungspunkten', () => {
    expect(kuerzen('Frist, Angaben, Sonderfall Speicher und noch mehr Text', 16)).toBe('Frist, Angaben …');
  });
});
