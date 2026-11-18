import type { DimensionKey, Pregunta, PuntuacionesDimensiones } from './types';

/**
 * Cálculo de puntuaciones del cuestionario.
 * Lógica de ponderación por peso y exclusión de preguntas de riesgo del cálculo dimensional.
 */

/** Devuelve una estructura de puntuaciones inicializada en cero. */
export function inicializarPuntuaciones(): PuntuacionesDimensiones {
  return { DEP: 0, ANX: 0, STR: 0 };
}

/**
 * Calcula la puntuación máxima posible por dimensión.
 * Las preguntas de riesgo (esRiesgo) no puntúan en su dimensión.
 */
export function calcularMaximos(preguntas: Pregunta[]): PuntuacionesDimensiones {
  const maximos = inicializarPuntuaciones();
  for (const pregunta of preguntas) {
    if (pregunta.esRiesgo) continue;
    const valorMaximo = Math.max(...pregunta.opciones.map((o) => o.valor));
    maximos[pregunta.dimension] += valorMaximo * pregunta.pesoPuntuacion;
  }
  return maximos;
}

/**
 * Suma las respuestas del usuario ponderadas por el peso de cada pregunta.
 * @param respuestas Mapa preguntaId -> valor seleccionado.
 */
export function calcularPuntuaciones(
  respuestas: Record<string, number>,
  preguntas: Pregunta[],
): PuntuacionesDimensiones {
  const totales = inicializarPuntuaciones();
  for (const pregunta of preguntas) {
    if (pregunta.esRiesgo) continue;
    const valor = respuestas[pregunta.id];
    if (typeof valor === 'number') {
      totales[pregunta.dimension] += valor * pregunta.pesoPuntuacion;
    }
  }
  return totales;
}

/**
 * Determina la dimensión dominante (la de mayor puntuación).
 * En caso de empate se prefiere el orden DEP > ANX > STR.
 */
export function dimensionDominante(puntuaciones: PuntuacionesDimensiones): DimensionKey | null {
  const orden: DimensionKey[] = ['DEP', 'ANX', 'STR'];
  let mejor: DimensionKey | null = null;
  let mejorValor = -1;
  for (const dimension of orden) {
    if (puntuaciones[dimension] > mejorValor) {
      mejorValor = puntuaciones[dimension];
      mejor = dimension;
    }
  }
  return mejorValor > 0 ? mejor : null;
}

/**
 * Detecta el flag de riesgo: true si alguna pregunta de riesgo
 * supera su umbral (idealmente ideación suicida / autolesión).
 */
export function detectarRiesgo(
  respuestas: Record<string, number>,
  preguntas: Pregunta[],
): boolean {
  return preguntas.some(
    (p) => p.esRiesgo && (respuestas[p.id] ?? 0) >= (p.umbralRiesgo ?? 1),
  );
}
