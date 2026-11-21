export class Medicamento {
  id!: number;
  codigo?: string;
  nombre!: string;
  descripcion?: string | null;
  presentacion?: string | null;
  tipoProducto?: string;
  registroInvima?: string | null;
  requiereInvima?: boolean;
  precioCompra?: number;
  precioVenta?: number;
  stockActual?: number;
  stockMinimo?: number;
  fechaIngreso?: Date | string | null;
  fechaProximoPedido?: Date | string | null;
  activo?: boolean;
  fechaCompra?: Date | string;
  fechaVence?: Date | string;
  fechaCreacionRegistro?: Date | string;
  fechaModificacionRegistro?: Date | string | null;
  fecha_compra?: Date;
  fecha_vence?: Date;
  fecha_creacion_registro?: Date;
  fecha_modificacion_registro?: Date | null;
}
