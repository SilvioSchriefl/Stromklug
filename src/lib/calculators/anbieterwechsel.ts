/**
 * Stromanbieter-Wechsel: Ersparnis
 *
 * Kosten pro Jahr = Verbrauch × Arbeitspreis + Grundpreis × 12
 * Ersparnis im 1. Jahr = Kosten alt − Kosten neu + Bonus (einmalig)
 * Ersparnis ab dem 2. Jahr = Kosten alt − Kosten neu (gleiche Preise angenommen)
 */

export interface Tarif {
  /** Arbeitspreis in ct/kWh */
  arbeitspreisCt: number;
  /** Grundpreis in € pro Monat */
  grundpreisMonatEuro: number;
}

export interface WechselEingabe {
  verbrauchKwh: number;
  alt: Tarif;
  neu: Tarif;
  /** Einmaliger Bonus des neuen Anbieters in € (Neukunden- oder Sofortbonus) */
  bonusEuro: number;
}

export interface WechselErgebnis {
  kostenAltEuro: number;
  kostenNeuEuro: number;
  ersparnisJahr1Euro: number;
  ersparnisFolgejahreEuro: number;
  /** Monatlicher Abschlag beim neuen Tarif (Kosten ÷ 12, ohne Bonus) */
  abschlagNeuEuro: number;
  /** Verbrauch, bei dem beide Tarife gleich teuer sind; null = kein Schnittpunkt */
  gleichstandKwh: number | null;
  hinweise: string[];
}

export function jahreskosten(t: Tarif, verbrauchKwh: number): number {
  return (verbrauchKwh * t.arbeitspreisCt) / 100 + t.grundpreisMonatEuro * 12;
}

/** Verbrauch, ab dem sich die Reihenfolge der beiden Tarife umdreht. */
export function gleichstand(alt: Tarif, neu: Tarif): number | null {
  const diffArbeit = (alt.arbeitspreisCt - neu.arbeitspreisCt) / 100; // €/kWh, die neu pro kWh günstiger ist
  const diffGrund = (neu.grundpreisMonatEuro - alt.grundpreisMonatEuro) * 12; // €/Jahr, die neu fix teurer ist
  if (diffArbeit === 0) return null;
  const kwh = diffGrund / diffArbeit;
  return kwh > 0 ? kwh : null;
}

export function berechneWechsel(e: WechselEingabe): WechselErgebnis {
  const kostenAltEuro = jahreskosten(e.alt, e.verbrauchKwh);
  const kostenNeuEuro = jahreskosten(e.neu, e.verbrauchKwh);
  const ersparnisFolgejahreEuro = kostenAltEuro - kostenNeuEuro;
  const ersparnisJahr1Euro = ersparnisFolgejahreEuro + e.bonusEuro;
  const gleichstandKwh = gleichstand(e.alt, e.neu);
  const hinweise: string[] = [];

  if (ersparnisJahr1Euro > 0 && ersparnisFolgejahreEuro < 0) {
    hinweise.push(
      'Die Ersparnis kommt nur durch den Bonus zustande. Ab dem zweiten Jahr ist der neue Tarif teurer – kündige rechtzeitig und vergleiche erneut.',
    );
  }
  if (gleichstandKwh !== null) {
    const guenstigerUnten = e.neu.grundpreisMonatEuro < e.alt.grundpreisMonatEuro;
    const kwh = Math.round(gleichstandKwh).toLocaleString('de-DE');
    hinweise.push(
      guenstigerUnten
        ? `Der neue Tarif ist nur bis zu einem Verbrauch von etwa ${kwh} kWh günstiger.`
        : `Der neue Tarif ist erst ab einem Verbrauch von etwa ${kwh} kWh günstiger.`,
    );
  }

  return {
    kostenAltEuro,
    kostenNeuEuro,
    ersparnisJahr1Euro,
    ersparnisFolgejahreEuro,
    abschlagNeuEuro: kostenNeuEuro / 12,
    gleichstandKwh,
    hinweise,
  };
}
