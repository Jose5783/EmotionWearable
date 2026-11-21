/**
 * Definiciones de tipos del Sistema Experto.
 * Estos tipos reflejan la estructura del JSON de configuración (src/config/sistemaExperto.json).
 */

/** Dimensiones clínicas evaluadas por el cuestionario. */
export type DimensionKey = 'DEP' | 'ANX' | 'STR';

/** Nivel de semáforo usado para el indicador visual del resultado. */
export type NivelDiagnostico = 'verde' | 'amarillo' | 'rojo';

/** Una opción de respuesta (escala Likert). */
export interface Opcion {
  /** Valor numérico con el que puntúa esta opción. */
  valor: number;
  /** Etiqueta legible mostrada al usuario. */
  etiqueta: string;
}

/** Pregunta del cuestionario dinámico. */
export interface Pregunta {
  /** Identificador único de la pregunta. */
  id: string;
  /** Dimensión clínica a la que pertenece. */
  dimension: DimensionKey;
  /** Texto de la pregunta. */
  pregunta: string;
  /** URL de la imagen ilustrativa (remota o clave local). */
  imagenUrl?: string;
  /** Opciones de respuesta (escala Likert). */
  opciones: Opcion[];
  /** Peso con el que puntúa cada punto de esta pregunta (>= 0). */
  pesoPuntuacion: number;
  /** Si la pregunta permite entrada por voz. */
  soportaVoz: boolean;
  /** Si esta pregunta activa el flag de riesgo (ej. ideación suicida). */
  esRiesgo?: boolean;
  /** Valor a partir del cual la respuesta activa el flag de riesgo. */
  umbralRiesgo?: number;
}

/** Condición estructurada que evalúa el motor de reglas. */
export interface Condicion {
  /** Tipo de condición. */
  tipo: 'flag' | 'todasBajas' | 'mayorIgual' | 'dominante' | 'default';
  /** Nombre del flag a comprobar (usado con tipo 'flag'). */
  flag?: string;
  /** Valor máximo permitido (usado con tipo 'todasBajas'). */
  max?: number;
  /** Valor mínimo requerido (usado con 'mayorIgual' y 'dominante'). */
  min?: number;
  /** Dimensión objetivo (usado con 'dominante'). */
  dimension?: DimensionKey;
  /** Dimensiones objetivo (usado con 'mayorIgual'). */
  dimensiones?: DimensionKey[];
}

/** Regla del sistema experto. */
export interface Regla {
  id: string;
  descripcion: string;
  /** Mayor prioridad = se evalúa antes. */
  prioridad: number;
  condicion: Condicion;
  /** Código del diagnóstico a emitir si la regla se cumple. */
  diagnostico: string;
}

/** Definición completa de un diagnóstico posible. */
export interface DiagnosticoDef {
  codigo: string;
  nombre: string;
  descripcion: string;
  nivel: NivelDiagnostico;
  emergencia: boolean;
  recomendaciones: string[];
}

/** Puntuación total por dimensión. */
export interface PuntuacionesDimensiones {
  DEP: number;
  ANX: number;
  STR: number;
}

/** Resultado del diagnóstico emitido por el motor. */
export interface DiagnosisResult {
  codigo: string;
  nombre: string;
  descripcion: string;
  nivel: NivelDiagnostico;
  emergencia: boolean;
  recomendaciones: string[];
  puntuaciones: PuntuacionesDimensiones;
  /** Puntuación máxima posible por dimensión (para barras de progreso). */
  maximos: PuntuacionesDimensiones;
  dimensionDominante: DimensionKey | null;
  /** ID de la regla que se disparó. */
  reglaAplicada: string;
}

/** Configuración completa del sistema experto (raíz del JSON). */
export interface SistemaExpertoConfig {
  configuracion: {
    nombre: string;
    version: string;
    idioma: string;
    periodoReferencia: string;
    lineaAyuda: { nombre: string; telefono: string };
    instrucciones: string;
  };
  dimensiones: { clave: DimensionKey; nombre: string; descripcion: string }[];
  preguntas: Pregunta[];
  reglas: Regla[];
  diagnosticos: DiagnosticoDef[];
}
