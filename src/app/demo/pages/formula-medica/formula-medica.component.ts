import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TablaDatosComponent, ColumnaTabla } from 'src/app/components/tabla-datos/tabla-datos.component';
import { FormulaResumen } from 'src/app/models/formula-medica';
import { NotificacionService } from 'src/app/services/notificacion.service';
import { mensajeDeError } from 'src/app/utils/api-error.util';
import { FormulaMedicaService } from './service/formula-medica.service';
import { FormulaFormComponent } from './formula-form/formula-form.component';
import { FormulaDetalleComponent } from './formula-detalle/formula-detalle.component';

/**
 * Módulo de fórmulas médicas: listado (DataTable) con información resumida ordenado por fecha
 * de creación descendente, creación, edición, visualización del detalle e inactivación.
 */
@Component({
  selector: 'app-formula-medica',
  standalone: true,
  imports: [CommonModule, TablaDatosComponent],
  templateUrl: './formula-medica.component.html',
  styleUrl: './formula-medica.component.scss'
})
export class FormulaMedicaComponent implements OnInit {

  /** Fórmulas (resumen) mostradas en la tabla. */
  formulas: FormulaResumen[] = [];
  /** Indica si se está consultando el backend. */
  cargando = false;

  /** Columnas de la tabla: solo información resumida. */
  columnas: ColumnaTabla[] = [
    { id: 'creacion', etiqueta: 'Creada', ruta: 'fechaCreacion', tipo: 'fechaHora' },
    { id: 'emision', etiqueta: 'Emisión', ruta: 'fechaEmision', tipo: 'fecha' },
    { id: 'mascota', etiqueta: 'Mascota', ruta: 'mascotaNombre', filtro: 'texto' },
    { id: 'cliente', etiqueta: 'Cliente', ruta: 'clienteNombre', filtro: 'texto' },
    { id: 'veterinario', etiqueta: 'Veterinario', ruta: 'medicoNombre', filtro: 'lista' },
    { id: 'medicamento', etiqueta: 'Medicamento', ruta: 'medicamentoNombre', filtro: 'lista' },
    { id: 'estado', etiqueta: 'Estado', ruta: 'estado', tipo: 'insignia', filtro: 'lista' }
  ];

  constructor(
    private formulaService: FormulaMedicaService,
    private modalService: NgbModal,
    private notificacion: NotificacionService
  ) { }

  /** Carga las fórmulas al abrir la página. */
  ngOnInit(): void {
    this.cargar();
  }

  /** Consulta las fórmulas en el backend. */
  cargar(): void {
    this.cargando = true;
    this.formulaService.listar().subscribe({
      next: (data) => { this.formulas = data; this.cargando = false; },
      error: (err) => { this.cargando = false; this.notificacion.error(mensajeDeError(err)); }
    });
  }

  /** Abre el formulario para registrar una nueva fórmula. */
  nueva(): void {
    const ref = this.modalService.open(FormulaFormComponent, { size: 'lg', backdrop: 'static' });
    ref.result.then((guardado) => { if (guardado) { this.cargar(); } }, () => undefined);
  }

  /**
   * Consulta el detalle completo de la fórmula y lo muestra.
   * @param fila fórmula (resumen) seleccionada.
   */
  ver(fila: FormulaResumen): void {
    this.formulaService.consultar(fila.id).subscribe({
      next: (detalle) => {
        const ref = this.modalService.open(FormulaDetalleComponent, { size: 'lg' });
        ref.componentInstance.formula = detalle;
      },
      error: (err) => this.notificacion.error(mensajeDeError(err))
    });
  }

  /**
   * Consulta el detalle completo y abre el formulario de edición.
   * @param fila fórmula (resumen) seleccionada.
   */
  editar(fila: FormulaResumen): void {
    this.formulaService.consultar(fila.id).subscribe({
      next: (detalle) => {
        const ref = this.modalService.open(FormulaFormComponent, { size: 'lg', backdrop: 'static' });
        ref.componentInstance.formula = detalle;
        ref.result.then((guardado) => { if (guardado) { this.cargar(); } }, () => undefined);
      },
      error: (err) => this.notificacion.error(mensajeDeError(err))
    });
  }

  /**
   * Inactiva una fórmula tras pedir confirmación (no se elimina físicamente).
   * @param fila fórmula a inactivar.
   */
  async inactivar(fila: FormulaResumen): Promise<void> {
    const confirmado = await this.notificacion.confirmar(
      '¿Inactivar la fórmula?',
      'La fórmula no se elimina: queda inactiva para conservar el historial clínico y ya no podrá editarse.',
      'Sí, inactivar'
    );
    if (!confirmado) {
      return;
    }
    this.formulaService.inactivar(fila.id).subscribe({
      next: (r) => { this.notificacion.exito(r?.message || 'Fórmula inactivada.'); this.cargar(); },
      error: (err) => this.notificacion.error(mensajeDeError(err))
    });
  }
}
