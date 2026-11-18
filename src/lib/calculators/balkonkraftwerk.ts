/**
 * Balkonkraftwerk: Ertrag & Amortisation
 *
 * Reine Rechenlogik ohne Oberfläche – wird von der Rechner-Seite und den Tests genutzt.
 *
 * Rechenweg:
 * 1. Spezifischer Ertrag (kWh pro kWp) aus PVGIS für Ausrichtung + Neigung
 * 2. × Modulleistung in kWp
 * 3. × Anteil, der trotz Wechselrichter-Grenze übrig bleibt (aus PVGIS-Stundenwerten)
 * 4. × Verschattungsfaktor
 * 5. Eigenverbrauch = Ertrag × Eigenverbrauchsanteil
 * 6. Ersparnis = Eigenverbrauch × Strompreis (Einspeisung wird nicht vergütet)
 * 7. Amortisation: Jahr, in dem die aufsummierte Ersparnis die Anschaffungskosten erreicht
 *    (mit Modulalterung und optionaler Strompreisänderung)
 */
import pvgis from '@/data/pvgis-deutschland.json';

export const AUSRICHTUNGEN = {
  sued: 'Süd',
  suedost: 'Südost',
  suedwest: 'Südwest',
  ost: 'Ost',
  west: 'West',
  nordost: 'Nordost',
  nordwest: 'Nordwest',
  nord: 'Nord',
} as const;
export type Ausrichtung = keyof typeof AUSRICHTUNGEN;

export const NEIGUNGEN = [0, 15, 30, 45, 60, 90] as const;
export type Neigung = (typeof NEIGUNGEN)[number];

/**
 * Verschattung: pauschale Abschläge (eigene Annahme).
 * Hinweis der Verbraucherzentrale: Schon wenige Prozent Schatten auf einem Modul
 * können die Leistung zeitweise um mehr als 50 % senken.
 */
export const VERSCHATTUNG = {
  keine: { label: 'Keine', faktor: 1 },
  leicht: { label: 'Leicht (z. B. morgens oder abends)', faktor: 0.9 },
  mittel: { label: 'Mittel (einige Stunden am Tag)', faktor: 0.75 },
  stark: { label: 'Stark (große Teile des Tages)', faktor: 0.5 },
} as const;
export type Verschattung = keyof typeof VERSCHATTUNG;

export interface BalkonkraftwerkEingabe {
  modulleistungWp: number;
  wechselrichterW: number;
  ausrichtung: Ausrichtung;
  neigung: Neigung;
  verschattung: Verschattung;
  eigenverbrauchProzent: number;
  strompreisCt: number;
  anschaffungEuro: number;
  /** Optional, Standard 0 */
  strompreisSteigerungProzent?: number;
  /** Optional, Standard 0,5 */
  alterungProzent?: number;
}

export interface BalkonkraftwerkErgebnis {
  /** Spezifischer Ertrag laut PVGIS ohne Begrenzung/Verschattung */
  spezifischerErtragKwhProKwp: number;
  /** Anteil, der trotz Wechselrichter-Grenze erhalten bleibt (0–1) */
  begrenzungsFaktor: number;
  jahresertragKwh: number;
  eigenverbrauchKwh: number;
  einspeisungKwh: number;
  ersparnisJahrEuro: number;
  /** Jahre bis zur Amortisation, null = nicht innerhalb von 30 Jahren */
  amortisationJahre: number | null;
  ersparnis20JahreEuro: number;
  gewinn20JahreEuro: number;
  hinweise: string[];
}

export const BETRACHTUNGSZEITRAUM_JAHRE = 20;
const MAX_AMORTISATION_JAHRE = 30;

/** Spezifischer Ertrag in kWh pro kWp und Jahr (PVGIS, Mitte Deutschlands). */
export function spezifischerErtrag(ausrichtung: Ausrichtung, neigung: Neigung): number {
  const tabelle = pvgis.ertrag[ausrichtung] as Record<string, number>;
  const wert = tabelle[String(neigung)];
  if (wert === undefined) throw new Error(`Keine Ertragsdaten für ${ausrichtung} / ${neigung}°`);
  return wert;
}

/**
 * Anteil des Ertrags, der bei begrenzter Wechselrichterleistung erhalten bleibt.
 * Zwischen den berechneten Verhältnissen wird linear interpoliert.
 */
export function begrenzungsFaktor(
  modulleistungWp: number,
  wechselrichterW: number,
  ausrichtung: Ausrichtung,
  neigung: Neigung,
): number {
  if (wechselrichterW <= 0) return 0;
  const verhaeltnis = modulleistungWp / wechselrichterW;
  const stuetzstellen = pvgis.begrenzung.verhaeltnisse;
  const anteile = (pvgis.begrenzung.anteil[ausrichtung] as Record<string, number[]>)[String(neigung)];

  if (verhaeltnis <= stuetzstellen[0]) return 1;
  const letzte = stuetzstellen.length - 1;
  if (verhaeltnis >= stuetzstellen[letzte]) {
    // Außerhalb der Tabelle: Ertrag wächst praktisch nicht mehr mit der Modulleistung
    return (anteile[letzte] * stuetzstellen[letzte]) / verhaeltnis;
  }
  for (let i = 0; i < letzte; i++) {
    const a = stuetzstellen[i];
    const b = stuetzstellen[i + 1];
    if (verhaeltnis >= a && verhaeltnis <= b) {
      const t = (verhaeltnis - a) / (b - a);
      return anteile[i] + t * (anteile[i + 1] - anteile[i]);
    }
  }
  return 1;
}

export function berechneBalkonkraftwerk(e: BalkonkraftwerkEingabe): BalkonkraftwerkErgebnis {
  const steigerung = (e.strompreisSteigerungProzent ?? 0) / 100;
  const alterung = (e.alterungProzent ?? 0.5) / 100;
  const hinweise: string[] = [];

  if (e.wechselrichterW > 800) {
    hinweise.push('Für Balkonkraftwerke sind höchstens 800 W Wechselrichterleistung erlaubt.');
  }
  if (e.modulleistungWp > 2000) {
    hinweise.push('Für Balkonkraftwerke sind höchstens 2.000 Wp Modulleistung erlaubt.');
  }
  if (e.ausrichtung.startsWith('nord') && e.neigung >= 30) {
    hinweise.push('Nach Norden geneigte Module bringen wenig Ertrag. Die Verbraucherzentrale rät davon ab.');
  }

  const spezifisch = spezifischerErtrag(e.ausrichtung, e.neigung);
  const begrenzung = begrenzungsFaktor(e.modulleistungWp, e.wechselrichterW, e.ausrichtung, e.neigung);
  const schatten = VERSCHATTUNG[e.verschattung].faktor;

  const jahresertragKwh = (e.modulleistungWp / 1000) * spezifisch * begrenzung * schatten;
  const eigenverbrauchKwh = jahresertragKwh * (e.eigenverbrauchProzent / 100);
  const einspeisungKwh = jahresertragKwh - eigenverbrauchKwh;
  const ersparnisJahrEuro = eigenverbrauchKwh * (e.strompreisCt / 100);

  if (begrenzung < 0.95) {
    hinweise.push(
      `Der Wechselrichter begrenzt: Etwa ${Math.round((1 - begrenzung) * 100)} % des möglichen Ertrags gehen an sonnigen Mittagen verloren.`,
    );
  }

  const ersparnisImJahr = (jahr: number) =>
    ersparnisJahrEuro * Math.pow(1 - alterung, jahr - 1) * Math.pow(1 + steigerung, jahr - 1);

  // Amortisation: aufsummieren, im letzten Jahr anteilig interpolieren
  let amortisationJahre: number | null = null;
  if (e.anschaffungEuro <= 0) {
    amortisationJahre = 0;
  } else {
    let summe = 0;
    for (let jahr = 1; jahr <= MAX_AMORTISATION_JAHRE; jahr++) {
      const s = ersparnisImJahr(jahr);
      if (s > 0 && summe + s >= e.anschaffungEuro) {
        amortisationJahre = jahr - 1 + (e.anschaffungEuro - summe) / s;
        break;
      }
      summe += s;
    }
  }

  let ersparnis20JahreEuro = 0;
  for (let jahr = 1; jahr <= BETRACHTUNGSZEITRAUM_JAHRE; jahr++) {
    ersparnis20JahreEuro += ersparnisImJahr(jahr);
  }

  return {
    spezifischerErtragKwhProKwp: spezifisch,
    begrenzungsFaktor: begrenzung,
    jahresertragKwh,
    eigenverbrauchKwh,
    einspeisungKwh,
    ersparnisJahrEuro,
    amortisationJahre,
    ersparnis20JahreEuro,
    gewinn20JahreEuro: ersparnis20JahreEuro - e.anschaffungEuro,
    hinweise,
  };
}
