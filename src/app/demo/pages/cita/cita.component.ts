import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TablaDatosComponent, ColumnaTabla } from 'src/app/components/tabla-datos/tabla-datos.component';
import { Cita } from 'src/app/models/cita';
import { NotificacionService } from 'src/app/services/notificacion.service';
import { mensajeDeError } from 'src/app/utils/api-error.util';
import { CitaService } from './service/cita.service';
import { CitaFormComponent } from './cita-form/cita-form.component';

/**
 * Módulo de gestión de citas médicas: listado (DataTable) ordenado por fecha y hora descendente,
 * creación, edición según estado y reactivación de citas canceladas.
 */
@Component({
  selector: 'app-cita',
  standalone: true,
  imports: [CommonModule, TablaDatosComponent],
  templateUrl: './cita.component.html',
  styleUrl: './cita.component.scss'
})
export class CitaComponent implements OnInit {

  /** Citas mostradas en la tabla. */
  citas: Cita[] = [];
  /** Indica si se está consultando el backend. */
  cargando = false;

  /** Columnas de la tabla (fecha y hora salen de la misma fecha-hora de la cita). */
  columnas: ColumnaTabla[] = [
    { id: 'fecha', etiqueta: 'Fecha', ruta: 'fechaHora', tipo: 'fecha' },
    { id: 'hora', etiqueta: 'Hora', ruta: 'fechaHora', tipo: 'hora', ordenable: false },
    { id: 'cliente', etiqueta: 'Cliente', ruta: 'clienteNombre', filtro: 'texto' },
    { id: 'mascota', etiqueta: 'Mascota', ruta: 'mascotaNombre', filtro: 'texto' },
    { id: 'veterinario', etiqueta: 'Veterinario', ruta: 'medicoNombre', filtro: 'lista' },
    { id: 'estado', etiqueta: 'Estado', ruta: 'estado', tipo: 'insignia', filtro: 'lista' }
  ];

  constructor(
    private citaService: CitaService,
    private modalService: NgbModal,
    private notificacion: NotificacionService
  ) { }

  /** Carga las citas al abrir la página. */
  ngOnInit(): void {
    this.cargar();
  }

  /** Consulta las citas en el backend. */
  cargar(): void {
    this.cargando = true;
    this.citaService.listar().subscribe({
      next: (data) => { this.citas = data; this.cargando = false; },
      error: (err) => { this.cargando = false; this.notificacion.error(mensajeDeError(err)); }
    });
  }

  /**
   * Abre el formulario (modal) de cita; recarga la tabla si se guardó algo.
   * @param cita cita a editar; si se omite, se crea una nueva.
   */
  abrirFormulario(cita?: Cita): void {
    const ref = this.modalService.open(CitaFormComponent, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.cita = cita;
    ref.result.then((guardado) => { if (guardado) { this.cargar(); } }, () => undefined);
  }

  /**
   * Reactiva una cita cancelada tras pedir confirmación (operación explícita).
   * @param cita cita cancelada.
   */
  async reactivar(cita: Cita): Promise<void> {
    const confirmado = await this.notificacion.confirmar(
      '¿Reactivar la cita?',
      'La cita volverá al estado Pendiente. El sistema validará que el horario siga disponible.',
      'Sí, reactivar'
    );
    if (!confirmado) {
      return;
    }
    this.citaService.reactivar(cita.id).subscribe({
      next: (r) => { this.notificacion.exito(r?.message || 'Cita reactivada correctamente.'); this.cargar(); },
      error: (err) => this.notificacion.error(mensajeDeError(err))
    });
  }
}
