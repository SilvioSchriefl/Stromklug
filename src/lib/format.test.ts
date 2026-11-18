import { describe, expect, it } from 'vitest';
import { formatEuro, formatEuroCent, formatNumber, parseGermanNumber } from './format';

// Intl nutzt geschützte Leerzeichen vor dem €-Zeichen; für den Vergleich normalisieren.
const plain = (s: string) => s.replace(/ | /g, ' ');

describe('formatEuro', () => {
  it('rundet auf ganze Euro mit Tausenderpunkt', () => {
    expect(plain(formatEuro(1234.5))).toBe('1.235 €');
  });
});

describe('formatEuroCent', () => {
  it('zeigt zwei Nachkommastellen', () => {
    expect(plain(formatEuroCent(0.5))).toBe('0,50 €');
  });
});

describe('formatNumber', () => {
  it('nutzt Komma als Dezimaltrennzeichen', () => {
    expect(formatNumber(1234.567, 1)).toBe('1.234,6');
  });
});

describe('parseGermanNumber', () => {
  it.each([
    ['0,35', 0.35],
    ['0.35', 0.35],
    ['1.234,5', 1234.5],
    [' 800 ', 800],
    ['-2,5', -2.5],
  ])('liest "%s" als %d', (input, expected) => {
    expect(parseGermanNumber(input)).toBe(expected);
  });

  it.each(['', 'abc', '1,2,3', '12a'])('gibt NaN für ungültige Eingabe "%s"', (input) => {
    expect(parseGermanNumber(input)).toBeNaN();
  });
});
