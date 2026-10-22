import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertaComponent } from 'src/app/components/alerta/alerta.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { PaginadorComponent } from 'src/app/components/paginador/paginador.component';
import { ClienteResumen, MascotaResumen, VeterinarioResumen, nombreCompleto } from 'src/app/models/catalogos';
import { Cita, CitaRq, ESTADOS_CITA, FiltrosCita } from 'src/app/models/cita';
import { DireccionOrden, Pagina } from 'src/app/models/pagina';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { mensajeDeError } from 'src/app/services/api.util';
import { CitaService } from './service/cita.service';

/** Mensaje mostrado en pantalla (éxito, advertencia o error). */
interface Aviso {
  tipo: 'success' | 'danger' | 'warning' | 'info';
  texto: string;
}

/**
 * Gestión de citas: listado paginado (DataTable) con filtros y orden en el servidor,
 * formulario con combos dependientes cliente → mascota, y acciones según el estado de la cita.
 */
@Component({
  selector: 'app-cita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertaComponent, ModalComponent, PaginadorComponent],
  templateUrl: './cita.component.html',
  styleUrl: './cita.component.scss'
})
export class CitaComponent {
  private readonly citaService = inject(CitaService);
  private readonly catalogo = inject(CatalogoService);

  /** Función expuesta a la plantilla para mostrar nombres completos. */
  readonly nombreCompleto = nombreCompleto;

  /** Estados válidos (vienen del modelo, igual que las reglas del backend). */
  readonly estados = ESTADOS_CITA;

  /** Fecha de hoy en formato yyyy-MM-dd (hora local) para restringir citas pasadas. */
  readonly hoy = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  /** Columnas del DataTable. Las que tienen campo se pueden ordenar en el servidor. */
  readonly columnas: { campo: string; etiqueta: string }[] = [
    { campo: 'fechaHora', etiqueta: 'Fecha' },
    { campo: 'fechaHora', etiqueta: 'Hora' },
    { campo: 'clienteId', etiqueta: 'Cliente' },
    { campo: 'mascotaId', etiqueta: 'Mascota' },
    { campo: 'medicoId', etiqueta: 'Veterinario' },
    { campo: 'estado', etiqueta: 'Estado' },
    { campo: 'motivo', etiqueta: 'Motivo' }
  ];

  readonly tamanio = 10;

  // ----- Listado -----
  citas: Cita[] = [];
  pagina = 0;
  totalPaginas = 0;
  totalRegistros = 0;
  campo = 'fechaHora';
  direccion: DireccionOrden = 'desc';
  cargando = false;
  aviso: Aviso | null = null;

  // ----- Catálogos -----
  clientes: ClienteResumen[] = [];
  veterinarios: VeterinarioResumen[] = [];
  mascotasFiltro: MascotaResumen[] = [];
  mascotasFormulario: MascotaResumen[] = [];

  // ----- Formularios -----
  readonly filtrosForm = new FormGroup({
    clienteId: new FormControl('', { nonNullable: true }),
    mascotaId: new FormControl('', { nonNullable: true }),
    medicoId: new FormControl('', { nonNullable: true }),
    estado: new FormControl('', { nonNullable: true }),
    fechaDesde: new FormControl('', { nonNullable: true }),
    fechaHasta: new FormControl('', { nonNullable: true }),
    texto: new FormControl('', { nonNullable: true })
  });

  readonly citaForm = new FormGroup({
    clienteId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    mascotaId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    medicoId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fecha: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    hora: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    motivo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] }),
    estado: new FormControl('Pendiente', { nonNullable: true, validators: [Validators.required] })
  });

  mostrarFormulario = false;
  editando: Cita | null = null;
  guardando = false;
  avisoFormulario: Aviso | null = null;

  /** Cita mostrada en el detalle "Ver"; null si el detalle está cerrado. */
  detalle: Cita | null = null;

  constructor() {
    // Combo dependiente del filtro: al cambiar el cliente se recargan solo sus mascotas.
    this.filtrosForm.controls.clienteId.valueChanges.pipe(takeUntilDestroyed()).subscribe(id => {
      this.filtrosForm.controls.mascotaId.setValue('', { emitEvent: false });
      this.mascotasFiltro = [];
      if (id) {
        this.catalogo.mascotasDeCliente(Number(id)).subscribe({
          next: mascotas => (this.mascotasFiltro = mascotas),
          error: error => this.mostrarAviso(error, 'danger')
        });
      }
    });

    // Combo dependiente del formulario: cliente -> mascotas del cliente.
    this.citaForm.controls.clienteId.valueChanges.pipe(takeUntilDestroyed()).subscribe(id => {
      this.citaForm.controls.mascotaId.setValue('', { emitEvent: false });
      this.mascotasFormulario = [];
      if (id) {
        this.catalogo.mascotasDeCliente(Number(id)).subscribe({
          next: mascotas => (this.mascotasFormulario = mascotas),
          error: error => this.mostrarAvisoFormulario(error)
        });
      }
    });

    this.catalogo.clientes().subscribe({
      next: clientes => (this.clientes = clientes),
      error: error => this.mostrarAviso(error, 'danger')
    });
    this.catalogo.veterinarios().subscribe({
      next: veterinarios => (this.veterinarios = veterinarios),
      error: error => this.mostrarAviso(error, 'danger')
    });

    this.cargar();
  }

  /**
   * Carga la página actual con los filtros y el orden seleccionados.
   */
  cargar(): void {
    this.cargando = true;
    this.citaService.listar(this.filtrosDesdeFormulario(), this.pagina, this.tamanio, this.campo, this.direccion)
      .subscribe({
        next: (respuesta: Pagina<Cita>) => {
          this.citas = respuesta.contenido;
          this.pagina = respuesta.pagina;
          this.totalPaginas = respuesta.totalPaginas;
          this.totalRegistros = respuesta.totalRegistros;
          this.cargando = false;
        },
        error: error => {
          this.cargando = false;
          this.mostrarAviso(error, 'danger');
        }
      });
  }

  /** Aplica los filtros desde la primera página. */
  buscar(): void {
    this.pagina = 0;
    this.cargar();
  }

  /** Limpia los filtros y recarga el listado. */
  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.buscar();
  }

  /**
   * Ordena por una columna. Si ya estaba ordenada, invierte la dirección.
   *
   * @param campo campo del backend por el que se ordena.
   */
  ordenar(campo: string): void {
    if (this.campo === campo) {
      this.direccion = this.direccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.campo = campo;
      this.direccion = 'asc';
    }
    this.pagina = 0;
    this.cargar();
  }

  /**
   * Indicador visual de la columna ordenada.
   *
   * @param campo campo de la columna.
   * @returns flecha de orden o cadena vacía.
   */
  indicador(campo: string): string {
    if (this.campo !== campo) {
      return '';
    }
    return this.direccion === 'asc' ? '▲' : '▼';
  }

  /**
   * @param pagina página solicitada (base 0).
   */
  irAPagina(pagina: number): void {
    this.pagina = pagina;
    this.cargar();
  }

  /** Abre el formulario en modo creación. */
  abrirNueva(): void {
    this.editando = null;
    this.avisoFormulario = null;
    this.citaForm.reset({ clienteId: '', mascotaId: '', medicoId: '', fecha: '', hora: '', motivo: '', estado: 'Pendiente' });
    this.mostrarFormulario = true;
  }

  /**
   * Abre el formulario en modo edición. Las citas atendidas y canceladas no se editan.
   *
   * @param cita cita seleccionada.
   */
  editar(cita: Cita): void {
    if (!this.sePuedeEditar(cita)) {
      return;
    }
    this.editando = cita;
    this.avisoFormulario = null;
    const [fecha, horaCompleta] = cita.fechaHora.split('T');
    // emitEvent:false evita que el combo de mascotas borre la mascota ya asignada.
    this.citaForm.reset({
      clienteId: String(cita.clienteId),
      mascotaId: String(cita.mascotaId),
      medicoId: String(cita.medicoId),
      fecha,
      hora: horaCompleta.slice(0, 5),
      motivo: cita.motivo,
      estado: cita.estado
    }, { emitEvent: false });
    this.catalogo.mascotasDeCliente(cita.clienteId).subscribe({
      next: mascotas => {
        this.mascotasFormulario = mascotas;
        this.citaForm.controls.mascotaId.setValue(String(cita.mascotaId), { emitEvent: false });
      },
      error: error => this.mostrarAvisoFormulario(error)
    });
    this.mostrarFormulario = true;
  }

  /** Cierra el formulario sin guardar. */
  cerrarFormulario(): void {
    this.mostrarFormulario = false;
  }

  /**
   * Valida el formulario y envía la cita al backend (crear o actualizar).
   * Las reglas de negocio las valida el backend; aquí solo se muestran sus mensajes.
   */
  guardar(): void {
    if (this.citaForm.invalid) {
      this.citaForm.markAllAsTouched();
      this.avisoFormulario = { tipo: 'warning', texto: 'Complete los campos obligatorios marcados en rojo.' };
      return;
    }
    const v = this.citaForm.getRawValue();
    const rq: CitaRq = {
      clienteId: Number(v.clienteId),
      mascotaId: Number(v.mascotaId),
      medicoId: Number(v.medicoId),
      fechaHora: `${v.fecha}T${v.hora}:00`,
      motivo: v.motivo.trim(),
      estado: v.estado
    };

    this.guardando = true;
    const peticion = this.editando
      ? this.citaService.actualizar(this.editando.id, rq)
      : this.citaService.crear(rq);

    peticion.subscribe({
      next: respuesta => {
        this.guardando = false;
        this.mostrarFormulario = false;
        this.aviso = { tipo: 'success', texto: respuesta.message };
        this.cargar();
      },
      error: error => {
        this.guardando = false;
        this.mostrarAvisoFormulario(error);
      }
    });
  }

  /**
   * Reactiva una cita cancelada tras confirmación del usuario.
   *
   * @param cita cita cancelada.
   */
  reactivar(cita: Cita): void {
    if (!confirm(`¿Reactivar la cita de ${cita.mascotaNombre ?? 'la mascota'} del ${cita.fechaHora.slice(0, 10)}?`)) {
      return;
    }
    this.citaService.reactivar(cita.id).subscribe({
      next: respuesta => {
        this.aviso = { tipo: 'success', texto: respuesta.message };
        this.cargar();
      },
      error: error => this.mostrarAviso(error, 'danger')
    });
  }

  /**
   * Consulta el detalle completo de la cita desde el backend.
   *
   * @param cita cita de la fila.
   */
  verDetalle(cita: Cita): void {
    this.citaService.consultar(cita.id).subscribe({
      // /consultar devuelve la entidad (objetos anidados, sin nombres); la fila ya trae los nombres resueltos.
      next: detalle => (this.detalle = { ...detalle, ...cita }),
      error: error => this.mostrarAviso(error, 'danger')
    });
  }

  /**
   * @param cita cita a evaluar.
   * @returns true si el estado permite modificar la cita.
   */
  sePuedeEditar(cita: Cita): boolean {
    return cita.estado !== 'Atendida' && cita.estado !== 'Cancelada';
  }

  /**
   * @param estado estado de la cita.
   * @returns clase de Bootstrap para el distintivo de estado.
   */
  claseEstado(estado: string): string {
    const clases: Record<string, string> = {
      Pendiente: 'bg-warning text-dark',
      Confirmada: 'bg-info text-dark',
      Programada: 'bg-primary',
      Atendida: 'bg-success',
      Cancelada: 'bg-secondary'
    };
    return clases[estado] ?? 'bg-light text-dark';
  }

  /**
   * Convierte los controles de filtros en el objeto que espera el servicio.
   *
   * @returns filtros con números donde corresponde y null para los vacíos.
   */
  private filtrosDesdeFormulario(): FiltrosCita {
    const v = this.filtrosForm.getRawValue();
    return {
      clienteId: v.clienteId ? Number(v.clienteId) : null,
      mascotaId: v.mascotaId ? Number(v.mascotaId) : null,
      medicoId: v.medicoId ? Number(v.medicoId) : null,
      estado: v.estado || null,
      fechaDesde: v.fechaDesde || null,
      fechaHasta: v.fechaHasta || null,
      texto: v.texto || null
    };
  }

  /**
   * Muestra un error de petición en el aviso general.
   *
   * @param error  error recibido.
   * @param tipo   tipo de aviso.
   */
  private mostrarAviso(error: unknown, tipo: Aviso['tipo']): void {
    this.aviso = { tipo, texto: mensajeDeError(error) };
  }

  /**
   * Muestra un error dentro del formulario modal.
   *
   * @param error error recibido.
   */
  private mostrarAvisoFormulario(error: unknown): void {
    this.avisoFormulario = { tipo: 'danger', texto: mensajeDeError(error) };
  }
}
