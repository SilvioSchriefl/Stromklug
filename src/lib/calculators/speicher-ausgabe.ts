/** Texte für die Ergebnisanzeige des Speicher-Rechners (Seite + Browser). */
import { formatEuro, formatNumber } from '@/lib/format';
import type { SpeicherEingabe, SpeicherErgebnis, Urteil } from './speicher';

export const URTEIL_TEXT: Record<Urteil, string> = {
  lohnt: 'Lohnt sich',
  knapp: 'Lohnt sich knapp',
  lohntNicht: 'Lohnt sich nicht',
};

function euroMitVorzeichen(wert: number): string {
  const s = formatEuro(Math.abs(wert));
  return wert >= 0 ? `+${s}` : `−${s}`;
}

export function formatSpeicherAmortisation(jahre: number | null): string {
  if (jahre === null) return 'nie';
  if (jahre > 99) return 'über 99 Jahre';
  return `${formatNumber(jahre, 1)} Jahre`;
}

export function ausgabeSpeicher(r: SpeicherErgebnis, e: SpeicherEingabe): Record<string, string> {
  const netto = formatNumber(Math.max(0, Math.round(r.nettoKwh)));
  const ersparnis = formatEuro(r.ersparnisJahrEuro);
  const bilanz = euroMitVorzeichen(r.bilanzLebensdauerEuro);
  const jahre = formatNumber(e.lebensdauerJahre);

  let satz: string;
  if (r.urteil === 'lohnt') {
    satz = `Der Speicher macht rund ${netto} kWh Solarstrom pro Jahr zusätzlich nutzbar und spart etwa ${ersparnis} – nach ${jahre} Jahren bleiben ${formatEuro(r.bilanzLebensdauerEuro)} übrig.`;
  } else if (r.urteil === 'knapp') {
    satz = `Der Speicher spart etwa ${ersparnis} pro Jahr und macht sich erst kurz vor dem Ende seiner angenommenen Lebensdauer von ${jahre} Jahren bezahlt.`;
  } else if (r.nettoKwh <= 0) {
    satz = 'Der Speicher verbraucht selbst mehr Strom, als er zusätzlich nutzbar macht – er kostet dich jedes Jahr Geld.';
  } else {
    satz = `Der Speicher spart nur etwa ${ersparnis} pro Jahr und holt seine Kosten in ${jahre} Jahren nicht wieder herein.`;
  }

  return {
    urteil: URTEIL_TEXT[r.urteil],
    amortisation: formatSpeicherAmortisation(r.amortisationJahre),
    satz,
    netto: `${netto} kWh`,
    standby: `nach Abzug von ${formatNumber(Math.round(r.standbyKwh))} kWh Eigenverbrauch`,
    ersparnis,
    eigenverbrauch: `Eigenverbrauch ${formatNumber(r.eigenverbrauchOhneProzent)} % → ${formatNumber(Math.min(100, r.eigenverbrauchMitProzent))} %`,
    bilanz,
    bilanzSub: `nach ${jahre} Jahren, abzüglich Anschaffung`,
    sticky: `${URTEIL_TEXT[r.urteil]} · ${formatSpeicherAmortisation(r.amortisationJahre)}`,
  };
}

export function ansageSpeicher(r: SpeicherErgebnis, e: SpeicherEingabe): string {
  const a = ausgabeSpeicher(r, e);
  return `${a.urteil}. Amortisation ${a.amortisation}. ${a.satz}`;
}
