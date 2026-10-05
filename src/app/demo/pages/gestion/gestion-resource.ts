export interface ManagementField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime-local' | 'textarea' | 'select';
  required?: boolean;
  options?: Record<string, string>;
  readKey?: string;
}

export interface ManagementColumn {
  key: string;
  label: string;
}

export interface ManagementResource {
  title: string;
  endpoint: string;
  listPath: string;
  idField: string;
  fields: ManagementField[];
  columns: ManagementColumn[];
}

const resource = (
  title: string,
  endpoint: string,
  listPath: string,
  idField: string,
  fields: ManagementField[],
  columns: ManagementColumn[] = fields.map(({ key, label }) => ({ key, label }))
): ManagementResource => ({ title, endpoint, listPath, idField, fields, columns });

export const MANAGEMENT_RESOURCES: Record<string, ManagementResource> = {
  cliente: resource('Clientes', 'cliente', 'all', 'id', [
    { key: 'tipoDocumento', label: 'Tipo de documento', type: 'text', required: true },
    { key: 'numeroDocumento', label: 'Número de documento', type: 'text', required: true },
    { key: 'nombres', label: 'Nombres', type: 'text', required: true },
    { key: 'apellidos', label: 'Apellidos', type: 'text', required: true },
    { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date' },
    { key: 'genero', label: 'Género', type: 'text' },
    { key: 'telefono', label: 'Teléfono', type: 'text' },
    { key: 'direccion', label: 'Dirección', type: 'text' },
    { key: 'activo', label: 'Estado', type: 'select', options: { true: 'Activo', false: 'Inactivo' } }
  ]),
  cita: resource('Citas', 'cita', 'listar', 'id', [
    { key: 'clienteId', label: 'ID del cliente', type: 'number', required: true },
    { key: 'medicoId', label: 'ID del médico', type: 'number', required: true },
    { key: 'mascotaId', label: 'ID de la mascota', type: 'number', required: true },
    { key: 'fechaHora', label: 'Fecha y hora', type: 'datetime-local', required: true },
    { key: 'motivo', label: 'Motivo', type: 'textarea', required: true },
    {
      key: 'estado',
      label: 'Estado',
      type: 'select',
      required: true,
      options: { pendiente: 'Pendiente', confirmada: 'Confirmada', cancelada: 'Cancelada', atendida: 'Atendida' }
    }
  ]),
  historia: resource('Historias médicas', 'historia', 'listar', 'id', [
    { key: 'clienteId', label: 'ID del cliente', type: 'number', required: true },
    { key: 'fechaCreacion', label: 'Fecha de creación', type: 'datetime-local', readKey: 'fechaCreacion' }
  ]),
  anotacion: resource('Anotaciones de historia', 'anotacion-historia', 'all', 'id', [
    { key: 'historiaId', label: 'ID de la historia médica', type: 'number', required: true, readKey: 'historia.id' },
    { key: 'medicoId', label: 'ID del médico', type: 'number', required: true },
    { key: 'descripcion', label: 'Descripción', type: 'textarea', required: true }
  ]),
  formula: resource('Fórmulas médicas', 'formula-medica', 'listar', 'id', [
    { key: 'citaId', label: 'ID de la cita', type: 'number', required: true },
    { key: 'medicamentoId', label: 'ID del medicamento', type: 'number', required: true },
    { key: 'dosis', label: 'Dosis', type: 'textarea', required: true },
    { key: 'indicaciones', label: 'Indicaciones', type: 'textarea' }
  ]),
  medico: resource('Médicos', 'medico', 'all', 'id', [
    { key: 'tipoDocumento', label: 'Tipo de documento', type: 'text', required: true },
    { key: 'numeroDocumento', label: 'Número de documento', type: 'text', required: true },
    { key: 'nombres', label: 'Nombres', type: 'text', required: true },
    { key: 'apellidos', label: 'Apellidos', type: 'text', required: true },
    { key: 'telefono', label: 'Teléfono', type: 'text' },
    { key: 'registroProfesional', label: 'Registro profesional', type: 'text', required: true },
    { key: 'especializacionId', label: 'ID de especialización', type: 'number', required: true, readKey: 'especializacion.id' }
  ], [
    { key: 'tipoDocumento', label: 'Tipo de documento' },
    { key: 'numeroDocumento', label: 'Número de documento' },
    { key: 'nombres', label: 'Nombres' },
    { key: 'apellidos', label: 'Apellidos' },
    { key: 'registroProfesional', label: 'Registro profesional' },
    { key: 'especializacion.nombre', label: 'Especialización' }
  ]),
  especializacion: resource('Especializaciones', 'especializacion', 'listar', 'id', [
    { key: 'nombre', label: 'Nombre', type: 'text', required: true },
    { key: 'codigoEspecializacion', label: 'Código', type: 'text', required: true },
    { key: 'descripcion', label: 'Descripción', type: 'textarea' }
  ]),
  raza: resource('Razas', 'raza', 'listar', 'razaId', [
    { key: 'nombre', label: 'Nombre', type: 'text', required: true },
    { key: 'especie', label: 'Especie', type: 'text', required: true }
  ]),
  medicamento: resource('Medicamentos', 'medicamento', 'listar', 'id', [
    { key: 'nombre', label: 'Nombre', type: 'text', required: true },
    { key: 'descripcion', label: 'Descripción', type: 'textarea' },
    { key: 'presentacion', label: 'Presentación', type: 'text' },
    { key: 'fechaCompra', label: 'Fecha de compra', type: 'date', required: true },
    { key: 'fechaVence', label: 'Fecha de vencimiento', type: 'date', required: true }
  ])
};
