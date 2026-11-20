import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { FormulaPendiente, ConfirmarDespachoRq, DespachoRs } from 'src/app/models/despacho';
import { InventarioLote } from 'src/app/models/medicamento';
import { MedicamentoService } from '../medicamento/service/medicamento.service';
import { DespachoService } from './despacho.service';

@Component({ selector: 'app-despacho', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './despacho.component.html', styleUrl: './despacho.component.scss' })
export class DespachoComponent implements OnInit {
  pendientes: FormulaPendiente[] = [];
  historial: unknown[] = [];
  lotes = new Map<number, InventarioLote[]>();
  cantidades: Record<number, number> = {};
  busqueda = '';
  fechaDesde = '';
  fechaHasta = '';
  cargando = false;
  confirmando = false;
  error = '';
  filtro = 'PENDIENTES';
  formulaSeleccionada?: FormulaPendiente;
  private idempotencyKey = '';

  constructor(private readonly service: DespachoService, private readonly inventario: MedicamentoService) {}
  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando = true; this.error = '';
    let params = new HttpParams();
    if (this.busqueda.trim()) params = params.set('propietario', this.busqueda.trim());
    if (this.fechaDesde) params = params.set('desde', `${this.fechaDesde}T00:00:00`);
    if (this.fechaHasta) params = params.set('hasta', `${this.fechaHasta}T23:59:59`);
    const request = this.filtro === 'HISTORIAL' ? this.service.historial(params) : this.service.pendientes(params);
    request.pipe(finalize(() => this.cargando = false)).subscribe({
      next: rows => {
        if (this.filtro === 'HISTORIAL') this.historial = rows;
        else {
          this.pendientes = (rows as FormulaPendiente[]).filter(row => Number(row.cantidadPrescrita) > Number(row.cantidadDispensada));
          for (const formula of this.pendientes) this.cantidades[formula.id] ??= this.pendiente(formula);
        }
      },
      error: err => { this.error = err?.error?.message ?? err?.error?.mensaje ?? 'No se pudo cargar la información de despacho.'; }
    });
  }

  seleccionar(formula: FormulaPendiente): void {
    this.formulaSeleccionada = formula;
    this.idempotencyKey = this.nuevaClave();
    this.inventario.lotes(formula.medicamento.id).subscribe({
      next: rows => this.lotes.set(formula.medicamento.id, [...rows].filter(lote => lote.fechaVencimiento >= new Date().toISOString().slice(0, 10)).sort((a,b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento))),
      error: err => void Swal.fire('No se pudieron consultar los lotes', err?.error?.message ?? err?.error?.mensaje ?? 'El servidor rechazó la consulta de inventario.', 'error')
    });
  }

  pendiente(row: FormulaPendiente): number { return Math.max(0, Number(row.cantidadPrescrita) - Number(row.cantidadDispensada)); }
  lotesDisponibles(row: FormulaPendiente): number { return (this.lotes.get(row.medicamento.id) ?? []).reduce((sum, lote) => sum + Number(lote.cantidadDisponible), 0); }
  proximoAVencer(fecha: string): boolean {
    const dias = (new Date(`${fecha}T00:00:00`).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000;
    return dias >= 0 && dias <= 90;
  }
  confirmar(): void {
    if (!this.formulaSeleccionada || this.confirmando) return;
    const row = this.formulaSeleccionada;
    const cantidad = Number(this.cantidades[row.id]);
    if (!Number.isFinite(cantidad) || cantidad <= 0 || cantidad > this.pendiente(row)) {
      void Swal.fire('Cantidad inválida', 'La cantidad debe ser positiva y no superar la prescrita pendiente.', 'warning'); return;
    }
    const request: ConfirmarDespachoRq = { idempotencyKey: this.idempotencyKey, detalles: [{ formulaDetalleId: row.id, cantidad }] };
    this.confirmando = true;
    this.service.confirmar(request).pipe(finalize(() => this.confirmando = false)).subscribe({
      next: (response: DespachoRs) => {
        this.formulaSeleccionada = undefined;
        void Swal.fire('Despacho registrado', `Comprobante ${response.numero} · estado ${response.estado}. El servidor asignó los lotes con criterio FEFO.`, 'success');
        this.cargar();
      },
      error: err => void Swal.fire('No se pudo confirmar', err?.error?.message ?? err?.error?.mensaje ?? 'El backend rechazó el despacho. Revisa existencias y cantidades.', 'error')
    });
  }
  private nuevaClave(): string {
    return globalThis.crypto?.randomUUID?.() ?? `dsp-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }
}
