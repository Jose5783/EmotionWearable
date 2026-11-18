import type { ImageSourcePropType } from 'react-native';

/**
 * Resuelve la fuente de una imagen de pregunta.
 * - URLs http(s): se usan como imagen remota.
 * - Claves locales: se buscan en el mapa LOCAL_IMAGES (requiere() en build).
 *   Si no existe la clave, devuelve null (la imagen simplemente no se muestra).
 */
const IMAGENES_LOCALES: Record<string, ImageSourcePropType> = {
  // Ejemplo de cómo registrar imágenes locales:
  // 'mar-tranquilo': require('../../assets/images/mar-tranquilo.png'),
};

export function resolverImagenFuente(imagenUrl?: string): ImageSourcePropType | null {
  if (!imagenUrl) return null;

  if (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://')) {
    return { uri: imagenUrl };
  }

  return IMAGENES_LOCALES[imagenUrl] ?? null;
}
