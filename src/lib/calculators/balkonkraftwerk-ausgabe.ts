/**
 * Texte für die Ergebnisanzeige des Balkonkraftwerk-Rechners.
 * Wird beim Bauen der Seite (Startwerte) UND im Browser (nach jeder Eingabe) genutzt,
 * damit beides immer identisch ist.
 */
import { formatEuro, formatNumber } from '@/lib/format';
import type { BalkonkraftwerkEingabe, BalkonkraftwerkErgebnis } from './balkonkraftwerk';

export function formatAmortisation(jahre: number | null): string {
  if (jahre === null) return 'über 30 Jahre';
  if (jahre < 0.05) return 'sofort';
  return `${formatNumber(jahre, 1)} Jahre`;
}

export function ausgabeBalkonkraftwerk(
  r: BalkonkraftwerkErgebnis,
  e: BalkonkraftwerkEingabe,
): Record<string, string> {
  const ertrag = formatNumber(Math.round(r.jahresertragKwh));
  const selbst = formatNumber(Math.round(r.eigenverbrauchKwh));
  const ersparnis = formatEuro(r.ersparnisJahrEuro);
  const amortisation = formatAmortisation(r.amortisationJahre);

  const satz =
    r.amortisationJahre === null
      ? `Dein Balkonkraftwerk erzeugt rund ${ertrag} kWh im Jahr, davon nutzt du etwa ${selbst} kWh selbst – mit rund ${ersparnis} pro Jahr holst du die Anschaffung in 30 Jahren nicht wieder herein.`
      : `Dein Balkonkraftwerk erzeugt rund ${ertrag} kWh im Jahr, davon nutzt du etwa ${selbst} kWh selbst – das spart dir rund ${ersparnis} pro Jahr.`;

  return {
    amortisation,
    satz,
    jahresertrag: `${ertrag} kWh`,
    eigenverbrauch: `davon ${selbst} kWh selbst genutzt`,
    ersparnisJahr: ersparnis,
    strompreis: `bei ${formatNumber(e.strompreisCt, 1)} ct/kWh`,
    ersparnis20: formatEuro(r.ersparnis20JahreEuro),
    gewinn20: `abzüglich Anschaffung: ${formatEuro(r.gewinn20JahreEuro)}`,
    sticky: `${amortisation} · ${ersparnis}/Jahr`,
  };
}

export function ansageBalkonkraftwerk(r: BalkonkraftwerkErgebnis, e: BalkonkraftwerkEingabe): string {
  const a = ausgabeBalkonkraftwerk(r, e);
  return `Amortisationszeit ${a.amortisation}. ${a.satz}`;
}
