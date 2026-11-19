/** Define los datos enviados al servidor para la anotación clínica. */
export interface AnotacionHistoriaRq {
    id?: number;
    historiaId: number;
    medicoId: number;
    citaId: number;
    descripcion: string;
    diagnostico: string;
    observaciones: string;
}
