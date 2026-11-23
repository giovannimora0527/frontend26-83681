import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Cita } from 'src/app/models/cita';
import { Especializacion } from 'src/app/models/especializacion';
import { Medico } from 'src/app/models/medico';
import { CitaService } from '../cita/service/cita.service';
import { EspecializacionService } from '../especializacion/service/especializacion.service';
import { MedicoService } from '../medico/service/medico.service';
import { getJwtPayload } from 'src/app/utils/jwt.util';
import { Factura, FacturacionService, TarifaServicio, TarifaServicioRq } from './service/facturacion.service';

@Component({
  selector: 'app-facturacion',
  imports: [CommonModule, FormsModule],
  templateUrl: './facturacion.component.html',
  styleUrl: './facturacion.component.scss'
})
export class FacturacionComponent implements OnInit {
  citas: Cita[] = [];
  tarifas: TarifaServicio[] = [];
  tarifasAdministracion: TarifaServicio[] = [];
  especializaciones: Especializacion[] = [];
  medicos: Medico[] = [];
  vistaPrevia: Factura | null = null;
  factura: Factura | null = null;
  citaId = 0;
  descuento = 0;
  montoPago = 0;
  metodoPago = 'EFECTIVO';
  referenciaPago = '';
  nuevaTarifa: TarifaServicioRq = this.tarifaVacia();
  tarifaEditandoId: number | null = null;
  mostrarModalTarifas = false;
  readonly puedeAdministrarTarifas = (getJwtPayload()?.rol ?? '').toUpperCase() === 'ADMINISTRADOR';
  cargando = false;
  error = '';

  constructor(
    private readonly facturacion: FacturacionService,
    private readonly citaService: CitaService,
    private readonly especializacionService: EspecializacionService,
    private readonly medicoService: MedicoService
  ) {}

  ngOnInit(): void {
    this.citaService.listarCitas().subscribe({
      next: data => this.citas = data.filter(c => (c.estado ?? '').toUpperCase() === 'ATENDIDA'),
      error: err => this.error = this.mensajeError(err)
    });
    this.cargarTarifas();
    if (this.puedeAdministrarTarifas) {
      this.especializacionService.listar().subscribe({ next: data => { this.especializaciones = data; this.nuevaTarifa.especializacionId ||= data[0]?.id ?? 0; } });
      this.medicoService.listar().subscribe({ next: data => this.medicos = data.filter(m => m.estado !== false) });
      this.cargarTarifasAdministracion();
    }
  }

  cargarTarifas(): void {
    this.facturacion.tarifas().subscribe({ next: data => this.tarifas = data, error: err => this.error = this.mensajeError(err) });
  }

  cargarTarifasAdministracion(): void {
    this.facturacion.tarifasAdministracion().subscribe({ next: data => this.tarifasAdministracion = data, error: err => this.error = this.mensajeError(err) });
  }

  abrirModalTarifas(): void { this.mostrarModalTarifas = true; }

  cerrarModalTarifas(): void { this.mostrarModalTarifas = false; }

  guardarTarifa(): void {
    this.error = '';
    const request = { ...this.nuevaTarifa, medicoId: this.nuevaTarifa.medicoId || null, vigenciaHasta: this.nuevaTarifa.vigenciaHasta || null };
    const operation = this.tarifaEditandoId
      ? this.facturacion.actualizarTarifa(this.tarifaEditandoId, request)
      : this.facturacion.crearTarifa(request);
    operation.subscribe({
      next: () => { this.cancelarEdicionTarifa(); this.cargarTarifas(); this.cargarTarifasAdministracion(); },
      error: err => this.error = this.mensajeError(err)
    });
  }

  editarTarifa(tarifa: TarifaServicio): void {
    this.tarifaEditandoId = tarifa.id;
    this.nuevaTarifa = {
      especializacionId: tarifa.especializacionId ?? 0,
      medicoId: tarifa.medicoId,
      nombre: tarifa.nombre,
      valor: tarifa.valor,
      impuestoPorcentaje: tarifa.impuestoPorcentaje,
      vigenciaDesde: tarifa.vigenciaDesde,
      vigenciaHasta: tarifa.vigenciaHasta
    };
  }

  sincronizarEspecialidadMedico(): void {
    if (!this.nuevaTarifa.medicoId) return;
    const medico = this.medicos.find(m => m.id === Number(this.nuevaTarifa.medicoId));
    if (medico?.especializacionId) this.nuevaTarifa.especializacionId = medico.especializacionId;
  }

  cancelarEdicionTarifa(): void { this.tarifaEditandoId = null; this.nuevaTarifa = this.tarifaVacia(); }

  cambiarEstadoTarifa(tarifa: TarifaServicio): void {
    this.facturacion.cambiarEstadoTarifa(tarifa.id, !tarifa.activo).subscribe({
      next: () => { this.cargarTarifas(); this.cargarTarifasAdministracion(); },
      error: err => this.error = this.mensajeError(err)
    });
  }

  invalidarVistaPrevia(): void { this.vistaPrevia = null; }

  cancelarVistaPrevia(): void { this.vistaPrevia = null; }

  previsualizarFactura(): void {
    if (!this.citaId || this.cargando) return;
    this.cargando = true; this.error = ''; this.factura = null; this.vistaPrevia = null;
    this.facturacion.vistaPrevia({ citaId: this.citaId, descuento: Number(this.descuento) || 0 }).subscribe({
      next: preview => { this.vistaPrevia = preview; this.cargando = false; },
      error: err => { this.error = this.mensajeError(err); this.cargando = false; }
    });
  }

  emitirFactura(): void {
    if (!this.vistaPrevia || !this.citaId || this.cargando) return;
    this.cargando = true; this.error = '';
    this.facturacion.facturar({ citaId: this.citaId, descuento: Number(this.descuento) || 0 }).subscribe({
      next: invoice => { this.factura = invoice; this.vistaPrevia = null; this.cargando = false; },
      error: err => { this.error = this.mensajeError(err); this.cargando = false; }
    });
  }

  imprimirVistaPrevia(): void { window.print(); }

  consultarFactura(): void {
    if (!this.factura?.id) return;
    this.facturacion.factura(this.factura.id).subscribe({ next: invoice => this.factura = invoice, error: err => this.error = this.mensajeError(err) });
  }

  registrarPago(): void {
    if (!this.factura?.id || this.montoPago <= 0) return;
    this.facturacion.registrarPago(this.factura.id, { monto: this.montoPago, metodo: this.metodoPago, referencia: this.referenciaPago }).subscribe({
      next: invoice => { this.factura = invoice; this.montoPago = 0; this.referenciaPago = ''; },
      error: err => this.error = this.mensajeError(err)
    });
  }

  descargarPdf(): void {
    if (!this.factura?.id) return;
    this.facturacion.descargarFactura(this.factura.id).subscribe({
      next: blob => this.guardarArchivo(blob, `factura-${this.factura?.id}.pdf`),
      error: err => this.error = this.mensajeError(err)
    });
  }

  medicoLabel(cita: Cita): string {
    const medico = cita.medico;
    return medico ? `${medico.nombres} ${medico.apellidos} · ${medico.especializacion?.nombre ?? ''}` : '';
  }

  private tarifaVacia(): TarifaServicioRq {
    return { especializacionId: this.especializaciones[0]?.id ?? 0, medicoId: null, nombre: '', valor: 0, impuestoPorcentaje: 0, vigenciaDesde: new Date().toISOString().slice(0, 10), vigenciaHasta: null };
  }

  private guardarArchivo(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
    anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
  }

  private mensajeError(error: { error?: { message?: string }; message?: string }): string {
    return error?.error?.message ?? error?.message ?? 'No fue posible completar la operación.';
  }
}
