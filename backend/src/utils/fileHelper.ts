import fs from 'fs';
import path from 'path';

/**
 * Elimina un archivo del filesystem de forma segura.
 *
 * - Acepta rutas relativas de la forma "/uploads/archivo.ext"
 *   (tal como se almacenan en la base de datos).
 * - Las convierte a rutas absolutas usando la raíz del backend.
 * - Si el archivo no existe, lo ignora silenciosamente.
 * - Captura cualquier otro error y lo loguea, pero NUNCA lanza excepción.
 *
 * @param urlPath  Ruta relativa almacenada en BD, ej: "/uploads/imagen.jpg"
 */
export async function deleteFileIfExists(urlPath: string | null | undefined): Promise<void> {
  if (!urlPath || typeof urlPath !== 'string' || !urlPath.trim()) return;

  try {
    // Normalizar: quitar query strings o fragmentos por seguridad
    const cleanPath = urlPath.split('?')[0].split('#')[0].trim();

    // Construir ruta absoluta: backend/uploads/ es la raíz de los archivos subidos.
    // __dirname apunta a: dist/utils/ en producción  →  sube dos niveles → raíz del backend
    //                      src/utils/  en desarrollo  →  sube dos niveles → raíz del backend
    const backendRoot = path.resolve(__dirname, '..', '..');
    const absolutePath = path.join(backendRoot, cleanPath);

    // Verificar que la ruta resultante sigue dentro de backendRoot (seguridad: path traversal)
    const normalizedAbsolute = path.normalize(absolutePath);
    const normalizedRoot = path.normalize(backendRoot);
    if (!normalizedAbsolute.startsWith(normalizedRoot)) {
      console.warn(`[fileHelper] Ruta sospechosa ignorada: ${urlPath}`);
      return;
    }

    await fs.promises.unlink(normalizedAbsolute);
    console.log(`[fileHelper] ✓ Archivo eliminado: ${normalizedAbsolute}`);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      // El archivo ya no existe (puede haber sido eliminado antes) → ignorar
      return;
    }
    // Cualquier otro error: loguear pero no propagar
    console.error(`[fileHelper] ✗ Error al eliminar archivo "${urlPath}": ${err.message}`);
  }
}

/**
 * Elimina múltiples archivos en paralelo de forma segura.
 * Acepta un array de rutas relativas (puede incluir null/undefined — se ignoran).
 *
 * @param urlPaths  Array de rutas relativas almacenadas en BD
 */
export async function deleteFilesIfExist(urlPaths: (string | null | undefined)[]): Promise<void> {
  await Promise.all(urlPaths.map((p) => deleteFileIfExists(p)));
}
