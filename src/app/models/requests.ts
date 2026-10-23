// Objetos que espera el backend para crear o actualizar registros.

export interface ClienteRq {
    id?: number;
    tipoDocumento: string;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    fechaNacimiento: string | null;
    genero: string | null;
    telefono: string | null;
    direccion: string | null;
    activo: boolean;
}

export interface MascotaRq {
    mascotaId?: number;
    nombreMascota: string;
    edad: number;
    razaId: number;
    clienteId: number;
}

export interface RazaRq {
    razaId?: number;
    nombre: string;
    especie: string;
}

export interface UsuarioRq {
    id?: number;
    username: string;
    password?: string;
    rol: string;
    email: string;
    activo: boolean;
}

export interface MedicoRq {
    id?: number;
    tipoDocumento: string;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    telefono: string | null;
    registroProfesional: string;
    especializacionId: number;
}

export interface EspecializacionRq {
    id?: number;
    nombre: string;
    descripcion: string | null;
    codigoEspecializacion: string;
}

export interface MedicamentoRq {
    id?: number;
    nombre: string;
    presentacion: string;
    descripcion: string | null;
}

/** Datos para crear o editar una cita (CitaRq del backend). */
export interface CitaRq {
    clienteId: number;
    mascotaId: number;
    medicoId: number;
    /** Fecha y hora en formato ISO local (yyyy-MM-ddTHH:mm:ss). */
    fechaCita: string;
    motivo: string;
    /** Solo se usa al crear la cita. */
    estado?: string;
}

/** Datos para crear una historia clínica (HistoriaMedicaRq del backend). */
export interface HistoriaMedicaRq {
    clienteId: number;
    mascotaId: number;
    citaId: number;
    medicoId: number;
    fechaConsulta: string;
    motivoConsulta: string;
    diagnostico: string;
    observaciones: string | null;
}

/** Datos para agregar una anotación (AnotacionHistoriaRq del backend). */
export interface AnotacionHistoriaRq {
    historiaId: number;
    medicoId: number;
    fechaAnotacion: string;
    descripcion: string;
    observacion: string;
    diagnosticoEvolucion: string;
}

/** Datos para crear o editar una fórmula médica (FormulaMedicaRq del backend). */
export interface FormulaMedicaRq {
    clienteId: number;
    mascotaId: number;
    historiaId: number;
    medicoId: number;
    /** Fecha de emisión (yyyy-MM-dd). */
    fechaEmision: string;
    medicamento: string;
    dosis: number;
    unidadDosis: string;
    frecuenciaHoras: number;
    duracionDias: number;
    indicaciones: string;
}

// Respuesta generica del backend (MiRespuestaRS).
export interface MiRespuestaRS {
    status: number;
    message: string;
    /** Id del registro creado o modificado. */
    id?: number;
}
