<<<<<<< HEAD
export class Medicamento {
	id!: number;
	nombre!: string;
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
	codigo?: string;
	tipoProducto?: 'MEDICAMENTO' | 'INSUMO';
	registroInvima?: string | null;
	precioCompra?: number;
	precioPublico?: number;
	stockMinimo?: number;
	activo?: boolean;
=======
// Tabla: medicamento
export class Medicamento {
    id?: number;
    nombre?: string;
    descripcion?: string;
    presentacion?: string;
    fechaCompra?: string;
    fechaVence?: string;
    fechaCreacionRegistro?: Date;
    fechaModificacionRegistro?: Date;
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
}
