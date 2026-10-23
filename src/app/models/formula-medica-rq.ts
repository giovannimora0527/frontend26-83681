// Datos que se envian al backend para crear o actualizar una formula medica
export class FormulaMedicaRq {
    id?: number;
    clienteId?: number;
    mascotaId?: number;
    citaId?: number;
    medicoId?: number;
    fechaEmision?: string;
    medicamento?: string;
    dosisCantidad?: number;
    dosisUnidad?: string;
    frecuencia?: string;
    duracionDias?: number;
    indicaciones?: string;
}
