/**
 * Verbindet ein Rechner-Formular mit seiner Rechenlogik (läuft im Browser).
 *
 * Ablauf: Bei jeder Eingabe werden alle Felder gelesen und geprüft, dann wird
 * gerechnet und jedes Element mit data-out="schluessel" bekommt den neuen Text.
 *
 * Verwendung in einer Rechner-Seite:
 *   setupCalculator('mein-rechner', { read, compute, outputs, hints })
 */
import { formatNumber, parseGermanNumber } from '@/lib/format';

export interface FormReader {
  /** Liest ein Zahlenfeld (deutsches oder englisches Format) und prüft min/max. */
  number(name: string): number;
  /** Liest den Wert eines Auswahlfelds. */
  select<T extends string>(name: string): T;
}

export interface CalculatorOptions<I, O> {
  read(reader: FormReader): I;
  compute(input: I): O;
  /** Texte für alle data-out-Elemente */
  outputs(result: O, input: I): Record<string, string>;
  /** Hinweise unter dem Ergebnis (z. B. gesetzliche Grenzen) */
  hints?(result: O, input: I): string[];
  /** Satz für Screenreader, wird verzögert angesagt */
  announce?(result: O, input: I): string;
}

function setFieldError(input: HTMLInputElement, message: string) {
  const error = document.getElementById(`${input.id}-error`);
  if (message) {
    input.setAttribute('aria-invalid', 'true');
    if (error) {
      error.textContent = message;
      error.hidden = false;
    }
  } else {
    input.removeAttribute('aria-invalid');
    if (error) {
      error.textContent = '';
      error.hidden = true;
    }
  }
}

function decimalsOf(n: number): number {
  const s = String(n);
  return s.includes('.') ? s.split('.')[1].length : 0;
}

export function setupCalculator<I, O>(formId: string, options: CalculatorOptions<I, O>): void {
  const form = document.getElementById(formId);
  if (!(form instanceof HTMLFormElement)) return;

  const status = form.querySelector<HTMLElement>('[data-status]');
  const hintList = form.querySelector<HTMLElement>('[data-hints]');
  const resultPanel = form.querySelector<HTMLElement>('[data-result-panel]');
  let announceTimer: number | undefined;

  const update = () => {
    let valid = true;

    const reader: FormReader = {
      number(name) {
        const el = form.elements.namedItem(name);
        if (!(el instanceof HTMLInputElement)) throw new Error(`Feld "${name}" fehlt`);
        const value = parseGermanNumber(el.value);
        const min = el.dataset.min !== undefined ? Number(el.dataset.min) : -Infinity;
        const max = el.dataset.max !== undefined ? Number(el.dataset.max) : Infinity;
        const ok = Number.isFinite(value) && value >= min && value <= max;
        if (!ok) {
          valid = false;
          const range =
            Number.isFinite(min) && Number.isFinite(max)
              ? ` zwischen ${formatNumber(min, decimalsOf(min))} und ${formatNumber(max, decimalsOf(max))}`
              : '';
          setFieldError(el, `Bitte eine Zahl${range} eingeben.`);
        } else {
          setFieldError(el, '');
        }
        return value;
      },
      select<T extends string>(name: string) {
        const el = form.elements.namedItem(name);
        if (!(el instanceof HTMLSelectElement)) throw new Error(`Auswahl "${name}" fehlt`);
        return el.value as T;
      },
    };

    const input = options.read(reader);
    resultPanel?.toggleAttribute('data-stale', !valid);
    if (!valid) {
      if (status) status.textContent = 'Bitte prüfe die markierten Eingaben.';
      return;
    }

    const result = options.compute(input);
    for (const [key, text] of Object.entries(options.outputs(result, input))) {
      form.querySelectorAll<HTMLElement>(`[data-out="${key}"]`).forEach((el) => {
        el.textContent = text;
      });
    }

    if (hintList && options.hints) {
      const hints = options.hints(result, input);
      hintList.replaceChildren(
        ...hints.map((h) => {
          const li = document.createElement('li');
          li.textContent = h;
          return li;
        }),
      );
      hintList.hidden = hints.length === 0;
    }

    if (status && options.announce) {
      window.clearTimeout(announceTimer);
      const text = options.announce(result, input);
      announceTimer = window.setTimeout(() => {
        status.textContent = text;
      }, 900);
    }
  };

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('reset', () => window.setTimeout(update));
  update();

  // Mobile: kleine Ergebnisleiste unten einblenden, solange das große Ergebnis nicht sichtbar ist
  const sticky = form.querySelector<HTMLElement>('[data-sticky]');
  if (sticky && resultPanel && 'IntersectionObserver' in window) {
    let panelVisible = true;
    let formVisible = false;
    const sync = () => {
      sticky.dataset.visible = String(!panelVisible && formVisible);
    };
    new IntersectionObserver(([entry]) => {
      panelVisible = entry.isIntersecting;
      sync();
    }).observe(resultPanel);
    new IntersectionObserver(([entry]) => {
      formVisible = entry.isIntersecting;
      sync();
    }).observe(form);
  }
}
