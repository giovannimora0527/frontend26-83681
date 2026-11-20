export interface FormulaPendiente {
  id: number;
  atencionId: number;
  medicamento: { id: number; nombre: string; presentacion?: string; codigo?: string };
  cantidadPrescrita: number;
  cantidadDispensada: number;
  dosis: string;
  frecuencia?: string;
  duracion?: string;
  viaAdministracion?: string;
  indicaciones?: string;
}

export interface ConfirmarDespachoRq {
  idempotencyKey: string;
  detalles: Array<{ formulaDetalleId: number; cantidad: number }>;
}

export interface DespachoRs {
  id: number;
  numero: string;
  estado: string;
  confirmadoEn?: string;
}
