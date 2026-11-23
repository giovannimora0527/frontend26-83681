<<<<<<< HEAD
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { Medicamento } from 'src/app/models/medicamento';
import { MedicamentoService } from './service/medicamento.service';
import { getJwtPayload } from 'src/app/utils/jwt.util';
=======
import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Medicamento } from 'src/app/models/medicamento';
import { MedicamentoService } from './service/medicamento.service';
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3

// Módulo de gestión de la tabla `medicamento` (base de datos clinica).
@Component({
  selector: 'app-medicamento',
<<<<<<< HEAD
  imports: [CommonModule, FormsModule],
  templateUrl: './medicamento.component.html',
  styleUrl: './medicamento.component.scss'
})
export class MedicamentoComponent implements OnInit {
  medicamentos: Medicamento[] = [];
  filtro = '';
  tipoFiltro = '';
  cargando = false;
  guardando = false;
  error = '';
  formularioAbierto = false;
  seleccionado: Medicamento | null = null;
  readonly puedeAdministrar = getJwtPayload()?.rol.toUpperCase() === 'ADMINISTRADOR';
  producto = this.formularioVacio();

  constructor(private readonly servicio: MedicamentoService) {}

  ngOnInit(): void { this.cargar(); }

  get listaFiltrada(): Medicamento[] {
    const query = this.filtro.trim().toLocaleLowerCase();
    return this.medicamentos.filter(item => {
      const coincideTexto = !query || `${item.codigo ?? ''} ${item.nombre} ${item.presentacion ?? ''}`.toLocaleLowerCase().includes(query);
      return coincideTexto && (!this.tipoFiltro || item.tipoProducto === this.tipoFiltro);
    });
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.servicio.listarMedicamentos().pipe(finalize(() => this.cargando = false)).subscribe({
      next: items => this.medicamentos = items,
      error: err => this.error = this.mensajeError(err)
    });
  }

  nuevo(): void {
    this.seleccionado = null;
    this.producto = this.formularioVacio();
    this.formularioAbierto = true;
  }

  editar(item: Medicamento): void {
    this.seleccionado = item;
    this.producto = {
      id: item.id, codigo: item.codigo ?? '', tipoProducto: item.tipoProducto ?? 'MEDICAMENTO',
      nombre: item.nombre, descripcion: item.descripcion ?? '', presentacion: item.presentacion ?? '',
      registroInvima: item.registroInvima ?? '', precioCompra: item.precioCompra ?? 0,
      precioPublico: item.precioPublico ?? 0, stockMinimo: item.stockMinimo ?? 0, activo: item.activo ?? true
    };
    this.formularioAbierto = true;
  }

  guardar(): void {
    if (this.guardando || !this.puedeAdministrar) return;
    this.guardando = true;
    this.error = '';
    const request = this.seleccionado
      ? this.servicio.actualizar({ ...this.producto, id: this.seleccionado.id })
      : this.servicio.crear(this.producto);
    request.pipe(finalize(() => this.guardando = false)).subscribe({
      next: () => { this.formularioAbierto = false; this.cargar(); },
      error: err => this.error = this.mensajeError(err)
    });
  }

  private formularioVacio(): Omit<Medicamento, 'id'> & { id?: number } {
    return { codigo: '', tipoProducto: 'MEDICAMENTO', nombre: '', descripcion: '', presentacion: '', registroInvima: '', precioCompra: 0, precioPublico: 0, stockMinimo: 0, activo: true };
  }

  private mensajeError(error: { error?: { message?: string }; message?: string }): string {
    return error?.error?.message ?? error?.message ?? 'No fue posible completar la operación.';
=======
  imports: [CommonModule],
  templateUrl: './medicamento.component.html',
  styleUrl: './medicamento.component.scss'
})
export class MedicamentoComponent implements OnDestroy {
  titulo = 'Gestión de Medicamentos';
  lista: Medicamento[] = [];

  // Columnas = campos de la tabla `medicamento`.
  // tipo: 'f' fecha, 'fh' fecha y hora, 't' texto largo recortado.
  columnas = [
    { campo: 'id', etiqueta: 'ID', tipo: '' },
    { campo: 'nombre', etiqueta: 'Nombre', tipo: '' },
    { campo: 'descripcion', etiqueta: 'Descripción', tipo: '' },
    { campo: 'presentacion', etiqueta: 'Presentación', tipo: '' },
    { campo: 'fechaCompra', etiqueta: 'Fecha compra', tipo: 'f' },
    { campo: 'fechaVence', etiqueta: 'Fecha vence', tipo: 'f' }
  ];

  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;

  // Recarga automática para mostrar los registros que se vayan agregando en la BD.
  private readonly segundosRecarga = 10;
  private temporizador: ReturnType<typeof setInterval>;
  ultimaActualizacion: Date | null = null;
  errorConexion = false;

  constructor(private readonly medicamentoService: MedicamentoService) {
    this.listar();
    this.temporizador = setInterval(() => this.listar(), this.segundosRecarga * 1000);
  }

  listar() {
    this.medicamentoService.getMedicamentos().subscribe({
      next: (data) => {
        this.lista = data ?? [];
        if (this.paginaActual > this.totalPaginas) this.paginaActual = Math.max(this.totalPaginas, 1);
        this.ultimaActualizacion = new Date();
        this.errorConexion = false;
      },
      error: (error) => {
        this.errorConexion = true;
        console.error('Error al consultar la tabla medicamento:', error);
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

  get filtrados(): Medicamento[] {
    const termino = this.normalizar(this.terminoBusqueda.trim());
    if (!termino) return this.lista;
    return this.lista.filter((r) =>
      this.columnas.some((c) => this.normalizar(String(this.valor(r, c.campo) ?? '')).includes(termino))
    );
  }

  get paginados(): Medicamento[] {
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
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
  }
}
