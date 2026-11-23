import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ComprobanteDespacho, DespachoPendiente, DespachoResultado, DespachoService } from './service/despacho.service';

@Component({
  selector: 'app-despacho',
  imports: [CommonModule, FormsModule],
  templateUrl: './despacho.component.html',
  styleUrl: './despacho.component.scss'
})
export class DespachoComponent implements OnInit {
  pendientes: DespachoPendiente[] = [];
  cantidades: Record<number, number> = {};
  formulaConsulta = '';
  comprobante: ComprobanteDespacho | null = null;
  resultado: DespachoResultado | null = null;
  cargando = false;
  procesando = false;
  error = '';

  constructor(private readonly despacho: DespachoService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.despacho.pendientes().pipe(finalize(() => this.cargando = false)).subscribe({
      next: filas => {
        this.pendientes = filas;
        for (const fila of filas) this.cantidades[fila.formulaId] ??= fila.cantidad;
      },
      error: err => this.error = this.mensajeError(err)
    });
  }

  confirmar(fila: DespachoPendiente): void {
    const cantidad = Number(this.cantidades[fila.formulaId]);
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > fila.cantidad || this.procesando) return;
    this.procesando = true;
    this.error = '';
    const idempotencyKey = globalThis.crypto?.randomUUID?.() ?? `web-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    this.despacho.despachar(fila.formulaId, cantidad, idempotencyKey).pipe(finalize(() => this.procesando = false)).subscribe({
      next: resultado => {
        this.resultado = resultado;
        this.consultarComprobante(fila.formulaId);
        this.cargar();
      },
      error: err => this.error = this.mensajeError(err)
    });
  }

  consultarComprobante(formulaId: number): void {
    this.despacho.comprobante(formulaId).subscribe({
      next: data => this.comprobante = data,
      error: err => this.error = this.mensajeError(err)
    });
  }

  buscarComprobante(): void {
    const formulaId = Number(this.formulaConsulta);
    if (Number.isInteger(formulaId) && formulaId > 0) this.consultarComprobante(formulaId);
  }

  descargarPdf(formulaId: number): void {
    this.despacho.descargarComprobante(formulaId).subscribe({
      next: file => this.guardarArchivo(file, `comprobante-despacho-${formulaId}.pdf`),
      error: err => this.error = this.mensajeError(err)
    });
  }

  private guardarArchivo(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private mensajeError(error: { error?: { message?: string }; message?: string }): string {
    return error?.error?.message ?? error?.message ?? 'No fue posible completar la operación.';
  }
}
