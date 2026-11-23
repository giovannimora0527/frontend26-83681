/** Descarga en el navegador un archivo (PDF/XLSX) recibido del backend como Blob. */
export function descargarArchivo(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = nombre;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Extrae el mensaje de error enviado por el GlobalExceptionHandler del backend. */
export function mensajeError(error: unknown, predeterminado = 'No fue posible completar la operación.'): string {
  const e = error as { error?: { message?: string; mensaje?: string } | string; message?: string } | null;
  if (e && typeof e.error === 'object' && e.error) {
    return e.error.message ?? e.error.mensaje ?? predeterminado;
  }
  if (e && typeof e.error === 'string' && e.error.trim() && !e.error.startsWith('<')) {
    return e.error;
  }
  return e?.message ?? predeterminado;
}
