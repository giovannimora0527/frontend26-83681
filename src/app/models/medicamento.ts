export class Medicamento {
	id!: number;
	nombre!: string;
	descripcion?: string | null;
	presentacion?: string | null;
	tipoProducto?: string | null;
	codigo?: string | null;
	registroInvima?: string | null;
	precioCompra?: number | null;
	precioVenta?: number | null;
	cantidadActual?: number | null;
	stockMinimo?: number | null;
	fechaProximoPedido?: Date | string | null;
	fechaCompra?: Date | string;
	fechaVence?: Date | string;
	fechaCreacionRegistro?: Date | string;
	fechaModificacionRegistro?: Date | string | null;
	fecha_compra?: Date;
	fecha_vence?: Date;
	fecha_creacion_registro?: Date;
	fecha_modificacion_registro?: Date | null;
}
