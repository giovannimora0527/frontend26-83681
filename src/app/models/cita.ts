import { Cliente } from './cliente';
import { Mascota } from './mascota';
import { Medico } from './medico';

/** Representa una cita con su paciente, profesional, horario y estado. */
export class Cita {
	id?: number;
	cliente?: Cliente;
	mascota?: Mascota;
	medico?: Medico;
	fechaHora!: Date | string;
	estado!: string;
	motivo!: string | null;
	mascotaId?: number;
	medicoId?: number;
	duracionMinutos?: number;
	horaFin?: string;
	motivoCancelacion?: string;
}
