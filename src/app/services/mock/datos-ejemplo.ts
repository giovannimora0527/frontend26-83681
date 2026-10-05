// Datos de ejemplo para trabajar el frontend sin backend (environment.useMock = true).
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { Cita } from 'src/app/models/cita';
import { Cliente } from 'src/app/models/cliente';
import { Especializacion } from 'src/app/models/especializacion';
import { FormulaMedica } from 'src/app/models/formula-medica';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { Mascota } from 'src/app/models/mascota';
import { Medicamento } from 'src/app/models/medicamento';
import { Medico } from 'src/app/models/medico';
import { Raza } from 'src/app/models/raza';
import { Usuario } from 'src/app/models/usuario';

const especializaciones: Especializacion[] = [
  { id: 1, codigoEspecializacion: 'MG-01', nombre: 'Medicina general', descripcion: 'Consulta, diagnóstico y control preventivo.' },
  { id: 2, codigoEspecializacion: 'CX-02', nombre: 'Cirugía', descripcion: 'Procedimientos quirúrgicos y esterilizaciones.' },
  { id: 3, codigoEspecializacion: 'DM-03', nombre: 'Dermatología', descripcion: 'Enfermedades de la piel, pelo y oídos.' },
  { id: 4, codigoEspecializacion: 'OD-04', nombre: 'Odontología', descripcion: 'Limpieza dental y tratamiento de la cavidad oral.' }
];

const medicos: Medico[] = [
  { id: 1, tipoDocumento: 'CC', numeroDocumento: '52345678', nombres: 'Laura', apellidos: 'Martínez Rojas', telefono: '3104567890', registroProfesional: 'MV-10234', especializacion: especializaciones[0] },
  { id: 2, tipoDocumento: 'CC', numeroDocumento: '80123456', nombres: 'Andrés', apellidos: 'Gómez Pardo', telefono: '3157894561', registroProfesional: 'MV-11872', especializacion: especializaciones[1] },
  { id: 3, tipoDocumento: 'CC', numeroDocumento: '1019876543', nombres: 'Camila', apellidos: 'Herrera Díaz', telefono: '3209871234', registroProfesional: 'MV-12550', especializacion: especializaciones[2] }
];

const razas: Raza[] = [
  { razaId: 1, especie: 'Perro', nombre: 'Labrador Retriever', fechaCreacion: new Date('2026-01-10T09:00:00') },
  { razaId: 2, especie: 'Perro', nombre: 'Criollo', fechaCreacion: new Date('2026-01-10T09:00:00') },
  { razaId: 3, especie: 'Perro', nombre: 'Bulldog Francés', fechaCreacion: new Date('2026-01-10T09:00:00') },
  { razaId: 4, especie: 'Gato', nombre: 'Siamés', fechaCreacion: new Date('2026-01-10T09:00:00') },
  { razaId: 5, especie: 'Gato', nombre: 'Criollo', fechaCreacion: new Date('2026-01-10T09:00:00') },
  { razaId: 6, especie: 'Conejo', nombre: 'Belier', fechaCreacion: new Date('2026-02-03T09:00:00') }
];

const clientes: Cliente[] = [
  { clienteId: 1, tipoDocumento: 'CC', numeroDocumento: '1020304050', nombres: 'María Fernanda', apellidos: 'López Castro', fechaNacimiento: '1992-04-18', genero: 'Femenino', telefono: '3001234567', direccion: 'Cra 15 # 82-30, Bogotá', activo: true },
  { clienteId: 2, tipoDocumento: 'CC', numeroDocumento: '79856321', nombres: 'Carlos', apellidos: 'Ramírez Peña', fechaNacimiento: '1985-11-02', genero: 'Masculino', telefono: '3112223344', direccion: 'Cll 100 # 45-12, Bogotá', activo: true },
  { clienteId: 3, tipoDocumento: 'CE', numeroDocumento: 'E4567890', nombres: 'Valentina', apellidos: 'Suárez Mejía', fechaNacimiento: '1998-07-25', genero: 'Femenino', telefono: '3225556677', direccion: 'Av 68 # 23-50, Bogotá', activo: true },
  { clienteId: 4, tipoDocumento: 'CC', numeroDocumento: '1012345678', nombres: 'Julián', apellidos: 'Torres Ávila', fechaNacimiento: '2000-01-30', genero: 'Masculino', telefono: '3019998877', direccion: 'Cll 72 # 10-07, Bogotá', activo: false }
];

const mascotas: Mascota[] = [
  { mascotaId: 1, nombreMascota: 'Luna', edad: 3, raza: razas[0], cliente: clientes[0], fechaRegistro: new Date('2026-03-12T10:15:00') },
  { mascotaId: 2, nombreMascota: 'Michi', edad: 5, raza: razas[3], cliente: clientes[0], fechaRegistro: new Date('2026-03-12T10:20:00') },
  { mascotaId: 3, nombreMascota: 'Rocky', edad: 7, raza: razas[1], cliente: clientes[1], fechaRegistro: new Date('2026-04-02T16:40:00') },
  { mascotaId: 4, nombreMascota: 'Toby', edad: 2, raza: razas[2], cliente: clientes[2], fechaRegistro: new Date('2026-05-21T11:05:00') },
  { mascotaId: 5, nombreMascota: 'Nieve', edad: 1, raza: razas[5], cliente: clientes[2], fechaRegistro: new Date('2026-07-08T09:30:00') },
  { mascotaId: 6, nombreMascota: 'Simón', edad: 4, raza: razas[4], cliente: clientes[3], fechaRegistro: new Date('2026-08-14T15:00:00') }
];

const medicamentos: Medicamento[] = [
  { id: 1, nombre: 'Amoxicilina 250 mg', presentacion: 'Tableta', descripcion: 'Antibiótico de amplio espectro.', fechaCreacion: new Date('2026-01-15T08:00:00') },
  { id: 2, nombre: 'Meloxicam 1,5 mg/ml', presentacion: 'Suspensión oral', descripcion: 'Antiinflamatorio y analgésico.', fechaCreacion: new Date('2026-01-15T08:00:00') },
  { id: 3, nombre: 'Ivermectina 1%', presentacion: 'Inyectable', descripcion: 'Antiparasitario interno y externo.', fechaCreacion: new Date('2026-01-15T08:00:00') },
  { id: 4, nombre: 'Clorhexidina 2%', presentacion: 'Champú', descripcion: 'Antiséptico para uso dermatológico.', fechaCreacion: new Date('2026-02-20T08:00:00') },
  { id: 5, nombre: 'Omeprazol 20 mg', presentacion: 'Cápsula', descripcion: 'Protector gástrico.', fechaCreacion: new Date('2026-03-05T08:00:00') }
];

const citas: Cita[] = [
  { id: 1, clienteId: 1, mascota: mascotas[0], medico: medicos[0], fechaHora: '2026-09-15T09:00:00', estado: 'Atendida', motivo: 'Vacunación anual' },
  { id: 2, clienteId: 2, mascota: mascotas[2], medico: medicos[1], fechaHora: '2026-09-28T14:30:00', estado: 'Atendida', motivo: 'Cojera en pata trasera' },
  { id: 3, clienteId: 3, mascota: mascotas[3], medico: medicos[2], fechaHora: '2026-10-02T10:00:00', estado: 'Atendida', motivo: 'Picazón y caída de pelo' },
  { id: 4, clienteId: 1, mascota: mascotas[1], medico: medicos[0], fechaHora: '2026-10-06T11:00:00', estado: 'Confirmada', motivo: 'Control de peso' },
  { id: 5, clienteId: 3, mascota: mascotas[4], medico: medicos[0], fechaHora: '2026-10-08T16:00:00', estado: 'Programada', motivo: 'Primera consulta' },
  { id: 6, clienteId: 2, mascota: mascotas[2], medico: medicos[1], fechaHora: '2026-10-12T08:30:00', estado: 'Cancelada', motivo: 'Revisión posoperatoria' }
];

const historias: HistoriaMedica[] = [
  { id: 1, mascota: mascotas[0], fechaCreacion: '2026-03-12T10:30:00' },
  { id: 2, mascota: mascotas[2], fechaCreacion: '2026-04-02T17:00:00' },
  { id: 3, mascota: mascotas[3], fechaCreacion: '2026-05-21T11:20:00' }
];

const anotaciones: AnotacionHistoria[] = [
  { id: 1, historia: historias[0], medico: medicos[0], fecha: '2026-03-12T10:35:00', descripcion: 'Ingreso. Paciente sano, peso 24 kg. Se inicia esquema de vacunación.' },
  { id: 2, historia: historias[0], medico: medicos[0], fecha: '2026-09-15T09:20:00', descripcion: 'Vacuna anual aplicada (múltiple + rabia). Sin reacciones.' },
  { id: 3, historia: historias[1], medico: medicos[1], fecha: '2026-09-28T15:00:00', descripcion: 'Cojera grado 2 en miembro posterior izquierdo. Se indica antiinflamatorio y reposo 10 días.' },
  { id: 4, historia: historias[2], medico: medicos[2], fecha: '2026-10-02T10:30:00', descripcion: 'Dermatitis alérgica. Baños con clorhexidina cada 3 días y control en 2 semanas.' }
];

const formulas: FormulaMedica[] = [
  { id: 1, citaId: 2, medicamentoId: 2, dosis: '0,1 mg/kg cada 24 h', indicaciones: 'Dar con comida durante 7 días.', fechaCreacionRegistro: '2026-09-28T15:05:00' },
  { id: 2, citaId: 3, medicamentoId: 4, dosis: 'Baño cada 3 días', indicaciones: 'Dejar actuar 10 minutos antes de enjuagar.', fechaCreacionRegistro: '2026-10-02T10:40:00' },
  { id: 3, citaId: 3, medicamentoId: 1, dosis: '1 tableta cada 12 h', indicaciones: 'Durante 5 días. No suspender antes.', fechaCreacionRegistro: '2026-10-02T10:42:00' }
];

const usuarios: Usuario[] = [
  { id: 1, username: 'admin', email: 'admin@veterinaria.edu.co', rol: 'ADMIN', activo: true, fechaCreacion: new Date('2026-01-05T08:00:00') },
  { id: 2, username: 'lmartinez', email: 'laura.martinez@veterinaria.edu.co', rol: 'MEDICO', activo: true, fechaCreacion: new Date('2026-01-12T09:30:00') },
  { id: 3, username: 'agomez', email: 'andres.gomez@veterinaria.edu.co', rol: 'MEDICO', activo: true, fechaCreacion: new Date('2026-02-01T10:00:00') },
  { id: 4, username: 'recepcion', email: 'recepcion@veterinaria.edu.co', rol: 'RECEPCIONISTA', activo: true, fechaCreacion: new Date('2026-02-15T14:20:00') },
  { id: 5, username: 'practicante01', email: 'practicante01@veterinaria.edu.co', rol: 'RECEPCIONISTA', activo: false, fechaCreacion: new Date('2026-03-03T11:45:00') }
];

export const DATOS_EJEMPLO = {
  especializaciones,
  medicos,
  razas,
  clientes,
  mascotas,
  medicamentos,
  citas,
  historias,
  anotaciones,
  formulas,
  usuarios
};

export type TablaEjemplo = keyof typeof DATOS_EJEMPLO;
