/**
 * Standby-Kosten im Haushalt
 *
 * Zwei Wege:
 * - "geraete": Liste typischer Geräte, je Anzahl × Standby-Leistung
 * - "gemessen": gemessene Gesamt-Standby-Leistung (z. B. Strommessgerät oder Zähler)
 *
 * Verbrauch (kWh/Jahr) = Leistung (W) × Stunden pro Tag × 365 ÷ 1000
 * Kosten = Verbrauch × Strompreis
 */
import { EU_STANDBY_MIT_ANZEIGE, EU_STANDBY_OHNE_ANZEIGE, EU_STANDBY_VERNETZT, type Standardwert } from '@/data/standardwerte';

export interface GeraeteVorlage {
  id: string;
  name: string;
  /** Welcher EU-Höchstwert für Neugeräte passt typischerweise */
  grenzwert: Standardwert;
  grenzwertArt: 'vernetzt' | 'mit Anzeige' | 'ohne Anzeige';
  /** Standard-Anzahl im Rechner */
  anzahl: number;
}

/**
 * Gerätevorlagen. Startwert der Leistung ist jeweils der EU-Höchstwert für Neugeräte –
 * ältere Geräte verbrauchen oft deutlich mehr.
 */
export const GERAETE: GeraeteVorlage[] = [
  { id: 'tv', name: 'Fernseher (Smart-TV)', grenzwert: EU_STANDBY_VERNETZT, grenzwertArt: 'vernetzt', anzahl: 1 },
  { id: 'receiver', name: 'TV-Receiver / Streaming-Box', grenzwert: EU_STANDBY_VERNETZT, grenzwertArt: 'vernetzt', anzahl: 1 },
  { id: 'konsole', name: 'Spielkonsole', grenzwert: EU_STANDBY_VERNETZT, grenzwertArt: 'vernetzt', anzahl: 0 },
  { id: 'audio', name: 'Soundsystem / Stereoanlage', grenzwert: EU_STANDBY_MIT_ANZEIGE, grenzwertArt: 'mit Anzeige', anzahl: 1 },
  { id: 'pc', name: 'Computer mit Monitor', grenzwert: EU_STANDBY_OHNE_ANZEIGE, grenzwertArt: 'ohne Anzeige', anzahl: 1 },
  { id: 'drucker', name: 'Drucker (WLAN)', grenzwert: EU_STANDBY_VERNETZT, grenzwertArt: 'vernetzt', anzahl: 1 },
  { id: 'kaffee', name: 'Kaffeemaschine mit Display', grenzwert: EU_STANDBY_MIT_ANZEIGE, grenzwertArt: 'mit Anzeige', anzahl: 1 },
  { id: 'kueche', name: 'Mikrowelle / Herd mit Uhr', grenzwert: EU_STANDBY_MIT_ANZEIGE, grenzwertArt: 'mit Anzeige', anzahl: 1 },
  { id: 'smart', name: 'Smart Speaker / Smart-Home-Geräte', grenzwert: EU_STANDBY_VERNETZT, grenzwertArt: 'vernetzt', anzahl: 0 },
];

export type StandbyModus = 'geraete' | 'gemessen';

export interface GeraetEingabe {
  id: string;
  name: string;
  anzahl: number;
  watt: number;
}

export interface StandbyEingabe {
  modus: StandbyModus;
  geraete: GeraetEingabe[];
  /** Gemessene Gesamt-Standby-Leistung in W (nur Modus "gemessen") */
  gemessenW: number;
  stundenProTag: number;
  strompreisCt: number;
}

export interface StandbyPosten {
  id: string;
  name: string;
  leistungW: number;
  kostenJahrEuro: number;
}

export interface StandbyErgebnis {
  leistungW: number;
  verbrauchKwhJahr: number;
  kostenJahrEuro: number;
  kosten10JahreEuro: number;
  /** Nach Kosten absteigend sortiert, nur Geräte mit Verbrauch */
  posten: StandbyPosten[];
  groessterPosten: StandbyPosten | null;
}

export function kwhProJahr(leistungW: number, stundenProTag: number): number {
  return (leistungW * stundenProTag * 365) / 1000;
}

export function berechneStandby(e: StandbyEingabe): StandbyErgebnis {
  const preis = e.strompreisCt / 100;

  let posten: StandbyPosten[] = [];
  let leistungW: number;

  if (e.modus === 'gemessen') {
    leistungW = e.gemessenW;
  } else {
    posten = e.geraete
      .map((g) => {
        const w = g.anzahl * g.watt;
        return { id: g.id, name: g.name, leistungW: w, kostenJahrEuro: kwhProJahr(w, e.stundenProTag) * preis };
      })
      .filter((p) => p.leistungW > 0)
      .sort((a, b) => b.kostenJahrEuro - a.kostenJahrEuro);
    leistungW = posten.reduce((s, p) => s + p.leistungW, 0);
  }

  const verbrauchKwhJahr = kwhProJahr(leistungW, e.stundenProTag);
  const kostenJahrEuro = verbrauchKwhJahr * preis;

  return {
    leistungW,
    verbrauchKwhJahr,
    kostenJahrEuro,
    kosten10JahreEuro: kostenJahrEuro * 10,
    posten,
    groessterPosten: posten[0] ?? null,
  };
}
