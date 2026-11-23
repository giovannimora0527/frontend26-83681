import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { Medicamento } from 'src/app/models/medicamento';
import { MedicamentoService } from '../medicamento/service/medicamento.service';
import { InventarioItem, InventarioService, LoteInventario, MovimientoInventario, ResultadoImportacion } from './service/inventario.service';

@Component({
  selector: 'app-inventario',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss'
})
export class InventarioComponent implements OnInit {
  items: InventarioItem[] = [];
  medicamentos: Medicamento[] = [];
  lotes: LoteInventario[] = [];
  movimientos: MovimientoInventario[] = [];
  seleccionado: InventarioItem | null = null;
  estado = 'TODOS';
  cargando = false;
  enviando = false;
  error = '';
  archivo: File | null = null;
  resultado: ResultadoImportacion | null = null;
  lote = { medicamentoId: 0, codigoLote: '', fechaVencimiento: '', cantidad: 1, costoUnitario: 0, detalle: '' };

  constructor(private readonly inventario: InventarioService, private readonly medicamentoService: MedicamentoService) {}

  ngOnInit(): void {
    this.cargar();
    this.medicamentoService.listarMedicamentos().subscribe({ next: data => this.medicamentos = data });
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.inventario.resumen(this.estado).pipe(finalize(() => this.cargando = false)).subscribe({
      next: data => this.items = data,
      error: err => this.error = this.mensajeError(err)
    });
  }

  seleccionar(item: InventarioItem): void {
    this.seleccionado = item;
    this.inventario.lotes(item.medicamentoId).subscribe({
      next: data => this.lotes = data,
      error: err => this.error = this.mensajeError(err)
    });
    this.inventario.movimientos(item.medicamentoId).subscribe({
      next: data => this.movimientos = data,
      error: err => this.error = this.mensajeError(err)
    });
  }

  seleccionarArchivo(event: Event): void {
    this.archivo = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.resultado = null;
  }

  previsualizar(): void {
    if (!this.archivo || this.enviando) return;
    this.enviando = true;
    this.error = '';
    this.inventario.previsualizar(this.archivo).pipe(finalize(() => this.enviando = false)).subscribe({
      next: data => this.resultado = data,
      error: err => this.error = this.mensajeError(err)
    });
  }

  confirmarImportacion(): void {
    if (!this.archivo || !this.resultado?.filasValidas || this.enviando) return;
    this.enviando = true;
    this.error = '';
    this.inventario.ejecutar(this.archivo).pipe(finalize(() => this.enviando = false)).subscribe({
      next: data => { this.resultado = data; this.cargar(); },
      error: err => this.error = this.mensajeError(err)
    });
  }

  registrarIngreso(): void {
    if (!this.lote.medicamentoId || this.enviando) return;
    this.enviando = true;
    this.error = '';
    this.inventario.registrarIngreso(this.lote).pipe(finalize(() => this.enviando = false)).subscribe({
      next: () => {
        this.lote = { medicamentoId: 0, codigoLote: '', fechaVencimiento: '', cantidad: 1, costoUnitario: 0, detalle: '' };
        this.cargar();
      },
      error: err => this.error = this.mensajeError(err)
    });
  }

  private mensajeError(error: { error?: { message?: string }; message?: string }): string {
    return error?.error?.message ?? error?.message ?? 'No fue posible completar la operación.';
  }
}
