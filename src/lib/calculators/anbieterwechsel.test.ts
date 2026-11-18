import { describe, expect, it } from 'vitest';
import { berechneWechsel, gleichstand, jahreskosten, type WechselEingabe } from './anbieterwechsel';

const basis: WechselEingabe = {
  verbrauchKwh: 3000,
  alt: { arbeitspreisCt: 40, grundpreisMonatEuro: 10 },
  neu: { arbeitspreisCt: 30, grundpreisMonatEuro: 15 },
  bonusEuro: 50,
};

describe('jahreskosten', () => {
  it('Verbrauch × Arbeitspreis + 12 × Grundpreis', () => {
    expect(jahreskosten({ arbeitspreisCt: 40, grundpreisMonatEuro: 10 }, 3000)).toBeCloseTo(1320, 6);
  });
});

describe('berechneWechsel', () => {
  it('rechnet Ersparnis mit und ohne Bonus', () => {
    const r = berechneWechsel(basis);
    expect(r.kostenAltEuro).toBeCloseTo(1320, 6);
    expect(r.kostenNeuEuro).toBeCloseTo(1080, 6);
    expect(r.ersparnisFolgejahreEuro).toBeCloseTo(240, 6);
    expect(r.ersparnisJahr1Euro).toBeCloseTo(290, 6);
    expect(r.abschlagNeuEuro).toBeCloseTo(90, 6);
  });

  it('warnt, wenn nur der Bonus die Ersparnis bringt', () => {
    const r = berechneWechsel({ ...basis, neu: { arbeitspreisCt: 41, grundpreisMonatEuro: 10 }, bonusEuro: 100 });
    expect(r.ersparnisJahr1Euro).toBeGreaterThan(0);
    expect(r.ersparnisFolgejahreEuro).toBeLessThan(0);
    expect(r.hinweise.join(' ')).toContain('Bonus');
  });

  it('nennt den Verbrauch, ab dem der neue Tarif günstiger ist', () => {
    const r = berechneWechsel(basis);
    // 60 € höherer Grundpreis ÷ 0,10 €/kWh günstiger = 600 kWh
    expect(r.gleichstandKwh).toBeCloseTo(600, 6);
    expect(r.hinweise.join(' ')).toContain('erst ab');
  });
});

describe('gleichstand', () => {
  it('ist null bei gleichem Arbeitspreis', () => {
    expect(gleichstand({ arbeitspreisCt: 30, grundpreisMonatEuro: 10 }, { arbeitspreisCt: 30, grundpreisMonatEuro: 12 })).toBeNull();
  });

  it('ist null, wenn ein Tarif in allem günstiger ist', () => {
    expect(gleichstand({ arbeitspreisCt: 40, grundpreisMonatEuro: 15 }, { arbeitspreisCt: 30, grundpreisMonatEuro: 10 })).toBeNull();
  });

  it('erkennt "nur bis": neuer Tarif mit niedrigerem Grundpreis, aber höherem Arbeitspreis', () => {
    const kwh = gleichstand({ arbeitspreisCt: 30, grundpreisMonatEuro: 15 }, { arbeitspreisCt: 35, grundpreisMonatEuro: 10 });
    expect(kwh).toBeCloseTo(1200, 6); // 60 € ÷ 0,05 €/kWh
  });
});
