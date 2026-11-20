import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';
import { Factura, FacturaDetalleRs } from 'src/app/models/factura';
import { ClienteService } from '../cliente/service/cliente.service';
import { MascotaService } from '../mascota/service/mascota.service';
import { FacturacionService } from './facturacion.service';
import { TarifasService, TarifaServicio } from '../tarifas/tarifas.service';

@Component({ selector: 'app-facturacion', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './facturacion.component.html', styleUrl: './facturacion.component.scss' })
export class FacturacionComponent implements OnInit {
  clientes: Cliente[] = [];
  mascotas: Mascota[] = [];
  facturas: Factura[] = [];
  detalle?: FacturaDetalleRs;
  clienteId = '';
  mascotaId = '';
  monto = 0;
  medio = 'EFECTIVO';
  referencia = '';
  atencionId = '';
  tarifaId = '';
  descuento = 0;
  motivoDescuento = '';
  tarifas: TarifaServicio[] = [];
  error = '';
  cargando = false;
  guardando = false;
  constructor(private readonly api: FacturacionService, private readonly clientesApi: ClienteService, private readonly mascotasApi: MascotaService, private readonly tarifasApi: TarifasService) {}
  ngOnInit(): void {
    this.clientesApi.listarClientes().subscribe({ next: rows => this.clientes = rows, error: () => this.error = 'No fue posible cargar los propietarios.' });
    this.mascotasApi.listarMascotas().subscribe({ next: rows => this.mascotas = rows, error: () => this.error = 'No fue posible cargar las mascotas.' });
    this.tarifasApi.listar().subscribe({ next: rows => this.tarifas = rows.filter(row => row.activo && !row.vigenteHasta), error: () => this.error = 'No fue posible cargar las tarifas vigentes.' });
  }
  cargarPorCliente(): void {
    if (!this.clienteId) return;
    this.cargando = true; this.error = '';
    this.api.porCliente(Number(this.clienteId)).pipe(finalize(() => this.cargando = false)).subscribe({ next: rows => { this.facturas = rows; this.detalle = undefined; }, error: err => this.error = err?.error?.message ?? 'No se pudieron consultar las facturas del propietario.' });
  }
  cargarPorMascota(): void {
    if (!this.mascotaId) return;
    this.cargando = true; this.error = '';
    this.api.porMascota(Number(this.mascotaId)).pipe(finalize(() => this.cargando = false)).subscribe({ next: rows => { this.facturas = rows; this.detalle = undefined; }, error: err => this.error = err?.error?.message ?? 'No se pudieron consultar las facturas de la mascota.' });
  }
  verDetalle(factura: Factura): void {
    this.cargando = true; this.error = '';
    this.api.detalle(factura.id).pipe(finalize(() => this.cargando = false)).subscribe({ next: response => { this.detalle = response; this.monto = Math.max(0, Number(response.factura.total) - response.pagos.reduce((sum,pago) => sum + Number(pago.monto), 0)); }, error: err => this.error = err?.error?.message ?? 'No se pudo cargar el detalle de la factura.' });
  }
  registrarPago(): void {
    if (!this.detalle || this.guardando) return;
    if (!Number.isFinite(this.monto) || this.monto <= 0 || !this.medio.trim()) { this.error = 'Ingresa un monto positivo y un medio de pago.'; return; }
    this.guardando = true; this.error = '';
    this.api.pagar(this.detalle.factura.id, { monto: Number(this.monto), medio: this.medio.trim(), referencia: this.referencia.trim() || undefined }).pipe(finalize(() => this.guardando = false)).subscribe({
      next: () => { const id = this.detalle!.factura.id; this.verDetalle({ id } as Factura); this.cargarOrigen(); },
      error: err => this.error = err?.error?.message ?? err?.error?.mensaje ?? 'El backend rechazó el pago; revisa el saldo pendiente.'
    });
  }
  crearFactura(): void {
    const atencion = Number(this.atencionId); const tarifa = Number(this.tarifaId);
    if (!atencion || !tarifa || this.descuento < 0 || (this.descuento > 0 && !this.motivoDescuento.trim()) || this.guardando) {
      this.error = 'Indica una atención existente, una tarifa vigente y el motivo si autorizas un descuento.'; return;
    }
    this.guardando = true; this.error = '';
    this.api.crear(atencion, { tarifaServicioId: tarifa, descuento: Number(this.descuento), motivoDescuento: this.motivoDescuento.trim() || undefined }).pipe(finalize(() => this.guardando = false)).subscribe({
      next: factura => { this.atencionId = ''; this.cargarPorClienteSiSeleccionado(); this.verDetalle(factura); },
      error: err => this.error = err?.error?.message ?? err?.error?.mensaje ?? 'No se pudo crear la factura. El backend valida duplicados, atención y dispensaciones.'
    });
  }
  descargarPdf(id: number): void {
    this.api.pdf(id).subscribe({ next: blob => { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `factura-${id}.pdf`; a.click(); URL.revokeObjectURL(url); }, error: err => this.error = err?.error?.message ?? 'No se pudo descargar la factura.' });
  }
  propietario(factura: Factura): string { try { const snap = JSON.parse(factura.propietarioSnapshot ?? '{}'); return `${snap.nombres ?? ''} ${snap.apellidos ?? ''}`.trim() || `Propietario ${factura.clienteId}`; } catch { return `Propietario ${factura.clienteId}`; } }
  mascota(factura: Factura): string { try { const snap = JSON.parse(factura.mascotaSnapshot ?? '{}'); return snap.nombre || `Mascota ${factura.mascotaId}`; } catch { return `Mascota ${factura.mascotaId}`; } }
  saldo(): number { return this.detalle ? Math.max(0, Number(this.detalle.factura.total) - this.detalle.pagos.reduce((sum, pago) => sum + Number(pago.monto), 0)) : 0; }
  private cargarOrigen(): void { if (this.clienteId) this.cargarPorCliente(); else if (this.mascotaId) this.cargarPorMascota(); }
  private cargarPorClienteSiSeleccionado(): void { this.cargarOrigen(); }
}
