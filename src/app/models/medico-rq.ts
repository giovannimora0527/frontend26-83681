/** Define los datos enviados al servidor para el veterinario. */
export class MedicoRq {
    id?: number;
    tipoDocumento!: string;
    numeroDocumento!: string;
    nombres!: string;
    apellidos!: string;
    telefono!: string;
    registroProfesional!: string;
    especializacionId!: number;
}
