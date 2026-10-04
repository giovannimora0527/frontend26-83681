import { Mascota } from "./mascota";
import { Medico } from "./medico";

export class Cita {
    id?: number;
    clienteId?: number;
    mascota?: Mascota;
    medico?: Medico;
    fechaHora?: string;
    estado?: string;
    motivo?: string;
}
