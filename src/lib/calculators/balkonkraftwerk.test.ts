import { describe, expect, it } from 'vitest';
import {
  begrenzungsFaktor,
  berechneBalkonkraftwerk,
  spezifischerErtrag,
  type BalkonkraftwerkEingabe,
} from './balkonkraftwerk';

const basis: BalkonkraftwerkEingabe = {
  modulleistungWp: 900,
  wechselrichterW: 800,
  ausrichtung: 'sued',
  neigung: 30,
  verschattung: 'keine',
  eigenverbrauchProzent: 50,
  strompreisCt: 37.3,
  anschaffungEuro: 400,
  alterungProzent: 0,
  strompreisSteigerungProzent: 0,
};

describe('spezifischerErtrag', () => {
  it('liefert den PVGIS-Wert für Süd 30°', () => {
    expect(spezifischerErtrag('sued', 30)).toBe(1029);
  });

  it('ist bei senkrechten Modulen deutlich niedriger als bei 30°', () => {
    expect(spezifischerErtrag('sued', 90)).toBeLessThan(spezifischerErtrag('sued', 30) * 0.8);
  });

  it('ist bei flach liegenden Modulen unabhängig von der Ausrichtung', () => {
    expect(spezifischerErtrag('nord', 0)).toBe(spezifischerErtrag('sued', 0));
  });
});

describe('begrenzungsFaktor', () => {
  it('ist 1, wenn der Wechselrichter größer als die Module ist', () => {
    expect(begrenzungsFaktor(600, 800, 'sued', 30)).toBe(1);
  });

  it('entspricht dem Tabellenwert bei 2.000 Wp / 800 W (Verhältnis 2,5)', () => {
    expect(begrenzungsFaktor(2000, 800, 'sued', 30)).toBeCloseTo(0.7973, 4);
  });

  it('interpoliert linear zwischen zwei Tabellenwerten', () => {
    // 900/800 = 1,125 → Mitte zwischen 1,0 (Anteil 1) und 1,25 (Anteil 0,9991)
    expect(begrenzungsFaktor(900, 800, 'sued', 30)).toBeCloseTo(0.99955, 5);
  });

  it('sinkt außerhalb der Tabelle weiter, statt bei einem festen Wert stehen zu bleiben', () => {
    expect(begrenzungsFaktor(2000, 400, 'sued', 30)).toBeLessThan(begrenzungsFaktor(2000, 500, 'sued', 30));
  });
});

describe('berechneBalkonkraftwerk', () => {
  it('rechnet das Standardbeispiel nachvollziehbar', () => {
    const r = berechneBalkonkraftwerk(basis);
    const ertrag = 0.9 * 1029 * 0.99955;
    expect(r.jahresertragKwh).toBeCloseTo(ertrag, 1);
    expect(r.eigenverbrauchKwh).toBeCloseTo(ertrag * 0.5, 1);
    expect(r.einspeisungKwh).toBeCloseTo(ertrag * 0.5, 1);
    expect(r.ersparnisJahrEuro).toBeCloseTo(ertrag * 0.5 * 0.373, 2);
    expect(r.amortisationJahre).toBeCloseTo(400 / (ertrag * 0.5 * 0.373), 3);
  });

  it('ohne Alterung und Preisänderung ist die 20-Jahres-Ersparnis 20 × die Jahresersparnis', () => {
    const r = berechneBalkonkraftwerk(basis);
    expect(r.ersparnis20JahreEuro).toBeCloseTo(r.ersparnisJahrEuro * 20, 6);
    expect(r.gewinn20JahreEuro).toBeCloseTo(r.ersparnisJahrEuro * 20 - 400, 6);
  });

  it('Alterung senkt die 20-Jahres-Ersparnis, Strompreissteigerung erhöht sie', () => {
    const ohne = berechneBalkonkraftwerk(basis).ersparnis20JahreEuro;
    expect(berechneBalkonkraftwerk({ ...basis, alterungProzent: 0.5 }).ersparnis20JahreEuro).toBeLessThan(ohne);
    expect(berechneBalkonkraftwerk({ ...basis, strompreisSteigerungProzent: 2 }).ersparnis20JahreEuro).toBeGreaterThan(
      ohne,
    );
  });

  it('starke Verschattung halbiert den Ertrag', () => {
    const voll = berechneBalkonkraftwerk(basis).jahresertragKwh;
    expect(berechneBalkonkraftwerk({ ...basis, verschattung: 'stark' }).jahresertragKwh).toBeCloseTo(voll / 2, 6);
  });

  it('gibt null zurück, wenn sich die Anlage nicht innerhalb von 30 Jahren bezahlt macht', () => {
    const r = berechneBalkonkraftwerk({ ...basis, eigenverbrauchProzent: 1, anschaffungEuro: 2000 });
    expect(r.amortisationJahre).toBeNull();
  });

  it('Amortisation ist 0 bei geschenkter Anlage', () => {
    expect(berechneBalkonkraftwerk({ ...basis, anschaffungEuro: 0 }).amortisationJahre).toBe(0);
  });

  it('warnt bei Überschreitung der gesetzlichen Grenzen', () => {
    const r = berechneBalkonkraftwerk({ ...basis, modulleistungWp: 2400, wechselrichterW: 1000 });
    expect(r.hinweise.join(' ')).toContain('800 W');
    expect(r.hinweise.join(' ')).toContain('2.000 Wp');
  });

  it('weist auf starke Begrenzung durch den Wechselrichter hin', () => {
    const r = berechneBalkonkraftwerk({ ...basis, modulleistungWp: 2000 });
    expect(r.hinweise.some((h) => h.includes('begrenzt'))).toBe(true);
  });

  it('nutzt 0,5 % Alterung, wenn nichts angegeben ist', () => {
    const { alterungProzent: _, ...ohneAlterung } = basis;
    const standard = berechneBalkonkraftwerk(ohneAlterung).ersparnis20JahreEuro;
    const explizit = berechneBalkonkraftwerk({ ...basis, alterungProzent: 0.5 }).ersparnis20JahreEuro;
    expect(standard).toBeCloseTo(explizit, 6);
  });
});
