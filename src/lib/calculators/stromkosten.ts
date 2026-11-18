/**
 * Stromkosten eines Geräts
 *
 * Zwei Wege:
 * - "leistung": Leistung (W) × Nutzungsdauer, optional plus Standby-Verbrauch
 * - "jahresverbrauch": Jahresverbrauch in kWh, z. B. vom EU-Energielabel
 *
 * Formel: Kosten = Verbrauch (kWh) × Strompreis (€/kWh)
 *         Verbrauch (kWh) = Leistung (W) × Stunden ÷ 1000
 */

export const STUNDEN_PRO_JAHR = 365 * 24;
export const WOCHEN_PRO_JAHR = 365 / 7;

export type StromkostenModus = 'leistung' | 'jahresverbrauch';

export interface StromkostenEingabe {
  modus: StromkostenModus;
  /** Leistung im Betrieb in Watt (nur Modus "leistung") */
  leistungW: number;
  /** Betriebsstunden an Nutzungstagen (nur Modus "leistung") */
  stundenProTag: number;
  /** Nutzungstage pro Woche, 1–7 (nur Modus "leistung") */
  tageProWoche: number;
  /** Leistung im Standby in Watt, in der restlichen Zeit (nur Modus "leistung") */
  standbyW: number;
  /** Jahresverbrauch in kWh (nur Modus "jahresverbrauch") */
  jahresverbrauchKwh: number;
  strompreisCt: number;
}

export interface StromkostenErgebnis {
  betriebsstundenJahr: number;
  betriebKwh: number;
  standbyKwh: number;
  verbrauchKwhJahr: number;
  kostenJahrEuro: number;
  kostenMonatEuro: number;
  standbyKostenJahrEuro: number;
  /** Kosten pro Betriebsstunde, null im Modus "jahresverbrauch" */
  kostenProStundeEuro: number | null;
  hinweise: string[];
}

export function berechneStromkosten(e: StromkostenEingabe): StromkostenErgebnis {
  const preis = e.strompreisCt / 100;
  const hinweise: string[] = [];

  if (e.modus === 'jahresverbrauch') {
    const verbrauch = e.jahresverbrauchKwh;
    return {
      betriebsstundenJahr: 0,
      betriebKwh: verbrauch,
      standbyKwh: 0,
      verbrauchKwhJahr: verbrauch,
      kostenJahrEuro: verbrauch * preis,
      kostenMonatEuro: (verbrauch * preis) / 12,
      standbyKostenJahrEuro: 0,
      kostenProStundeEuro: null,
      hinweise,
    };
  }

  const betriebsstundenJahr = e.stundenProTag * e.tageProWoche * WOCHEN_PRO_JAHR;
  const standbyStunden = Math.max(0, STUNDEN_PRO_JAHR - betriebsstundenJahr);
  const betriebKwh = (e.leistungW * betriebsstundenJahr) / 1000;
  const standbyKwh = (e.standbyW * standbyStunden) / 1000;
  const verbrauchKwhJahr = betriebKwh + standbyKwh;

  if (e.stundenProTag >= 24 && e.leistungW >= 50) {
    hinweise.push(
      'Läuft das Gerät wirklich rund um die Uhr mit voller Leistung? Kühlschränke und Heizgeräte schalten sich zwischendurch ab – nutze dafür besser den Jahresverbrauch vom Energielabel.',
    );
  }
  if (e.leistungW >= 2000 && e.stundenProTag > 4) {
    hinweise.push('Hohe Leistung über viele Stunden: Prüfe, ob das Gerät wirklich so lange auf voller Leistung läuft.');
  }

  return {
    betriebsstundenJahr,
    betriebKwh,
    standbyKwh,
    verbrauchKwhJahr,
    kostenJahrEuro: verbrauchKwhJahr * preis,
    kostenMonatEuro: (verbrauchKwhJahr * preis) / 12,
    standbyKostenJahrEuro: standbyKwh * preis,
    kostenProStundeEuro: (e.leistungW / 1000) * preis,
    hinweise,
  };
}
