/**
 * Lohnt sich ein Batteriespeicher fürs Balkonkraftwerk?
 *
 * Modell (Tagesbilanz über ein ganzes Jahr, PVGIS-Tagesprofil):
 * 1. Jahresertrag wird mit dem PVGIS-Profil auf die 365 Tage verteilt.
 * 2. Eigenverbrauch ohne Speicher: Pro Tag kann der Haushalt höchstens eine feste
 *    Menge Solarstrom direkt nutzen ("Tageskappe"). Die Kappe wird so bestimmt, dass
 *    über das Jahr genau der angegebene Eigenverbrauchsanteil herauskommt.
 *    → Im Winter wird fast alles direkt genutzt, im Sommer entsteht Überschuss.
 * 3. Der Überschuss lädt den Speicher (bis zur nutzbaren Kapazität).
 * 4. Abends und nachts gibt der Speicher Strom ab – höchstens so viel, wie der
 *    Haushalt in den dunklen Stunden mit seiner Grundlast braucht.
 *    Lade- und Entladeverluste über den Wirkungsgrad.
 * 5. Der Eigenverbrauch des Speichers (Standby) wird abgezogen.
 * 6. Ersparnis = zusätzlich genutzter Strom × Strompreis; Amortisation = Mehrkosten ÷ Ersparnis.
 */
import tagesprofil from '@/data/pvgis-tagesprofil.json';

export const MONTAGEN = {
  senkrechtSued: 'Senkrecht nach Süden (Balkongeländer)',
  senkrechtOstWest: 'Senkrecht nach Osten oder Westen',
  geneigtSued: 'Geneigt nach Süden (ca. 30°)',
} as const;
export type Montage = keyof typeof MONTAGEN;

export interface SpeicherEingabe {
  jahresertragKwh: number;
  montage: Montage;
  eigenverbrauchOhneProzent: number;
  kapazitaetKwh: number;
  grundlastW: number;
  wirkungsgradProzent: number;
  standbyW: number;
  mehrkostenEuro: number;
  strompreisCt: number;
  lebensdauerJahre: number;
}

export type Urteil = 'lohnt' | 'knapp' | 'lohntNicht';

export interface SpeicherErgebnis {
  /** Solarüberschuss ohne Speicher (geht unvergütet ins Netz) */
  ueberschussKwh: number;
  /** In den Speicher geladene Energie */
  geladenKwh: number;
  /** Vom Speicher an den Haushalt abgegebene Energie */
  abgegebenKwh: number;
  standbyKwh: number;
  /** Abgegeben minus Eigenverbrauch des Speichers */
  nettoKwh: number;
  vollzyklen: number;
  eigenverbrauchOhneProzent: number;
  eigenverbrauchMitProzent: number;
  ersparnisJahrEuro: number;
  /** null = macht sich nie bezahlt (Ersparnis ≤ 0) */
  amortisationJahre: number | null;
  bilanzLebensdauerEuro: number;
  urteil: Urteil;
  hinweise: string[];
}

const TAGE = 365;
const STUNDEN_PRO_JAHR = TAGE * 24;

/** Täglicher Solarertrag in kWh für Jahresertrag und Montage */
export function tagesertraege(jahresertragKwh: number, montage: Montage): number[] {
  return tagesprofil.profile[montage].anteil.map((a) => a * jahresertragKwh);
}

/**
 * Sucht die Tageskappe C, für die Σ min(Ertrag_Tag, C) = Anteil × Jahresertrag gilt.
 * Bisektion – die Funktion ist monoton steigend in C.
 */
export function tageskappe(ertraege: number[], anteil: number): number {
  const gesamt = ertraege.reduce((a, b) => a + b, 0);
  if (gesamt <= 0 || anteil <= 0) return 0;
  const max = Math.max(...ertraege);
  if (anteil >= 1) return max;
  const ziel = anteil * gesamt;
  let lo = 0;
  let hi = max;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const genutzt = ertraege.reduce((s, e) => s + Math.min(e, mid), 0);
    if (genutzt < ziel) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function berechneSpeicher(e: SpeicherEingabe): SpeicherErgebnis {
  const hinweise: string[] = [];
  const ertraege = tagesertraege(e.jahresertragKwh, e.montage);
  const dunkel = tagesprofil.profile[e.montage].dunkel;
  const anteil = e.eigenverbrauchOhneProzent / 100;
  const kappe = tageskappe(ertraege, anteil);
  const eta = e.wirkungsgradProzent / 100;
  const kap = Math.max(0, e.kapazitaetKwh);

  const ueberschuss = ertraege.map((x) => x - Math.min(x, kappe));
  const ueberschussKwh = ueberschuss.reduce((a, b) => a + b, 0);

  // Zwei Durchläufe: der erste "wärmt" den Ladestand für den Jahreswechsel vor
  let soc = 0;
  let geladenKwh = 0;
  let abgegebenKwh = 0;
  for (let pass = 0; pass < 2; pass++) {
    geladenKwh = 0;
    abgegebenKwh = 0;
    for (let t = 0; t < TAGE; t++) {
      const laden = Math.min(ueberschuss[t], kap - soc);
      soc += laden;
      geladenKwh += laden;
      const bedarf = (e.grundlastW * dunkel[t]) / 1000;
      const abgabe = Math.min(soc * eta, bedarf);
      soc -= eta > 0 ? abgabe / eta : 0;
      abgegebenKwh += abgabe;
    }
  }

  const standbyKwh = (e.standbyW * STUNDEN_PRO_JAHR) / 1000;
  const nettoKwh = abgegebenKwh - standbyKwh;
  const ersparnisJahrEuro = nettoKwh * (e.strompreisCt / 100);
  const amortisationJahre = ersparnisJahrEuro > 0 ? e.mehrkostenEuro / ersparnisJahrEuro : null;
  const bilanzLebensdauerEuro = ersparnisJahrEuro * e.lebensdauerJahre - e.mehrkostenEuro;

  let urteil: Urteil = 'lohntNicht';
  if (amortisationJahre !== null && amortisationJahre <= e.lebensdauerJahre * 0.75) urteil = 'lohnt';
  else if (amortisationJahre !== null && amortisationJahre <= e.lebensdauerJahre) urteil = 'knapp';

  const vollzyklen = kap > 0 ? geladenKwh / kap : 0;
  const genutztOhne = anteil * e.jahresertragKwh;
  const eigenverbrauchMitProzent =
    e.jahresertragKwh > 0 ? ((genutztOhne + geladenKwh) / e.jahresertragKwh) * 100 : 0;

  if (ueberschussKwh < kap * 50) {
    hinweise.push('Es fällt kaum Solarüberschuss an – ein Speicher hat wenig zu tun.');
  }
  if (kap > 0 && ueberschussKwh > 0 && geladenKwh < ueberschussKwh * 0.5) {
    hinweise.push(
      'Mehr als die Hälfte des Überschusses geht trotz Speicher ins Netz – weil der Speicher voll ist oder abends nicht genug Strom gebraucht wird.',
    );
  }
  if (nettoKwh <= 0) {
    hinweise.push('Der Eigenverbrauch des Speichers ist größer als sein Nutzen.');
  }

  return {
    ueberschussKwh,
    geladenKwh,
    abgegebenKwh,
    standbyKwh,
    nettoKwh,
    vollzyklen,
    eigenverbrauchOhneProzent: e.eigenverbrauchOhneProzent,
    eigenverbrauchMitProzent,
    ersparnisJahrEuro,
    amortisationJahre,
    bilanzLebensdauerEuro,
    urteil,
    hinweise,
  };
}
