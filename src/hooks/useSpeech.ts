import { useCallback, useEffect, useRef, useState } from 'react';
// import { solicitarPermisoMicrofono } from '../services/PermissionsService';
// import { servicioVoz } from '../services/SpeechService';
import { interpretarEntradaVoz } from '../utils/interpretarEntradaVoz';

export type EstadoVoz = 'inactivo' | 'escuchando' | 'error';

interface OpcionesUseSpeech {
  /** Se invoca cuando la voz se interpreta como una opción (valor Likert). */
  onValor?: (valor: number) => void;
  /** Se invoca con el texto dictado cuando no se interpreta como opción. */
  onTexto?: (texto: string) => void;
}

/**
 * Hook que envuelve el servicio de voz para uso declarativo en la UI.
 * Gestiona permisos, estado de grabación, transcripción y errores.
 */
export function useSpeech(opciones?: OpcionesUseSpeech) {
  const [estado, setEstado] = useState<EstadoVoz>('inactivo');
  const [transcripcion, setTranscripcion] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Ref para evitar re-suscribir eventos en cada render.
  const opcionesRef = useRef(opciones);
  opcionesRef.current = opciones;

  // useEffect(() => {
  //   servicioVoz.configurar({
  //     onInicio: () => {
  //       setEstado('escuchando');
  //       setError(null);
  //     },
  //     onFin: () => setEstado('inactivo'),
  //     onError: (mensaje) => {
  //       setEstado('error');
  //       setError(mensaje);
  //     },
  //     onResultados: (textos, parcial) => {
  //       const texto = textos.join(' ');
  //       setTranscripcion(texto);
  //       const valor = interpretarEntradaVoz(texto);
  //       if (valor !== null) {
  //         opcionesRef.current?.onValor?.(valor);
  //       } else if (!parcial) {
  //         opcionesRef.current?.onTexto?.(texto);
  //       }
  //     },
  //   });
  //   return () => servicioVoz.limpiar();
  // }, []);

  /** Solicita permiso de micrófono e inicia el dictado. */
  const iniciar = useCallback(async () => {}, []);

  const detener = useCallback(() => {}, []);

  const cancelar = useCallback(() => {}, []);

  return { estado, transcripcion, error, iniciar, detener, cancelar };
}
