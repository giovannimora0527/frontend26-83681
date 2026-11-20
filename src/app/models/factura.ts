export interface Factura {
  id: number; numero: string; clienteId: number; mascotaId: number; medicoId: number;
  subtotal: number; impuestos: number; descuentos: number; total: number; estado: string; emitidaEn: string;
  propietarioSnapshot?: string; mascotaSnapshot?: string;
}
export interface FacturaDetalle { id: number; tipo: string; descripcion: string; cantidad: number; precioUnitario: number; subtotal: number; impuestoPorcentaje: number; }
export interface FacturaPago { id: number; monto: number; medio: string; referencia?: string; pagadoEn: string; }
export interface FacturaDetalleRs { factura: Factura; detalles: FacturaDetalle[]; pagos: FacturaPago[]; }
