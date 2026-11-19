import { Cita } from "./cita";
import { Medicamento } from "./medicamento";

/** Define los datos que utiliza la aplicación para representar el detalle. */
export interface DetalleFormula {
	id: number;
	medicamentoNombre?: string;
	medicamentoId: number;
	cantidadPrescrita: number;
	dosis: string;
	frecuencia: string;
	duracionTratamiento: string;
	viaAdministracion: string;
	indicaciones?: string | null;
}

/** Define los datos que utiliza la aplicación para representar la fórmula médica. */
export class Formula {
	id?: number;
	cita!: Cita;
	medicamento!: Medicamento;
	dosis!: string;
	indicaciones?: string | null;
	fechaCreacionRegistro?: Date | string;
	fechaActualizacionRegistro?: Date | string | null;
	fecha_actualizacion_registro?: Date | null;
	frecuencia!: string;
	duracion!: string;
	citaId?: number;
	medicamentoId?: number;
	numeroFormula?: string;
	detalles?: DetalleFormula[];
	viaAdministracion?: string;
	cantidadPrescrita?: number;
	cantidadDispensada?: number;
	estado?: string;
	activo?: boolean;
}
