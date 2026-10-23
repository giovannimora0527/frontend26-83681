import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnaTabla, TablaDatosComponent } from 'src/app/components/tabla-datos/tabla-datos.component';
import { Anotacion, AnotacionRq, HistoriaMedica } from 'src/app/models/historia-medica';
import { Medico } from 'src/app/models/medico';
import { NotificacionService } from 'src/app/services/notificacion.service';
import { aLocalDateTime, ahoraLocalInput, formatearFechaHora } from 'src/app/utils/fecha.util';
import { mensajeDeError } from 'src/app/utils/api-error.util';
import { MedicosService } from '../../medicos/service/medicos.service';
import { HistoriaMedicaService } from '../service/historia-medica.service';

/** Vistas internas del modal: listado de anotaciones, formulario de nueva anotación o detalle de una anotación. */
type VistaAnotaciones = 'lista' | 'nueva' | 'detalle';

/**
 * Modal "Ver" de una historia clínica: muestra su detalle completo y el histórico de anotaciones
 * en una tabla (filtros, orden por fecha, paginación y detalle de cada anotación).
 * Permite agregar anotaciones mientras la historia esté abierta y cerrarla.
 */
@Component({
  selector: 'app-historia-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TablaDatosComponent],
  templateUrl: './historia-detalle.component.html'
})
export class HistoriaDetalleComponent implements OnInit {

  /** Historia clínica que se visualiza. */
  @Input({ required: true }) historia!: HistoriaMedica;

  /** Anotaciones de la historia (más reciente primero). */
  anotaciones: Anotacion[] = [];
  /** Anotación cuyo detalle completo se está mostrando. */
  anotacionDetalle?: Anotacion;
  /** Veterinarios para el formulario de nueva anotación. */
  medicos: Medico[] = [];
  /** Vista actual dentro del modal. */
  vista: VistaAnotaciones = 'lista';
  /** Indica si se están consultando las anotaciones. */
  cargando = false;
  /** Mensaje de error mostrado en el formulario de anotación. */
  mensajeError = '';
  /** True si la historia cambió (se cerró), para que la página recargue su listado. */
  huboCambios = false;
  /** Evita doble envío mientras se guarda. */
  guardando = false;
  /** Formulario reactivo de la nueva anotación. */
  form!: FormGroup;

  /** Columnas del histórico de anotaciones (información resumida). */
  columnas: ColumnaTabla[] = [
    { id: 'fecha', etiqueta: 'Fecha y hora', ruta: 'fechaHora', tipo: 'fechaHora' },
    { id: 'veterinario', etiqueta: 'Veterinario', ruta: 'medicoNombre', filtro: 'lista' },
    { id: 'descripcion', etiqueta: 'Descripción', ruta: 'descripcion', filtro: 'texto', formateador: (a: Anotacion) => this.resumir(a.descripcion) },
    { id: 'evolucion', etiqueta: 'Diagnóstico / evolución', ruta: 'diagnosticoEvolucion', formateador: (a: Anotacion) => this.resumir(a.diagnosticoEvolucion) }
  ];

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private historiaService: HistoriaMedicaService,
    private medicosService: MedicosService,
    private notificacion: NotificacionService
  ) { }

  /** Carga el histórico de anotaciones y los veterinarios. */
  ngOnInit(): void {
    this.form = this.fb.group({
      medicoId: [this.historia.medicoId, Validators.required],
      fechaHora: [ahoraLocalInput(), Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      observacion: ['', Validators.maxLength(500)],
      diagnosticoEvolucion: ['', [Validators.required, Validators.maxLength(500)]]
    });
    this.cargarAnotaciones();
    this.medicosService.listar().subscribe({ next: (m) => (this.medicos = m) });
  }

  /** True si se pueden agregar anotaciones (historia abierta). */
  get puedeAnotar(): boolean {
    return this.historia.estado === 'ABIERTA';
  }

  /** Fecha y hora de la consulta con formato legible. */
  get fechaConsulta(): string {
    return formatearFechaHora(this.historia.fechaHora);
  }

  /** Acorta un texto largo para mostrarlo en la tabla (el texto completo está en el detalle). */
  private resumir(texto: string | undefined): string {
    if (!texto) {
      return '';
    }
    return texto.length > 60 ? texto.substring(0, 57) + '...' : texto;
  }

  /** Consulta las anotaciones de la historia en el backend. */
  cargarAnotaciones(): void {
    this.cargando = true;
    this.historiaService.listarAnotaciones(this.historia.id).subscribe({
      next: (a) => { this.anotaciones = a; this.cargando = false; },
      error: (err) => { this.cargando = false; this.notificacion.error(mensajeDeError(err)); }
    });
  }

  /** Cambia al formulario de nueva anotación. */
  nuevaAnotacion(): void {
    this.mensajeError = '';
    this.form.reset({ medicoId: this.historia.medicoId, fechaHora: ahoraLocalInput() });
    this.vista = 'nueva';
  }

  /**
   * Consulta y muestra el detalle completo de una anotación.
   * @param anotacion fila seleccionada en la tabla.
   */
  verDetalle(anotacion: Anotacion): void {
    this.historiaService.consultarAnotacion(anotacion.id).subscribe({
      next: (a) => { this.anotacionDetalle = a; this.vista = 'detalle'; },
      error: (err) => this.notificacion.error(mensajeDeError(err))
    });
  }

  /** Vuelve al listado de anotaciones. */
  volver(): void {
    this.vista = 'lista';
  }

  /**
   * Indica si un control es inválido y ya fue tocado.
   * @param control nombre del control.
   */
  invalido(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  /** Valida y guarda la nueva anotación. */
  guardarAnotacion(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const cuerpo: AnotacionRq = {
      medicoId: v.medicoId,
      fechaHora: aLocalDateTime(v.fechaHora),
      descripcion: v.descripcion.trim(),
      observacion: v.observacion?.trim() || undefined,
      diagnosticoEvolucion: v.diagnosticoEvolucion.trim()
    };
    this.guardando = true;
    this.mensajeError = '';
    this.historiaService.crearAnotacion(this.historia.id, cuerpo).subscribe({
      next: (r) => {
        this.guardando = false;
        this.notificacion.exito(r?.message || 'Anotación registrada correctamente.');
        this.vista = 'lista';
        this.cargarAnotaciones();
      },
      error: (err) => {
        this.guardando = false;
        this.mensajeError = mensajeDeError(err);
      }
    });
  }

  /** Cierra la historia clínica tras pedir confirmación. */
  async cerrarHistoria(): Promise<void> {
    const confirmado = await this.notificacion.confirmar(
      '¿Cerrar la historia clínica?',
      'Una historia cerrada ya no admite nuevas anotaciones.',
      'Sí, cerrar'
    );
    if (!confirmado) {
      return;
    }
    this.historiaService.cerrar(this.historia.id).subscribe({
      next: (r) => {
        this.historia = { ...this.historia, estado: 'CERRADA' };
        this.huboCambios = true;
        this.notificacion.exito(r?.message || 'Historia clínica cerrada.');
      },
      error: (err) => this.notificacion.error(mensajeDeError(err))
    });
  }
}
