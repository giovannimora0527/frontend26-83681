/** Proyección de los campos del producto que se muestran en el catálogo de inventario. */
export interface MedicamentoInventario {
  id: number;
  codigo?: string | null;
  nombre: string;
  tipoProducto: string;
  presentacion?: string | null;
  registroInvima?: string | null;
  descripcion?: string | null;
  precioCompra: number;
  precioVenta: number;
  cantidadActual: number;
  stockMinimo: number;
  fechaCompra?: string | null;
  fechaVence?: string | null;
  fechaProximoPedido?: string | null;
}

/** Datos de una existencia específica, con costo, vigencia y producto asociado. */
export interface InventarioLote {
  id: number;
  medicamentoId: number;
  numeroLote: string;
  cantidad: number;
  precioCompraLote: number;
  fechaVencimiento: string;
  fechaIngreso: string;
  activo: boolean;
}

/** Evento de entrada o salida que permite rastrear cambios de saldo. */
export interface MovimientoInventario {
  id: number;
  medicamentoId: number;
  loteId?: number | null;
  tipo: string;
  cantidad: number;
  fechaMovimiento: string;
  usuarioId?: number | null;
  usuarioNombre?: string | null;
  formulaId?: number | null;
  despachoId?: number | null;
  observacion?: string | null;
}

/** Resumen clínico usado para localizar y preparar una dispensación pendiente. */
export interface FormulaPendiente {
  formulaId: number;
  numeroFormula: string;
  fechaGeneracion: string;
  medicoNombre?: string;
  propietarioNombre?: string;
  mascotaNombre?: string;
  estadoDespacho?: string;
  indicaciones?: string;
  medicamentos: MedicamentoFormulado[];
}

/** Línea prescrita con cantidades pendientes y lotes que pueden atenderla. */
export interface MedicamentoFormulado {
  formulaDetalleId: number;
  medicamentoId: number;
  medicamentoNombre: string;
  dosis?: string;
  frecuencia?: string;
  duracionTratamiento?: string;
  viaAdministracion?: string;
  indicaciones?: string;
  cantidadPrescrita: number;
  cantidadDispensada: number;
  cantidadPendiente: number;
  cantidadDisponible: number;
  cantidadFaltante: number;
  disponibilidadSuficiente: boolean;
  lotes: LoteDisponible[];
}

/** Estado de un lote para la preparación, con recomendación FEFO del backend. */
export interface LoteDisponible {
  loteId: number;
  numeroLote: string;
  cantidadDisponible: number;
  fechaVencimiento: string | null;
  vencido: boolean;
  proximoAVencer: boolean;
  recomendadoFefo: boolean;
  seleccionable: boolean;
}

/** Cantidad que se entregará desde un lote para una línea de fórmula. */
export interface AsignacionLote {
  formulaDetalleId: number;
  loteId: number;
  cantidadEntregada: number;
}

/** Resumen del despacho mostrado en la cola y en el historial. */
export interface Despacho {
  id: number;
  numeroDespacho: string;
  numeroComprobante?: string | null;
  formulaId: number;
  clienteId?: number | null;
  mascotaId?: number | null;
  fechaDespacho?: string | null;
  estado: string;
  numeroFormula?: string;
  propietarioNombre?: string;
  mascotaNombre?: string;
  medicoNombre?: string;
  usuarioDespachoNombre?: string;
  observacion?: string | null;
}

/** Respuesta flexible para mensajes y resultados de carga masiva. */
export interface RespuestaApi {
  mensaje?: string;
  message?: string;
  cargaId?: number;
  [key: string]: unknown;
}

/** Estados derivados del stock actual y del mínimo configurado para el producto. */
export type EstadoInventario = 'AGOTADO' | 'BAJO' | 'DISPONIBLE';

/** Contiene el tipo de informe y el rango de fechas consultado. */
export interface FiltrosInformeInventario {
  tipo: string;
  desde: string;
  hasta: string;
}

/** Reúne las existencias, los lotes, los movimientos y sus totales. */
export interface InformeInventario {
  generado: string;
  tipo: string;
  desde: string | null;
  hasta: string | null;
  moneda: string;
  secciones: { nombre: string; columnas: string[]; filas: (string | number | boolean | null)[][] }[];
  totales: {
    existenciasRegistradas: number;
    disponiblesParaDispensar: number;
    valorCosto: number;
    valorPotencialVenta: number;
    entradas: number;
    salidas: number;
  };
}
