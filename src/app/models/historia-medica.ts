import { Cita } from "./cita";
import { Cliente } from "./cliente";
import { Mascota } from "./mascota";
import { Medico } from "./medico";

export class HistoriaMedica {
  id!: number;
  clienteId?: number;
  mascotaId?: number;
  citaId?: number;
  medicoId?: number;
  fecha?: string;
  fechaCreacion?: string;
  fechaActualizacionRegistro?: string;
  estado?: string;
  motivo?: string;
  diagnostico?: string;
  observaciones?: string;
  mascota?: Mascota;
  cliente?: Cliente;
  cita?: Cita;
  medico?: Medico;
}