// Datos que se envian al backend para crear una historia clinica
export class HistoriaClinicaRq {
    clienteId?: number;
    mascotaId?: number;
    citaId?: number;
    medicoId?: number;
    fechaHora?: string;
    motivo?: string;
    diagnostico?: string;
    observaciones?: string;
}
