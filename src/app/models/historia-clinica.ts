import { CitaMedica } from "./cita-medica";
import { Mascota } from "./mascota";
import { Medico } from "./medico";

// Historia clinica tal como la devuelve el backend (una por cada cita atendida)
export class HistoriaClinica {
    id?: number;
    mascota?: Mascota;
    cita?: CitaMedica;
    medico?: Medico;
    fechaConsulta?: string;
    motivo?: string;
    diagnostico?: string;
    observaciones?: string;
    estado?: string;
}
