/** Texte für die Ergebnisanzeige des Anbieterwechsel-Rechners (Seite + Browser). */
import { formatEuro } from '@/lib/format';
import type { WechselEingabe, WechselErgebnis } from './anbieterwechsel';

function euroMitVorzeichen(wert: number): string {
  const s = formatEuro(Math.abs(wert));
  if (Math.round(wert) === 0) return s;
  return wert > 0 ? s : `−${s}`;
}

export function ausgabeWechsel(r: WechselErgebnis, e: WechselEingabe): Record<string, string> {
  const jahr1 = euroMitVorzeichen(r.ersparnisJahr1Euro);
  let satz: string;
  if (r.ersparnisJahr1Euro >= 1) {
    satz =
      e.bonusEuro > 0
        ? `Mit dem Wechsel sparst du im ersten Jahr rund ${formatEuro(r.ersparnisJahr1Euro)} – davon ${formatEuro(e.bonusEuro)} Bonus.`
        : `Mit dem Wechsel sparst du rund ${formatEuro(r.ersparnisJahr1Euro)} pro Jahr.`;
  } else if (r.ersparnisJahr1Euro <= -1) {
    satz = `Der neue Tarif wäre im ersten Jahr rund ${formatEuro(-r.ersparnisJahr1Euro)} teurer – ein Wechsel lohnt sich so nicht.`;
  } else {
    satz = 'Beide Tarife kosten dich im ersten Jahr praktisch gleich viel.';
  }

  return {
    ersparnis1: jahr1,
    satz,
    folgejahre: euroMitVorzeichen(r.ersparnisFolgejahreEuro),
    kostenAlt: formatEuro(r.kostenAltEuro),
    kostenAltSub: `etwa ${formatEuro(r.kostenAltEuro / 12)} pro Monat`,
    kostenNeu: formatEuro(r.kostenNeuEuro),
    kostenNeuSub: `Abschlag etwa ${formatEuro(r.abschlagNeuEuro)} pro Monat`,
    sticky: `${jahr1} im 1. Jahr`,
  };
}

export function ansageWechsel(r: WechselErgebnis, e: WechselEingabe): string {
  const a = ausgabeWechsel(r, e);
  return `Ersparnis im ersten Jahr ${a.ersparnis1}. ${a.satz}`;
}
