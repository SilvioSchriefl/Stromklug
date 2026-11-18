import { describe, expect, it } from 'vitest';
import { berechneSpeicher, tagesertraege, tageskappe, type SpeicherEingabe } from './speicher';

const basis: SpeicherEingabe = {
  jahresertragKwh: 654,
  montage: 'senkrechtSued',
  eigenverbrauchOhneProzent: 50,
  kapazitaetKwh: 2,
  grundlastW: 100,
  wirkungsgradProzent: 85,
  standbyW: 5,
  mehrkostenEuro: 750,
  strompreisCt: 37.3,
  lebensdauerJahre: 10,
};

describe('tagesertraege', () => {
  it('verteilt den Jahresertrag vollständig auf 365 Tage', () => {
    const t = tagesertraege(1000, 'senkrechtSued');
    expect(t).toHaveLength(365);
    expect(t.reduce((a, b) => a + b, 0)).toBeCloseTo(1000, 0);
  });

  it('liefert im Juni mehr als im Dezember', () => {
    const t = tagesertraege(1000, 'geneigtSued');
    expect(t[171]).toBeGreaterThan(t[354] * 2);
  });
});

describe('tageskappe', () => {
  const ertraege = [1, 2, 3, 4];

  it('trifft den gewünschten Eigenverbrauchsanteil', () => {
    const c = tageskappe(ertraege, 0.5); // Ziel: 5 von 10 kWh
    const genutzt = ertraege.reduce((s, e) => s + Math.min(e, c), 0);
    expect(genutzt).toBeCloseTo(5, 6);
  });

  it('ist 0 bei 0 % und das Maximum bei 100 %', () => {
    expect(tageskappe(ertraege, 0)).toBe(0);
    expect(tageskappe(ertraege, 1)).toBe(4);
  });
});

describe('berechneSpeicher', () => {
  it('Energiebilanz ist stimmig', () => {
    const r = berechneSpeicher(basis);
    expect(r.ueberschussKwh).toBeCloseTo(654 * 0.5, 0);
    expect(r.geladenKwh).toBeLessThanOrEqual(r.ueberschussKwh + 1e-9);
    expect(r.abgegebenKwh).toBeLessThanOrEqual(r.geladenKwh * 0.85 + 2 + 1e-9); // + Startladung
    expect(r.standbyKwh).toBeCloseTo(43.8, 6);
    expect(r.nettoKwh).toBeCloseTo(r.abgegebenKwh - 43.8, 6);
  });

  it('kann höchstens eine Ladung pro Tag nutzen', () => {
    const r = berechneSpeicher(basis);
    expect(r.vollzyklen).toBeLessThanOrEqual(365);
  });

  it('ohne Kapazität gibt es keinen Nutzen, nur Standby-Verlust', () => {
    const r = berechneSpeicher({ ...basis, kapazitaetKwh: 0 });
    expect(r.abgegebenKwh).toBe(0);
    expect(r.ersparnisJahrEuro).toBeLessThan(0);
    expect(r.amortisationJahre).toBeNull();
    expect(r.urteil).toBe('lohntNicht');
  });

  it('mehr Grundlast nachts bringt mehr Nutzen', () => {
    const wenig = berechneSpeicher({ ...basis, grundlastW: 50 }).abgegebenKwh;
    const viel = berechneSpeicher({ ...basis, grundlastW: 200 }).abgegebenKwh;
    expect(viel).toBeGreaterThan(wenig);
  });

  it('bei 100 % Eigenverbrauch ohne Speicher gibt es keinen Überschuss', () => {
    const r = berechneSpeicher({ ...basis, eigenverbrauchOhneProzent: 100 });
    expect(r.ueberschussKwh).toBeCloseTo(0, 6);
    expect(r.abgegebenKwh).toBeCloseTo(0, 6);
  });

  it('der Abgabe-Wert wird durch den Wirkungsgrad begrenzt', () => {
    const verlustfrei = berechneSpeicher({ ...basis, wirkungsgradProzent: 100 }).abgegebenKwh;
    const mitVerlust = berechneSpeicher({ ...basis, wirkungsgradProzent: 80 }).abgegebenKwh;
    expect(mitVerlust).toBeLessThan(verlustfrei);
  });

  it('Amortisation = Mehrkosten ÷ Ersparnis, Bilanz über die Lebensdauer', () => {
    const r = berechneSpeicher(basis);
    if (r.amortisationJahre !== null) {
      expect(r.amortisationJahre).toBeCloseTo(750 / r.ersparnisJahrEuro, 6);
    }
    expect(r.bilanzLebensdauerEuro).toBeCloseTo(r.ersparnisJahrEuro * 10 - 750, 6);
  });

  it('günstiger Speicher mit viel Überschuss lohnt sich', () => {
    const r = berechneSpeicher({
      ...basis,
      jahresertragKwh: 1500,
      montage: 'geneigtSued',
      eigenverbrauchOhneProzent: 30,
      grundlastW: 200,
      mehrkostenEuro: 300,
      strompreisCt: 40,
    });
    expect(r.urteil).toBe('lohnt');
  });
});
