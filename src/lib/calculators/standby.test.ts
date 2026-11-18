import { describe, expect, it } from 'vitest';
import { berechneStandby, GERAETE, kwhProJahr, type StandbyEingabe } from './standby';

const basis: StandbyEingabe = {
  modus: 'geraete',
  geraete: [
    { id: 'a', name: 'Gerät A', anzahl: 1, watt: 2 },
    { id: 'b', name: 'Gerät B', anzahl: 2, watt: 0.5 },
    { id: 'c', name: 'Gerät C', anzahl: 0, watt: 10 },
  ],
  gemessenW: 0,
  stundenProTag: 24,
  strompreisCt: 40,
};

describe('kwhProJahr', () => {
  it('1 W rund um die Uhr = 8,76 kWh im Jahr', () => {
    expect(kwhProJahr(1, 24)).toBeCloseTo(8.76, 6);
  });
});

describe('berechneStandby – Geräteliste', () => {
  it('summiert Anzahl × Leistung über alle Geräte', () => {
    const r = berechneStandby(basis);
    expect(r.leistungW).toBeCloseTo(3, 6);
    expect(r.verbrauchKwhJahr).toBeCloseTo(3 * 8.76, 6);
    expect(r.kostenJahrEuro).toBeCloseTo(3 * 8.76 * 0.4, 6);
    expect(r.kosten10JahreEuro).toBeCloseTo(r.kostenJahrEuro * 10, 6);
  });

  it('listet nur Geräte mit Verbrauch, teuerstes zuerst', () => {
    const r = berechneStandby(basis);
    expect(r.posten.map((p) => p.id)).toEqual(['a', 'b']);
    expect(r.groessterPosten?.name).toBe('Gerät A');
  });

  it('Standby-Stunden wirken anteilig', () => {
    const halb = berechneStandby({ ...basis, stundenProTag: 12 });
    expect(halb.kostenJahrEuro).toBeCloseTo(berechneStandby(basis).kostenJahrEuro / 2, 6);
  });

  it('ohne Geräte gibt es keine Kosten und keinen größten Posten', () => {
    const r = berechneStandby({ ...basis, geraete: [] });
    expect(r.kostenJahrEuro).toBe(0);
    expect(r.groessterPosten).toBeNull();
  });
});

describe('berechneStandby – gemessen', () => {
  it('nutzt die gemessene Gesamtleistung und ignoriert die Geräteliste', () => {
    const r = berechneStandby({ ...basis, modus: 'gemessen', gemessenW: 25, geraete: [{ id: 'x', name: 'x', anzahl: Number.NaN, watt: Number.NaN }] });
    expect(r.leistungW).toBe(25);
    expect(r.kostenJahrEuro).toBeCloseTo(25 * 8.76 * 0.4, 6);
    expect(r.posten).toEqual([]);
  });
});

describe('GERAETE', () => {
  it('hat eindeutige IDs', () => {
    const ids = GERAETE.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('Startwerte sind die EU-Höchstwerte (0,5 / 0,8 / 2 W)', () => {
    for (const g of GERAETE) expect([0.5, 0.8, 2]).toContain(g.grenzwert.wert);
  });
});
