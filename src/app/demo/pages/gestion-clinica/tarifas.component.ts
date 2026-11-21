import { confirmarAccion } from 'src/app/utils/confirmar-accion';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { finalize, Subscription } from 'rxjs';
import { ClinicaApi, hoyBogota, Opcion } from './clinica-api.service';

/** Contiene los datos que se consultan o editan de una especialidad. */
interface Especialidad extends Opcion { codigoEspecializacion: string; descripcion: string }
/** Contiene el precio, el impuesto y la vigencia de un servicio. */
interface Tarifa {
  id?: number; nombreServicio: string; especializacionId: number | null; valorBase: number;
  ivaPorcentaje: number; activo: boolean; fechaVigencia: string;
}
/** Describe una modificación del historial de tarifas. */
interface Cambio { id: number; campo: string; valorAnterior: string; valorNuevo: string; usuarioId: number; fechaCambio: string }

/** Administra especialidades, precios e impuestos aplicables a los servicios. */
@Component({ imports: [CommonModule, FormsModule], templateUrl: './tarifas.component.html' })
export class TarifasComponent implements OnInit {
  private readonly api = inject(ClinicaApi);
  private readonly destroyRef = inject(DestroyRef);
  private consultaIva?: Subscription;
  private vigenciaOriginal: string | null = null;
  especialidades: Especialidad[] = [];
  tarifas: Tarifa[] = [];
  medicamentos: Opcion[] = [];
  especialidad: Partial<Especialidad> = this.nuevaEspecialidad();
  tarifa: Tarifa = this.nuevaTarifa();
  impuesto = { id: null as number | null, ivaPorcentaje: null as number | null };
  ivaVigente: number | null = null;
  ivaConsultado = false;
  cargandoIva = false;
  filtro: number | null = null;
  cambios: Cambio[] | null = null;
  tarifaHistorial = '';
  error = '';
  ocupado = false;
  private readonly fallo = this.api.error((mensaje) => this.error = mensaje);

  /** Prepara la pantalla al abrirse y carga los datos que necesita. */
  ngOnInit() {
    this.cargarEspecialidades();
    this.cargarTarifas();
    this.api.leer<Opcion[]>('medicamento/listar').subscribe({ next: (datos) => this.medicamentos = datos, error: this.fallo });
  }

  /** Prepara los valores iniciales para registrar una especialidad. */
  nuevaEspecialidad(): Partial<Especialidad> {
    return { nombre: '', descripcion: '', codigoEspecializacion: '', activo: true };
  }

  /** Prepara los valores iniciales para registrar una tarifa. */
  nuevaTarifa(): Tarifa {
    return { nombreServicio: '', especializacionId: null, valorBase: 0, ivaPorcentaje: 0,
      activo: true, fechaVigencia: hoyBogota() };
  }

  /** Prepara la edición de la especialidad. */
  editarEspecialidad(item: Especialidad) {
    this.especialidad = { ...item };
  }

  /** Prepara la edición de la tarifa. */
  editarTarifa(item: Tarifa) {
    this.tarifa = { ...item };
    this.vigenciaOriginal = item.fechaVigencia;
  }

  /** Devuelve el primer día permitido para programar la vigencia. */
  get fechaMinimaVigencia(): string {
    return hoyBogota();
  }

  /** Detecta una vigencia retroactiva nueva o modificada. */
  get vigenciaAnterior(): boolean {
    const fecha = this.tarifa.fechaVigencia;
    return !!fecha && fecha < this.fechaMinimaVigencia && (!this.tarifa.id || fecha !== this.vigenciaOriginal);
  }

  /** Carga las especialidades. */
  private cargarEspecialidades() {
    this.api.leer<Especialidad[]>('especializacion/listar').subscribe({ next: (datos) => this.especialidades = datos, error: this.fallo });
  }

  /** Carga las tarifas. */
  cargarTarifas() {
    this.api.leer<Tarifa[]>('tarifa', this.filtro ? { especializacionId: this.filtro } : {}).subscribe({
      next: (datos) => this.tarifas = datos, error: this.fallo
    });
  }

  /** Guarda la especialidad. */
  guardarEspecialidad() {
    const data = { ...this.especialidad, nombre: this.especialidad.nombre?.trim(),
      codigoEspecializacion: this.especialidad.codigoEspecializacion?.trim(),
      descripcion: this.especialidad.descripcion?.trim() };
    if (!data.nombre || !data.codigoEspecializacion || !data.descripcion) {
      this.error = 'Completa nombre, código y descripción de la especialidad.';
      return;
    }
    this.guardar(data.id ? 'PUT' : 'POST', 'especializacion/' + (data.id ? 'actualizar' : 'crear'), data, data.id ? 'La especialidad se actualizó.' : 'La especialidad se creó.', () => {
      this.especialidad = this.nuevaEspecialidad();
      this.cargarEspecialidades();
    });
  }

  /** Guarda la tarifa. */
  guardarTarifa() {
    const data = { ...this.tarifa, nombreServicio: this.tarifa.nombreServicio.trim() };
    if (!data.nombreServicio || !data.fechaVigencia) return;
    if (this.vigenciaAnterior) {
      this.error = 'La nueva vigencia debe ser de hoy o posterior.';
      return;
    }
    if (data.especializacionId === null && data.nombreServicio !== 'Consulta general') {
      this.error = 'La tarifa sin especialidad debe llamarse Consulta general.';
      return;
    }
    this.guardar(data.id ? 'PUT' : 'POST', 'tarifa' + (data.id ? '/' + data.id : ''), data, data.id ? 'La tarifa se actualizó.' : 'La tarifa se creó.', () => {
      this.tarifa = this.nuevaTarifa();
      this.cargarTarifas();
    });
  }

  /** Consulta el IVA vigente del medicamento seleccionado. */
  consultarIva(id: number | null) {
    this.consultaIva?.unsubscribe();
    this.impuesto = { id, ivaPorcentaje: null };
    this.ivaVigente = null;
    this.ivaConsultado = false;
    this.error = '';
    if (id === null) return;
    this.cargandoIva = true;
    this.consultaIva = this.api.leer<{ ivaPorcentaje: number | null }>('tarifa/impuestos-medicamento/' + id)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.cargandoIva = false))
      .subscribe({
        next: ({ ivaPorcentaje }) => {
          this.ivaVigente = ivaPorcentaje ?? null;
          this.impuesto.ivaPorcentaje = this.ivaVigente;
          this.ivaConsultado = true;
        },
        error: this.fallo
      });
  }

  /** Guarda el porcentaje de IVA del medicamento seleccionado. */
  guardarIva() {
    const { id, ivaPorcentaje } = this.impuesto;
    if (!id || !this.ivaConsultado || ivaPorcentaje === null) return;
    this.guardar('PUT', 'tarifa/impuestos-medicamento/' + id, { ivaPorcentaje }, 'El IVA del medicamento se actualizó.', () => {
      this.ivaVigente = ivaPorcentaje;
      this.impuesto.ivaPorcentaje = ivaPorcentaje;
    });
  }

  /** Consulta los cambios registrados para la tarifa seleccionada. */
  historial(tarifa: Tarifa) {
    this.cambios = null;
    this.tarifaHistorial = '';
    this.api.leer<Cambio[]>(`tarifa/${tarifa.id}/historial`).subscribe({
      next: (datos) => { this.cambios = datos; this.tarifaHistorial = tarifa.nombreServicio; }, error: this.fallo
    });
  }

  /** Envía el cambio y actualiza la vista cuando el servidor confirma la operación. */
  private guardar(metodo: 'PUT' | 'POST', ruta: string, data: unknown, mensaje: string, completar: () => void) {
    if (this.ocupado) return;
    this.error = '';
    this.ocupado = true;
    this.api.enviar(metodo, ruta, data).pipe(finalize(() => this.ocupado = false)).subscribe({
      next: () => { completar(); confirmarAccion(mensaje); }, error: this.fallo
    });
  }
}
