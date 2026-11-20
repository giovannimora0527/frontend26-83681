export class Medicamento {
	id!: number;
	nombre!: string;
	codigo?: string | null;
	tipoProducto?: 'MEDICAMENTO' | 'PRODUCTO' | 'UTENSILIO' | string;
	registroInvima?: string | null;
	precioCompra?: number;
	precioVenta?: number;
	stockMinimo?: number;
	fechaProximoPedido?: string | null;
	activo?: boolean;
	descripcion?: string | null;
	presentacion?: string | null;
	fechaCompra?: Date | string;
	fechaVence?: Date | string;
	fechaCreacionRegistro?: Date | string;
	fechaModificacionRegistro?: Date | string | null;
	fecha_compra?: Date;
	fecha_vence?: Date;
	fecha_creacion_registro?: Date;
	fecha_modificacion_registro?: Date | null;
}

export interface ProductoRq {
	 nombre: string;
	 descripcion?: string | null;
	 presentacion?: string | null;
	 codigo?: string | null;
	 tipoProducto: string;
	 registroInvima?: string | null;
	 precioCompra: number;
	 precioVenta: number;
	 stockMinimo: number;
	 fechaProximoPedido?: string | null;
	 activo: boolean;
}

export interface InventarioLote {
	id: number;
	medicamento: Medicamento;
	numeroLote: string;
	fechaIngreso: string;
	fechaVencimiento: string;
	cantidadInicial: number;
	cantidadDisponible: number;
	precioCompraUnitario: number;
	precioVentaUnitario: number;
	referenciaProveedor?: string | null;
}

export interface InventarioMovimiento {
	id: number;
	lote: InventarioLote;
	tipo: string;
	cantidad: number;
	referenciaTipo?: string | null;
	referenciaId?: number | null;
	motivo?: string | null;
	usuarioId?: number | null;
	creadoEn: string;
}

export interface EntradaLoteRq {
	medicamentoId: number;
	numeroLote: string;
	fechaIngreso: string;
	fechaVencimiento: string;
	cantidad: number;
	precioCompraUnitario: number;
	precioVentaUnitario: number;
	referenciaProveedor?: string | null;
	usuarioId?: number | null;
}

export interface ImportacionFila {
	fila: number;
	producto: ProductoRq | null;
	lote: EntradaLoteRq | null;
	errores: string[];
}

export interface ImportacionPreview {
	importacionId: number;
	totalFilas: number;
	validas: number;
	invalidas: number;
	filas: ImportacionFila[];
}

export interface ImportacionResultado extends ImportacionPreview {
	creadas: number;
	fallidas: number;
}
