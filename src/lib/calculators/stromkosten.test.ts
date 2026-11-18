import { describe, expect, it } from 'vitest';
import { berechneStromkosten, STUNDEN_PRO_JAHR, type StromkostenEingabe } from './stromkosten';

const basis: StromkostenEingabe = {
  modus: 'leistung',
  leistungW: 100,
  stundenProTag: 4,
  tageProWoche: 7,
  standbyW: 0,
  jahresverbrauchKwh: 0,
  strompreisCt: 40,
};

describe('berechneStromkosten – Modus Leistung', () => {
  it('100 W × 4 h × 365 Tage = 146 kWh', () => {
    const r = berechneStromkosten(basis);
    expect(r.betriebsstundenJahr).toBeCloseTo(1460, 6);
    expect(r.verbrauchKwhJahr).toBeCloseTo(146, 6);
    expect(r.kostenJahrEuro).toBeCloseTo(58.4, 6);
    expect(r.kostenMonatEuro).toBeCloseTo(58.4 / 12, 6);
  });

  it('Kosten pro Betriebsstunde = kW × Preis', () => {
    expect(berechneStromkosten(basis).kostenProStundeEuro).toBeCloseTo(0.04, 6);
  });

  it('weniger Nutzungstage senken den Verbrauch anteilig', () => {
    const r = berechneStromkosten({ ...basis, tageProWoche: 2 });
    expect(r.verbrauchKwhJahr).toBeCloseTo((146 * 2) / 7, 6);
  });

  it('Standby läuft in allen übrigen Stunden des Jahres', () => {
    const r = berechneStromkosten({ ...basis, standbyW: 1 });
    expect(r.standbyKwh).toBeCloseTo((STUNDEN_PRO_JAHR - 1460) / 1000, 6);
    expect(r.verbrauchKwhJahr).toBeCloseTo(146 + (STUNDEN_PRO_JAHR - 1460) / 1000, 6);
    expect(r.standbyKostenJahrEuro).toBeCloseTo(r.standbyKwh * 0.4, 6);
  });

  it('bei 24 h Betrieb gibt es keinen Standby-Anteil', () => {
    const r = berechneStromkosten({ ...basis, stundenProTag: 24, standbyW: 5 });
    expect(r.standbyKwh).toBe(0);
  });

  it('weist bei Dauerbetrieb mit hoher Leistung auf das Energielabel hin', () => {
    const r = berechneStromkosten({ ...basis, stundenProTag: 24, leistungW: 150 });
    expect(r.hinweise.join(' ')).toContain('Energielabel');
  });
});

describe('berechneStromkosten – Modus Jahresverbrauch', () => {
  it('rechnet direkt mit dem angegebenen Jahresverbrauch', () => {
    const r = berechneStromkosten({ ...basis, modus: 'jahresverbrauch', jahresverbrauchKwh: 150 });
    expect(r.verbrauchKwhJahr).toBe(150);
    expect(r.kostenJahrEuro).toBeCloseTo(60, 6);
    expect(r.kostenProStundeEuro).toBeNull();
  });

  it('ignoriert Felder des anderen Modus, auch wenn sie ungültig sind', () => {
    const r = berechneStromkosten({
      ...basis,
      modus: 'jahresverbrauch',
      jahresverbrauchKwh: 100,
      leistungW: Number.NaN,
      stundenProTag: Number.NaN,
    });
    expect(r.kostenJahrEuro).toBeCloseTo(40, 6);
  });
});
