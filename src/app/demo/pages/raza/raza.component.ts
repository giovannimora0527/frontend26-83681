import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Raza } from 'src/app/models/raza';
import { RazaService } from './service/raza.service';

// Módulo de gestión de la tabla `raza` (base de datos clinica).
@Component({
  selector: 'app-raza',
  imports: [CommonModule],
  templateUrl: './raza.component.html',
  styleUrl: './raza.component.scss'
})
export class RazaComponent implements OnDestroy {
  titulo = 'Gestión de Razas';
  lista: Raza[] = [];

  // Columnas = campos de la tabla `raza`.
  // tipo: 'f' fecha, 'fh' fecha y hora, 't' texto largo recortado.
  columnas = [
    { campo: 'razaId', etiqueta: 'ID', tipo: '' },
    { campo: 'nombre', etiqueta: 'Nombre', tipo: '' },
    { campo: 'especie', etiqueta: 'Especie', tipo: '' },
    { campo: 'fechaCreacion', etiqueta: 'Fecha creación', tipo: 'f' },
    { campo: 'fechaModificacion', etiqueta: 'Fecha modificación', tipo: 'f' }
  ];

  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;

  // Recarga automática para mostrar los registros que se vayan agregando en la BD.
  private readonly segundosRecarga = 10;
  private temporizador: ReturnType<typeof setInterval>;
  ultimaActualizacion: Date | null = null;
  errorConexion = false;

  constructor(private readonly razaService: RazaService) {
    this.listar();
    this.temporizador = setInterval(() => this.listar(), this.segundosRecarga * 1000);
  }

  listar() {
    this.razaService.getRazas().subscribe({
      next: (data) => {
        this.lista = data ?? [];
        if (this.paginaActual > this.totalPaginas) this.paginaActual = Math.max(this.totalPaginas, 1);
        this.ultimaActualizacion = new Date();
        this.errorConexion = false;
      },
      error: (error) => {
        this.errorConexion = true;
        console.error('Error al consultar la tabla raza:', error);
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

  get filtrados(): Raza[] {
    const termino = this.normalizar(this.terminoBusqueda.trim());
    if (!termino) return this.lista;
    return this.lista.filter((r) =>
      this.columnas.some((c) => this.normalizar(String(this.valor(r, c.campo) ?? '')).includes(termino))
    );
  }

  get paginados(): Raza[] {
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
