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

export interface AnotacionRq {
    mascotaId: number;
    medicoId: number;
    descripcion: string;
}

// Respuesta generica del backend (MiRespuestaRS).
export interface MiRespuestaRS {
    status: number;
    message: string;
}
