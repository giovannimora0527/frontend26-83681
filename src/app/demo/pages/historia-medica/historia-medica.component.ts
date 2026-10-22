import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertaComponent } from 'src/app/components/alerta/alerta.component';
import { AnotacionesPanelComponent } from 'src/app/components/anotaciones-panel/anotaciones-panel.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { PaginadorComponent } from 'src/app/components/paginador/paginador.component';
import { ClienteResumen, MascotaResumen, VeterinarioResumen, nombreCompleto } from 'src/app/models/catalogos';
import { Cita } from 'src/app/models/cita';
import { DireccionOrden, Pagina } from 'src/app/models/pagina';
import { FiltrosHistoria, HistoriaMedica, HistoriaMedicaRq } from 'src/app/models/historia-medica';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { mensajeDeError } from 'src/app/services/api.util';
import { CitaService } from 'src/app/demo/pages/cita/service/cita.service';
import { HistoriaMedicaService } from './service/historia-medica.service';

/** Mensaje mostrado en pantalla. */
interface Aviso {
  tipo: 'success' | 'danger' | 'warning' | 'info';
  texto: string;
}

/**
 * Historias clínicas. El listado es un resumen; "Ver" muestra el detalle y, debajo, el histórico de
 * anotaciones de esa historia. La historia se crea a partir de una cita ya atendida.
 */
@Component({
  selector: 'app-historia-medica',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertaComponent, ModalComponent, PaginadorComponent, AnotacionesPanelComponent],
  templateUrl: './historia-medica.component.html'
})
export class HistoriaMedicaComponent {
  private readonly historiaService = inject(HistoriaMedicaService);
  private readonly citaService = inject(CitaService);
  private readonly catalogo = inject(CatalogoService);

  /** Función expuesta a la plantilla para mostrar nombres completos. */
  readonly nombreCompleto = nombreCompleto;

  /** Columnas ordenables del listado (campo del backend y etiqueta). */
  readonly columnas: { campo: string; etiqueta: string }[] = [
    { campo: 'fechaHora', etiqueta: 'Fecha de consulta' },
    { campo: 'fechaCreacion', etiqueta: 'Fecha de registro' }
  ];

  readonly tamanio = 10;

  // ----- Listado -----
  historias: HistoriaMedica[] = [];
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
  /** Solo citas atendidas: una historia nace de una consulta realizada. */
  citasFormulario: Cita[] = [];

  /** Cita elegida en el formulario, para mostrar sus datos de solo lectura. */
  citaSeleccionada: Cita | null = null;

  // ----- Filtros -----
  readonly filtrosForm = new FormGroup({
    clienteId: new FormControl('', { nonNullable: true }),
    mascotaId: new FormControl('', { nonNullable: true }),
    medicoId: new FormControl('', { nonNullable: true }),
    texto: new FormControl('', { nonNullable: true }),
    fechaDesde: new FormControl('', { nonNullable: true }),
    fechaHasta: new FormControl('', { nonNullable: true })
  });

  // ----- Formulario -----
  readonly historiaForm = new FormGroup({
    clienteId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    mascotaId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    citaId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    diagnostico: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(2000)] }),
    observaciones: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(2000)] })
  });

  mostrarFormulario = false;
  guardando = false;
  avisoFormulario: Aviso | null = null;

  /** Historia mostrada en el modal "Ver"; null si está cerrado. */
  detalle: HistoriaMedica | null = null;

  constructor() {
    this.catalogo.clientes().subscribe({
      next: clientes => (this.clientes = clientes),
      error: error => this.mostrarAviso(error, 'danger')
    });
    this.catalogo.veterinarios().subscribe({
      next: veterinarios => (this.veterinarios = veterinarios),
      error: error => this.mostrarAviso(error, 'danger')
    });

    // Filtros: cliente -> mascotas del cliente.
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

    // Formulario: cliente -> mascotas del cliente.
    this.historiaForm.controls.clienteId.valueChanges.pipe(takeUntilDestroyed()).subscribe(id => {
      this.historiaForm.controls.mascotaId.setValue('', { emitEvent: false });
      this.historiaForm.controls.citaId.setValue('', { emitEvent: false });
      this.mascotasFormulario = [];
      this.citasFormulario = [];
      this.citaSeleccionada = null;
      if (id) {
        this.catalogo.mascotasDeCliente(Number(id)).subscribe({
          next: mascotas => (this.mascotasFormulario = mascotas),
          error: error => this.mostrarAvisoFormulario(error)
        });
      }
    });

    // Formulario: mascota -> citas atendidas de la mascota.
    this.historiaForm.controls.mascotaId.valueChanges.pipe(takeUntilDestroyed()).subscribe(id => {
      this.historiaForm.controls.citaId.setValue('', { emitEvent: false });
      this.citasFormulario = [];
      this.citaSeleccionada = null;
      if (id) {
        this.cargarCitasAtendidas(Number(id));
      }
    });

    // Formulario: cita -> datos de solo lectura (motivo, fecha, veterinario).
    this.historiaForm.controls.citaId.valueChanges.pipe(takeUntilDestroyed()).subscribe(id => {
      this.citaSeleccionada = this.citasFormulario.find(c => String(c.id) === id) ?? null;
    });

    this.cargar();
  }

  /** Carga la página actual del listado con filtros y orden del servidor. */
  cargar(): void {
    this.cargando = true;
    this.historiaService.listar(this.filtrosDesdeFormulario(), this.pagina, this.tamanio, this.campo, this.direccion)
      .subscribe({
        next: (respuesta: Pagina<HistoriaMedica>) => {
          this.historias = respuesta.contenido;
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

  /** Aplica filtros desde la primera página. */
  buscar(): void {
    this.pagina = 0;
    this.cargar();
  }

  /** Limpia filtros y recarga. */
  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.buscar();
  }

  /**
   * Ordena por columna; si ya estaba ordenada invierte la dirección.
   *
   * @param campo campo del backend.
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

  /** Abre el formulario de nueva historia. */
  abrirNueva(): void {
    this.avisoFormulario = null;
    this.citaSeleccionada = null;
    this.historiaForm.reset();
    this.mostrarFormulario = true;
  }

  /** Cierra el formulario sin guardar. */
  cerrarFormulario(): void {
    this.mostrarFormulario = false;
  }

  /** Valida y registra la historia a partir de la cita atendida. */
  guardar(): void {
    if (this.historiaForm.invalid) {
      this.historiaForm.markAllAsTouched();
      this.avisoFormulario = { tipo: 'warning', texto: 'Complete los campos obligatorios marcados en rojo.' };
      return;
    }
    const v = this.historiaForm.getRawValue();
    const cita = this.citaSeleccionada;
    if (!cita) {
      this.avisoFormulario = { tipo: 'warning', texto: 'Seleccione una cita atendida.' };
      return;
    }
    const rq: HistoriaMedicaRq = {
      clienteId: cita.clienteId,
      mascotaId: cita.mascotaId,
      citaId: cita.id,
      medicoId: cita.medicoId,
      fechaHora: cita.fechaHora,
      motivo: cita.motivo,
      diagnostico: v.diagnostico.trim(),
      observaciones: v.observaciones.trim() || null
    };

    this.guardando = true;
    this.historiaService.crear(rq).subscribe({
      next: respuesta => {
        this.guardando = false;
        this.cerrarFormulario();
        this.aviso = { tipo: 'success', texto: respuesta.message };
        this.pagina = 0;
        this.cargar();
      },
      error: error => {
        this.guardando = false;
        this.mostrarAvisoFormulario(error);
      }
    });
  }

  /**
   * Consulta el detalle de la historia; el modal mostrará además su histórico de anotaciones.
   *
   * @param historia fila seleccionada.
   */
  verDetalle(historia: HistoriaMedica): void {
    this.historiaService.consultar(historia.id).subscribe({
      // /consultar devuelve la entidad (objetos anidados, sin nombres); la fila ya trae los nombres resueltos.
      next: detalle => (this.detalle = { ...detalle, ...historia }),
      error: error => this.mostrarAviso(error, 'danger')
    });
  }

  /**
   * Texto legible de una cita para el combo.
   *
   * @param cita cita atendida.
   * @returns "dd/mm/aaaa hh:mm — motivo".
   */
  textoCita(cita: Cita): string {
    const [fecha, hora] = cita.fechaHora.split('T');
    return `${fecha} ${hora.slice(0, 5)} — ${cita.motivo}`;
  }

  /**
   * @param cliente cliente del combo.
   * @returns nombre y documento para distinguir homónimos.
   */
  textoCliente(cliente: ClienteResumen): string {
    return `${nombreCompleto(cliente)} (${cliente.numeroDocumento ?? ''})`;
  }

  /**
   * Carga las citas atendidas de una mascota para el combo del formulario.
   *
   * @param mascotaId mascota seleccionada.
   */
  private cargarCitasAtendidas(mascotaId: number): void {
    this.citaService.listar({ mascotaId, estado: 'Atendida' }, 0, 100, 'fechaHora', 'desc').subscribe({
      next: respuesta => (this.citasFormulario = respuesta.contenido),
      error: error => this.mostrarAvisoFormulario(error)
    });
  }

  /**
   * @returns filtros en el formato del servicio.
   */
  private filtrosDesdeFormulario(): FiltrosHistoria {
    const v = this.filtrosForm.getRawValue();
    return {
      clienteId: v.clienteId ? Number(v.clienteId) : null,
      mascotaId: v.mascotaId ? Number(v.mascotaId) : null,
      medicoId: v.medicoId ? Number(v.medicoId) : null,
      texto: v.texto || null,
      fechaDesde: v.fechaDesde || null,
      fechaHasta: v.fechaHasta || null
    };
  }

  /**
   * @param error error recibido.
   * @param tipo  tipo de aviso.
   */
  private mostrarAviso(error: unknown, tipo: Aviso['tipo']): void {
    this.aviso = { tipo, texto: mensajeDeError(error) };
  }

  /**
   * @param error error recibido dentro del formulario.
   */
  private mostrarAvisoFormulario(error: unknown): void {
    this.avisoFormulario = { tipo: 'danger', texto: mensajeDeError(error) };
  }
}
