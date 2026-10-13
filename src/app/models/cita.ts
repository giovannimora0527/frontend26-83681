import { Cliente } from "./cliente";
import { Mascota } from "./mascota";
import { Medico } from "./medico";

export class Cita {
    id?: number;
    clienteId?: number;
    mascotaId?: number;
    medicoId?: number;
    fechaHora?: Date;
    estado?: string;
    motivo?: string;
    cliente?: Cliente;
    mascota?: Mascota;
    medico?: Medico;

}
