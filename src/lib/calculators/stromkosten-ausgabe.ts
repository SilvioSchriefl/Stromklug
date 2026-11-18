/** Texte für die Ergebnisanzeige des Stromkosten-Rechners (Seite + Browser). */
import { formatEuro, formatEuroCent, formatNumber } from '@/lib/format';
import type { StromkostenEingabe, StromkostenErgebnis } from './stromkosten';

/** Kleine Beträge genauer anzeigen: unter 100 € mit Cent */
function euro(wert: number): string {
  return wert < 100 ? formatEuroCent(wert) : formatEuro(wert);
}

function kwh(wert: number): string {
  return `${formatNumber(wert, wert < 10 ? 1 : 0)} kWh`;
}

export function ausgabeStromkosten(r: StromkostenErgebnis, _e: StromkostenEingabe): Record<string, string> {
  const jahr = euro(r.kostenJahrEuro);
  const monat = euro(r.kostenMonatEuro);
  return {
    kostenJahr: jahr,
    satz: `Das Gerät verbraucht rund ${kwh(r.verbrauchKwhJahr)} im Jahr und kostet dich damit etwa ${jahr} – das sind ${monat} im Monat.`,
    kostenMonat: monat,
    verbrauch: kwh(r.verbrauchKwhJahr),
    standby:
      r.standbyKwh > 0
        ? `davon Standby: ${kwh(r.standbyKwh)} (${euro(r.standbyKostenJahrEuro)})`
        : 'ohne Standby-Verbrauch',
    proStunde:
      r.kostenProStundeEuro === null ? '–' : `${formatNumber(r.kostenProStundeEuro * 100, 1)} ct`,
    proStundeSub: r.kostenProStundeEuro === null ? 'nur bei Angabe der Leistung' : 'bei voller Leistung',
    sticky: `${jahr}/Jahr · ${monat}/Monat`,
  };
}

export function ansageStromkosten(r: StromkostenErgebnis, e: StromkostenEingabe): string {
  const a = ausgabeStromkosten(r, e);
  return `Kosten pro Jahr ${a.kostenJahr}. ${a.satz}`;
}
