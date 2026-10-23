import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TablaDatosComponent, ColumnaTabla } from 'src/app/components/tabla-datos/tabla-datos.component';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { NotificacionService } from 'src/app/services/notificacion.service';
import { mensajeDeError } from 'src/app/utils/api-error.util';
import { HistoriaMedicaService } from './service/historia-medica.service';
import { HistoriaFormComponent } from './historia-form/historia-form.component';
import { HistoriaDetalleComponent } from './historia-detalle/historia-detalle.component';

/**
 * Módulo de historias clínicas: listado (DataTable) ordenado por fecha y hora de la consulta
 * descendente, creación de historias y visualización del detalle con su histórico de anotaciones.
 */
@Component({
  selector: 'app-historia-medica',
  standalone: true,
  imports: [CommonModule, TablaDatosComponent],
  templateUrl: './historia-medica.component.html',
  styleUrl: './historia-medica.component.scss'
})
export class HistoriaMedicaComponent implements OnInit {

  /** Historias mostradas en la tabla. */
  historias: HistoriaMedica[] = [];
  /** Indica si se está consultando el backend. */
  cargando = false;

  /** Columnas de la tabla (información resumida). */
  columnas: ColumnaTabla[] = [
    { id: 'fecha', etiqueta: 'Fecha', ruta: 'fechaHora', tipo: 'fechaHora' },
    { id: 'mascota', etiqueta: 'Mascota', ruta: 'mascotaNombre', filtro: 'texto' },
    { id: 'cliente', etiqueta: 'Cliente', ruta: 'clienteNombre', filtro: 'texto' },
    { id: 'veterinario', etiqueta: 'Veterinario', ruta: 'medicoNombre', filtro: 'lista' },
    { id: 'motivo', etiqueta: 'Motivo de consulta', ruta: 'motivoConsulta' },
    { id: 'estado', etiqueta: 'Estado', ruta: 'estado', tipo: 'insignia', filtro: 'lista' }
  ];

  constructor(
    private historiaService: HistoriaMedicaService,
    private modalService: NgbModal,
    private notificacion: NotificacionService
  ) { }

  /** Carga las historias al abrir la página. */
  ngOnInit(): void {
    this.cargar();
  }

  /** Consulta las historias clínicas en el backend. */
  cargar(): void {
    this.cargando = true;
    this.historiaService.listar().subscribe({
      next: (data) => { this.historias = data; this.cargando = false; },
      error: (err) => { this.cargando = false; this.notificacion.error(mensajeDeError(err)); }
    });
  }

  /** Abre el formulario para registrar una nueva historia clínica. */
  nueva(): void {
    const ref = this.modalService.open(HistoriaFormComponent, { size: 'lg', backdrop: 'static' });
    ref.result.then((guardado) => { if (guardado) { this.cargar(); } }, () => undefined);
  }

  /**
   * Abre el detalle de una historia con su histórico de anotaciones.
   * @param historia historia seleccionada.
   */
  ver(historia: HistoriaMedica): void {
    const ref = this.modalService.open(HistoriaDetalleComponent, { size: 'xl', scrollable: true });
    ref.componentInstance.historia = historia;
    ref.result.then(() => this.cargar(), () => this.cargar());
  }
}
