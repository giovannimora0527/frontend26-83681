import { Mascota } from "./mascota";
import { Medico } from "./medico";

// Cita tal como la devuelve el backend.
// El cliente se obtiene a traves de la mascota: cita.mascota.cliente
export class CitaMedica {
    id?: number;
    mascota?: Mascota;
    medico?: Medico;
    fechaHora?: string;
    estado?: string;
    motivo?: string;
}
