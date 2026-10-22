import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Medico } from 'src/app/models/medico';
import { MedicosService } from './service/medicos-service.service';

// Módulo de gestión de la tabla `medico` (base de datos clinica).
@Component({
  selector: 'app-medicos',
  imports: [CommonModule],
  templateUrl: './medicos.component.html',
  styleUrl: './medicos.component.scss'
})
export class MedicosComponent implements OnDestroy {
  titulo = 'Gestión de Médicos';
  lista: Medico[] = [];

  // Columnas = campos de la tabla `medico`.
  // tipo: 'f' fecha, 'fh' fecha y hora, 't' texto largo recortado.
  columnas = [
    { campo: 'id', etiqueta: 'ID', tipo: '' },
    { campo: 'tipoDocumento', etiqueta: 'Tipo doc.', tipo: '' },
    { campo: 'numeroDocumento', etiqueta: 'Documento', tipo: '' },
    { campo: 'nombres', etiqueta: 'Nombres', tipo: '' },
    { campo: 'apellidos', etiqueta: 'Apellidos', tipo: '' },
    { campo: 'telefono', etiqueta: 'Teléfono', tipo: '' },
    { campo: 'registroProfesional', etiqueta: 'Registro profesional', tipo: '' },
    { campo: 'especializacionId', etiqueta: 'Especialización', tipo: '' }
  ];

  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;

  // Recarga automática para mostrar los registros que se vayan agregando en la BD.
  private readonly segundosRecarga = 10;
  private temporizador: ReturnType<typeof setInterval>;
  ultimaActualizacion: Date | null = null;
  errorConexion = false;

  constructor(private readonly medicosService: MedicosService) {
    this.listar();
    this.temporizador = setInterval(() => this.listar(), this.segundosRecarga * 1000);
  }

  listar() {
    this.medicosService.getMedicos().subscribe({
      next: (data) => {
        this.lista = data ?? [];
        if (this.paginaActual > this.totalPaginas) this.paginaActual = Math.max(this.totalPaginas, 1);
        this.ultimaActualizacion = new Date();
        this.errorConexion = false;
      },
      error: (error) => {
        this.errorConexion = true;
        console.error('Error al consultar la tabla medico:', error);
      }
    });
  }

  ngOnDestroy() {
    clearInterval(this.temporizador);
  }

  // Devuelve el valor de una columna. Si el backend envía la relación como objeto
  // (ej. cliente: {...} en vez de clienteId), muestra el id de ese objeto.
  valor(registro: any, campo: string): any {
    let v = registro?.[campo];
    if (v === undefined && campo.endsWith('Id')) {
      const rel = registro?.[campo.slice(0, -2)];
      v = rel?.[campo] ?? rel?.id;
    }
    return v;
  }

  get filtrados(): Medico[] {
    const termino = this.normalizar(this.terminoBusqueda.trim());
    if (!termino) return this.lista;
    return this.lista.filter((r) =>
      this.columnas.some((c) => this.normalizar(String(this.valor(r, c.campo) ?? '')).includes(termino))
    );
  }

  get paginados(): Medico[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.filtrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.filtrados.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  actualizarBusqueda(event: Event) {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) this.paginaActual = pagina;
  }

  private normalizar(texto: string): string {
    return texto.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
