import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertaComponent } from 'src/app/components/alerta/alerta.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { PaginadorComponent } from 'src/app/components/paginador/paginador.component';
import { AnotacionHistoria, AnotacionHistoriaRq, FiltrosAnotacion } from 'src/app/models/anotacion-historia';
import { VeterinarioResumen, nombreCompleto } from 'src/app/models/catalogos';
import { DireccionOrden, Pagina } from 'src/app/models/pagina';
import { AnotacionHistoriaService } from 'src/app/demo/pages/anotacion-historia/service/anotacion-historia.service';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { mensajeDeError } from 'src/app/services/api.util';

/** Mensaje mostrado en pantalla. */
interface Aviso {
  tipo: 'success' | 'danger' | 'warning' | 'info';
  texto: string;
}

/**
 * Histórico de anotaciones de UNA historia clínica: DataTable con filtros, orden, paginación,
 * detalle "Ver" y formulario para agregar anotaciones. Se reutiliza en la página de anotaciones
 * y dentro del detalle de cada historia.
 */
@Component({
  selector: 'app-anotaciones-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertaComponent, ModalComponent, PaginadorComponent],
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
      <h6 class="mb-0">Histórico de anotaciones</h6>
      <button class="btn btn-primary btn-sm" type="button" (click)="abrirNueva()">Nueva anotación</button>
    </div>

    <app-alerta [mensaje]="aviso?.texto ?? null" [tipo]="aviso?.tipo ?? 'info'" />

    <form [formGroup]="filtrosForm" (ngSubmit)="buscar()" class="row g-2 mb-2">
      <div class="col-12 col-md-4">
        <input type="text" class="form-control form-control-sm" formControlName="texto"
               placeholder="Buscar en la descripción" aria-label="Buscar en la descripción" />
      </div>
      <div class="col-6 col-md-3">
        <input type="date" class="form-control form-control-sm" formControlName="fechaDesde" aria-label="Desde" />
      </div>
      <div class="col-6 col-md-3">
        <input type="date" class="form-control form-control-sm" formControlName="fechaHasta" aria-label="Hasta" />
      </div>
      <div class="col-12 col-md-2 d-flex gap-1">
        <button class="btn btn-outline-primary btn-sm flex-fill" type="submit">Filtrar</button>
        <button class="btn btn-outline-secondary btn-sm" type="button" (click)="limpiar()">Limpiar</button>
      </div>
    </form>

    <div class="table-responsive">
      <table class="table table-sm table-striped align-middle mb-0">
        <thead>
          <tr>
            <th scope="col">
              <button type="button" class="btn btn-link p-0 text-reset fw-semibold text-decoration-none" (click)="alternarOrden()">
                Fecha y hora {{ direccion === 'desc' ? '▼' : '▲' }}
              </button>
            </th>
            <th scope="col">Veterinario</th>
            <th scope="col">Descripción</th>
            <th scope="col">Diagnóstico o evolución</th>
            <th scope="col" class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          @if (cargando) {
            <tr><td colspan="5" class="text-center text-muted py-3">Cargando anotaciones...</td></tr>
          }
          @for (a of anotaciones; track a.id) {
            <tr>
              <td class="text-nowrap">{{ a.fechaHora | date: 'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ a.medicoNombre }}</td>
              <td class="text-truncate" style="max-width: 240px;" [title]="a.descripcion">{{ a.descripcion }}</td>
              <td class="text-truncate" style="max-width: 200px;" [title]="a.diagnosticoEvolucion">{{ a.diagnosticoEvolucion }}</td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-info" type="button" (click)="verDetalle(a)">Ver</button>
              </td>
            </tr>
          } @empty {
            @if (!cargando) {
              <tr><td colspan="5" class="text-center text-muted py-3">Esta historia aún no tiene anotaciones.</td></tr>
            }
          }
        </tbody>
      </table>
    </div>

    <div class="mt-2">
      <app-paginador [pagina]="pagina" [totalPaginas]="totalPaginas" (cambiarPagina)="irAPagina($event)" />
    </div>

    <!-- Nueva anotación -->
    <app-modal [visible]="mostrarFormulario" titulo="Nueva anotación de historia" (cerrar)="mostrarFormulario = false">
      <app-alerta [mensaje]="avisoFormulario?.texto ?? null" [tipo]="avisoFormulario?.tipo ?? 'info'" />
      <form [formGroup]="anotacionForm" (ngSubmit)="guardar()" novalidate>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label" for="an-medico">Veterinario *</label>
            <select id="an-medico" class="form-select" formControlName="medicoId"
                    [class.is-invalid]="anotacionForm.controls.medicoId.touched && anotacionForm.controls.medicoId.invalid">
              <option value="" disabled>Seleccione un veterinario</option>
              @for (v of veterinarios; track v.id) {
                <option [value]="v.id">{{ nombreCompleto(v) }}</option>
              }
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label" for="an-fecha">Fecha y hora</label>
            <input id="an-fecha" type="datetime-local" class="form-control" formControlName="fechaHora" />
            <div class="form-text">Si se deja vacío se usa la fecha y hora actual.</div>
          </div>
          <div class="col-12">
            <label class="form-label" for="an-descripcion">Descripción *</label>
            <textarea id="an-descripcion" class="form-control" rows="2" formControlName="descripcion" maxlength="2000"
                      [class.is-invalid]="anotacionForm.controls.descripcion.touched && anotacionForm.controls.descripcion.invalid"></textarea>
          </div>
          <div class="col-12">
            <label class="form-label" for="an-observacion">Observación *</label>
            <textarea id="an-observacion" class="form-control" rows="2" formControlName="observacion" maxlength="2000"
                      [class.is-invalid]="anotacionForm.controls.observacion.touched && anotacionForm.controls.observacion.invalid"></textarea>
          </div>
          <div class="col-12">
            <label class="form-label" for="an-diagnostico">Diagnóstico o evolución *</label>
            <textarea id="an-diagnostico" class="form-control" rows="2" formControlName="diagnosticoEvolucion" maxlength="2000"
                      [class.is-invalid]="anotacionForm.controls.diagnosticoEvolucion.touched && anotacionForm.controls.diagnosticoEvolucion.invalid"></textarea>
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2 mt-3">
          <button class="btn btn-outline-secondary" type="button" (click)="mostrarFormulario = false">Cancelar</button>
          <button class="btn btn-primary" type="submit" [disabled]="guardando">{{ guardando ? 'Guardando...' : 'Guardar anotación' }}</button>
        </div>
      </form>
    </app-modal>

    <!-- Detalle de una anotación -->
    <app-modal [visible]="detalle !== null" titulo="Detalle de la anotación" (cerrar)="detalle = null">
      @if (detalle) {
        <dl class="row mb-0">
          <dt class="col-sm-4">Fecha y hora</dt><dd class="col-sm-8">{{ detalle.fechaHora | date: 'dd/MM/yyyy HH:mm' }}</dd>
          <dt class="col-sm-4">Veterinario</dt><dd class="col-sm-8">{{ detalle.medicoNombre }}</dd>
          <dt class="col-sm-4">Descripción</dt><dd class="col-sm-8">{{ detalle.descripcion }}</dd>
          <dt class="col-sm-4">Observación</dt><dd class="col-sm-8">{{ detalle.observacion }}</dd>
          <dt class="col-sm-4">Diagnóstico o evolución</dt><dd class="col-sm-8">{{ detalle.diagnosticoEvolucion }}</dd>
        </dl>
      }
    </app-modal>
  `
})
export class AnotacionesPanelComponent {
  private readonly anotacionService = inject(AnotacionHistoriaService);
  private readonly catalogo = inject(CatalogoService);

  /** Historia clínica cuyo histórico se muestra. */
  historiaId = input.required<number>();

  /** Función expuesta a la plantilla para mostrar nombres completos. */
  readonly nombreCompleto = nombreCompleto;

  readonly tamanio = 5;
  anotaciones: AnotacionHistoria[] = [];
  pagina = 0;
  totalPaginas = 0;
  totalRegistros = 0;
  direccion: DireccionOrden = 'desc';
  cargando = false;
  aviso: Aviso | null = null;
  veterinarios: VeterinarioResumen[] = [];

  readonly filtrosForm = new FormGroup({
    texto: new FormControl('', { nonNullable: true }),
    fechaDesde: new FormControl('', { nonNullable: true }),
    fechaHasta: new FormControl('', { nonNullable: true })
  });

  readonly anotacionForm = new FormGroup({
    medicoId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fechaHora: new FormControl('', { nonNullable: true }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(2000)] }),
    observacion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(2000)] }),
    diagnosticoEvolucion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(2000)] })
  });

  mostrarFormulario = false;
  guardando = false;
  avisoFormulario: Aviso | null = null;
  detalle: AnotacionHistoria | null = null;

  constructor() {
    this.catalogo.veterinarios().subscribe({
      next: veterinarios => (this.veterinarios = veterinarios),
      error: error => (this.aviso = { tipo: 'danger', texto: mensajeDeError(error) })
    });

    // Cada vez que cambia la historia se reinicia el histórico desde la primera página.
    effect(() => {
      const id = this.historiaId();
      untracked(() => {
        this.pagina = 0;
        this.cargar();
      });
    });
  }

  /** Carga la página actual del histórico. */
  cargar(): void {
    this.cargando = true;
    const filtros: FiltrosAnotacion = {
      historiaId: this.historiaId(),
      texto: this.filtrosForm.controls.texto.value || null,
      fechaDesde: this.filtrosForm.controls.fechaDesde.value || null,
      fechaHasta: this.filtrosForm.controls.fechaHasta.value || null
    };
    this.anotacionService.listar(filtros, this.pagina, this.tamanio, this.direccion).subscribe({
      next: (respuesta: Pagina<AnotacionHistoria>) => {
        this.anotaciones = respuesta.contenido;
        this.pagina = respuesta.pagina;
        this.totalPaginas = respuesta.totalPaginas;
        this.totalRegistros = respuesta.totalRegistros;
        this.cargando = false;
      },
      error: error => {
        this.cargando = false;
        this.aviso = { tipo: 'danger', texto: mensajeDeError(error) };
      }
    });
  }

  /** Aplica los filtros desde la primera página. */
  buscar(): void {
    this.pagina = 0;
    this.cargar();
  }

  /** Limpia los filtros y recarga. */
  limpiar(): void {
    this.filtrosForm.reset();
    this.buscar();
  }

  /** Invierte el orden por fecha (por defecto, la más reciente primero). */
  alternarOrden(): void {
    this.direccion = this.direccion === 'desc' ? 'asc' : 'desc';
    this.pagina = 0;
    this.cargar();
  }

  /**
   * @param pagina página solicitada (base 0).
   */
  irAPagina(pagina: number): void {
    this.pagina = pagina;
    this.cargar();
  }

  /** Abre el formulario de nueva anotación. */
  abrirNueva(): void {
    this.avisoFormulario = null;
    this.anotacionForm.reset();
    this.mostrarFormulario = true;
  }

  /** Valida y registra la anotación en la historia actual. */
  guardar(): void {
    if (this.anotacionForm.invalid) {
      this.anotacionForm.markAllAsTouched();
      this.avisoFormulario = { tipo: 'warning', texto: 'Complete los campos obligatorios marcados en rojo.' };
      return;
    }
    const v = this.anotacionForm.getRawValue();
    const rq: AnotacionHistoriaRq = {
      historiaId: this.historiaId(),
      medicoId: Number(v.medicoId),
      fechaHora: v.fechaHora ? `${v.fechaHora}:00` : null,
      descripcion: v.descripcion.trim(),
      observacion: v.observacion.trim(),
      diagnosticoEvolucion: v.diagnosticoEvolucion.trim()
    };

    this.guardando = true;
    this.anotacionService.crear(rq).subscribe({
      next: respuesta => {
        this.guardando = false;
        this.mostrarFormulario = false;
        this.aviso = { tipo: 'success', texto: respuesta.message };
        this.pagina = 0;
        this.cargar();
      },
      error: error => {
        this.guardando = false;
        this.avisoFormulario = { tipo: 'danger', texto: mensajeDeError(error) };
      }
    });
  }

  /**
   * Consulta el detalle de la anotación.
   *
   * @param anotacion fila seleccionada.
   */
  verDetalle(anotacion: AnotacionHistoria): void {
    this.anotacionService.consultar(anotacion.id).subscribe({
      next: detalle => (this.detalle = detalle),
      error: error => (this.aviso = { tipo: 'danger', texto: mensajeDeError(error) })
    });
  }
}
