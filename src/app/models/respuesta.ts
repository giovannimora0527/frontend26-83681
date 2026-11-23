/**
 * Respuesta consistente de las operaciones de escritura (crear / actualizar / acciones).
 */
export interface Respuesta {
  status: number;
  message: string;
  id?: number | null;
}
