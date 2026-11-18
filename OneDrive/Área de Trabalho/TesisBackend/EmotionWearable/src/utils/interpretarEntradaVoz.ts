/**
 * Interpreta una transcripción de voz y devuelve el valor de opción (Likert)
 * más probable. Soporta números hablados y frases asociadas a cada opción.
 * Devuelve null si no encuentra coincidencia.
 */

interface PatronVoz {
  patron: string;
  valor: number;
}

const PATRONES: PatronVoz[] = [
  // 0 — Nada en absoluto
  { patron: 'nada en absoluto', valor: 0 },
  { patron: 'ninguna de las veces', valor: 0 },
  { patron: 'en absoluto', valor: 0 },
  { patron: 'ninguno', valor: 0 },
  { patron: 'ninguna', valor: 0 },
  { patron: 'nunca', valor: 0 },
  { patron: 'cero', valor: 0 },
  { patron: 'nada', valor: 0 },
  // 3 — Casi todos los días
  { patron: 'casi todos los dias', valor: 3 },
  { patron: 'casi todos los días', valor: 3 },
  { patron: 'la mayoria de los dias', valor: 3 },
  { patron: 'la mayoría de los días', valor: 3 },
  { patron: 'todos los dias', valor: 3 },
  { patron: 'todos los días', valor: 3 },
  { patron: 'casi siempre', valor: 3 },
  { patron: 'todo el tiempo', valor: 3 },
  { patron: 'todos', valor: 3 },
  { patron: 'siempre', valor: 3 },
  { patron: 'tres', valor: 3 },
  // 2 — Más de la mitad de los días
  { patron: 'mas de la mitad de los dias', valor: 2 },
  { patron: 'más de la mitad de los días', valor: 2 },
  { patron: 'mas de la mitad', valor: 2 },
  { patron: 'más de la mitad', valor: 2 },
  { patron: 'la mayoria', valor: 2 },
  { patron: 'la mayoría', valor: 2 },
  { patron: 'a menudo', valor: 2 },
  { patron: 'bastante', valor: 2 },
  { patron: 'muchos', valor: 2 },
  { patron: 'la mitad', valor: 2 },
  { patron: 'dos', valor: 2 },
  // 1 — Varios días
  { patron: 'varios dias', valor: 1 },
  { patron: 'varios días', valor: 1 },
  { patron: 'algunas veces', valor: 1 },
  { patron: 'algunos dias', valor: 1 },
  { patron: 'pocas veces', valor: 1 },
  { patron: 'algunos', valor: 1 },
  { patron: 'pocos', valor: 1 },
  { patron: 'un poco', valor: 1 },
  { patron: 'varios', valor: 1 },
  { patron: 'uno', valor: 1 },
  // Dígitos hablados como número
  { patron: '0', valor: 0 },
  { patron: '1', valor: 1 },
  { patron: '2', valor: 2 },
  { patron: '3', valor: 3 },
];

/** Ordena los patrones del más específico (largo) al más genérico. */
const PATRONES_ORDENADOS = [...PATRONES].sort((a, b) => b.patron.length - a.patron.length);

export function interpretarEntradaVoz(transcripcion: string): number | null {
  const texto = transcripcion.toLocaleLowerCase().trim();
  if (!texto) return null;

  for (const { patron, valor } of PATRONES_ORDENADOS) {
    if (texto.includes(patron)) {
      return valor;
    }
  }
  return null;
}
