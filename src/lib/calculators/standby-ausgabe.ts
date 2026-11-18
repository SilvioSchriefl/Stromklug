/** Texte für die Ergebnisanzeige des Standby-Rechners (Seite + Browser). */
import { formatEuro, formatEuroCent, formatNumber } from '@/lib/format';
import type { StandbyEingabe, StandbyErgebnis } from './standby';

function euro(wert: number): string {
  return wert < 100 ? formatEuroCent(wert) : formatEuro(wert);
}

export function ausgabeStandby(r: StandbyErgebnis, e: StandbyEingabe): Record<string, string> {
  const jahr = euro(r.kostenJahrEuro);
  const leistung = `${formatNumber(r.leistungW, r.leistungW < 10 ? 1 : 0)} W`;
  const kwh = `${formatNumber(r.verbrauchKwhJahr, r.verbrauchKwhJahr < 10 ? 1 : 0)} kWh`;

  const satz =
    r.leistungW === 0
      ? 'Ohne Standby-Verbrauch entstehen keine Kosten – trage deine Geräte oder einen Messwert ein.'
      : `Deine Geräte ziehen im Standby zusammen ${leistung}. Bei ${formatNumber(e.stundenProTag)} Stunden am Tag sind das ${kwh} und rund ${jahr} im Jahr – Geld, das du mit abschaltbaren Steckdosenleisten sparen kannst.`;

  return {
    kostenJahr: jahr,
    satz,
    verbrauch: kwh,
    leistung: `Standby-Leistung gesamt: ${leistung}`,
    groesster: r.groessterPosten ? r.groessterPosten.name : e.modus === 'gemessen' ? 'Gesamtmessung' : '–',
    groessterSub: r.groessterPosten ? `${euro(r.groessterPosten.kostenJahrEuro)} pro Jahr` : 'keine Aufteilung nach Geräten',
    kosten10: euro(r.kosten10JahreEuro),
    sticky: `${jahr}/Jahr · ${leistung}`,
  };
}

export function ansageStandby(r: StandbyErgebnis, e: StandbyEingabe): string {
  const a = ausgabeStandby(r, e);
  return `Standby-Kosten pro Jahr ${a.kostenJahr}. ${a.satz}`;
}
