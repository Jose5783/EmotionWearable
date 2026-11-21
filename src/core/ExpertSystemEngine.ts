import config from '../config/sistemaExperto.json';
import {
  calcularMaximos,
  calcularPuntuaciones,
  detectarRiesgo,
  dimensionDominante,
} from './ScoreCalculator';
import type {
  Condicion,
  DiagnosisResult,
  DimensionKey,
  PuntuacionesDimensiones,
  SistemaExpertoConfig,
} from './types';

/**
 * MOTOR DEL SISTEMA EXPERTO
 * ------------------------
 * Implementa una máquina de inferencia basada en reglas (forward chaining)
 * sobre una tabla de decisiones ponderada definida en JSON.
 *
 * Flujo:
 *   1. Se ponderan las respuestas del usuario por dimensión.
 *   2. Se evalúan las reglas en orden de prioridad descendente.
 *   3. La primera regla cuya condición se cumple emite el diagnóstico.
 *
 * Las reglas viven en src/config/sistemaExperto.json -> "reglas" y son 100%
 * configurables sin tocar código (motor de reglas declarativo).
 */

/** Configuración cargada desde el JSON (validada por tipo). */
export const EXPERTO = config as SistemaExpertoConfig;

/** Contexto de evaluación disponible para cada regla. */
interface ContextoEvaluacion {
  puntuaciones: PuntuacionesDimensiones;
  riesgoAlto: boolean;
  dominante: DimensionKey | null;
}

/** Evalúa una condición estructurada contra el contexto actual. */
export function evaluarCondicion(condicion: Condicion, contexto: ContextoEvaluacion): boolean {
  switch (condicion.tipo) {
    case 'flag':
      return contexto.riesgoAlto === true;

    case 'todasBajas':
      return Object.values(contexto.puntuaciones).every(
        (valor) => valor <= (condicion.max ?? 4),
      );

    case 'mayorIgual':
      return (condicion.dimensiones ?? []).every(
        (dim) => contexto.puntuaciones[dim] >= (condicion.min ?? 0),
      );

    case 'dominante':
      return (
        contexto.dominante === condicion.dimension &&
        contexto.puntuaciones[condicion.dimension!] >= (condicion.min ?? 1)
      );

    case 'default':
      return true;

    default:
      return false;
  }
}

export class ExpertSystemEngine {
  readonly preguntas = EXPERTO.preguntas;
  readonly reglas = EXPERTO.reglas;
  readonly diagnosticos = EXPERTO.diagnosticos;
  readonly maximos = calcularMaximos(this.preguntas);

  /**
   * Evalúa las respuestas del usuario y emite el diagnóstico completo.
   * @param respuestas Mapa preguntaId -> valor seleccionado.
   */
  evaluar(respuestas: Record<string, number>): DiagnosisResult {
    const puntuaciones = calcularPuntuaciones(respuestas, this.preguntas);
    const riesgoAlto = detectarRiesgo(respuestas, this.preguntas);
    const dominante = dimensionDominante(puntuaciones);

    const contexto: ContextoEvaluacion = { puntuaciones, riesgoAlto, dominante };

    // Ordena reglas de mayor a menor prioridad y ejecuta la primera que aplique.
    const reglasOrdenadas = [...this.reglas].sort((a, b) => b.prioridad - a.prioridad);
    const reglaAplicada =
      reglasOrdenadas.find((regla) => evaluarCondicion(regla.condicion, contexto)) ??
      // Fallback seguro: regla de tipo default.
      this.reglas.find((r) => r.condicion.tipo === 'default')!;

    const definicion =
      this.diagnosticos.find((d) => d.codigo === reglaAplicada.diagnostico) ??
      // Fallback de última instancia (nunca debería ocurrir).
      this.diagnosticos.find((d) => d.codigo === 'NORMAL')!;

    return {
      codigo: definicion.codigo,
      nombre: definicion.nombre,
      descripcion: definicion.descripcion,
      nivel: definicion.nivel,
      emergencia: definicion.emergencia,
      recomendaciones: definicion.recomendaciones,
      puntuaciones,
      maximos: { ...this.maximos },
      dimensionDominante: dominante,
      reglaAplicada: reglaAplicada.id,
    };
  }
}

/** Instancia única (singleton) del motor, compartida en toda la app. */
export const motorExperto = new ExpertSystemEngine();
