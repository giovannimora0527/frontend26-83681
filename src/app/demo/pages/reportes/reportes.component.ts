import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportesService, ReporteCitas, ReporteFacturacion, ReporteInventario, ReporteMedicos, TipoReporte, FormatoReporte } from './service/reportes.service';

@Component({
  selector: 'app-reportes',
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent {
  tipo: TipoReporte = 'citas';
  desde = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  hasta = new Date().toISOString().slice(0, 10);
  citas: ReporteCitas | null = null;
  facturacion: ReporteFacturacion | null = null;
  inventario: ReporteInventario | null = null;
  medicos: ReporteMedicos | null = null;
  cargando = false;
  error = '';

  constructor(private readonly reportes: ReportesService) {}

  consultar(): void {
    if (this.tipo !== 'inventario' && (!this.desde || !this.hasta || this.desde > this.hasta)) {
      this.error = 'Selecciona un rango de fechas válido.';
      return;
    }
    this.cargando = true;
    this.error = '';
    this.citas = null;
    this.facturacion = null;
    this.inventario = null;
    this.medicos = null;
    const onError = (err: { error?: { message?: string } }) => {
      this.error = err?.error?.message ?? 'No fue posible consultar el reporte.';
      this.cargando = false;
    };
    if (this.tipo === 'citas') {
      this.reportes.citas(this.desde, this.hasta).subscribe({
        next: (data: ReporteCitas) => { this.citas = data; this.cargando = false; },
        error: onError
      });
    } else if (this.tipo === 'facturacion') {
      this.reportes.facturacion(this.desde, this.hasta).subscribe({
        next: (data: ReporteFacturacion) => { this.facturacion = data; this.cargando = false; },
        error: onError
      });
    } else if (this.tipo === 'inventario') {
      this.reportes.inventario().subscribe({
        next: data => { this.inventario = data; this.cargando = false; },
        error: onError
      });
    } else {
      this.reportes.medicos(this.desde, this.hasta).subscribe({
        next: data => { this.medicos = data; this.cargando = false; },
        error: onError
      });
    }
  }

  descargar(formato: FormatoReporte): void {
    if (this.tipo !== 'inventario' && (!this.desde || !this.hasta || this.desde > this.hasta)) {
      this.error = 'Selecciona un rango de fechas válido.';
      return;
    }
    this.error = '';
    this.reportes.descargar(this.tipo, formato, this.desde, this.hasta).subscribe({
      next: blob => this.guardarArchivo(blob, `reporte-${this.tipo}${this.tipo === 'inventario' ? '' : `-${this.desde}-${this.hasta}`}.${formato}`),
      error: err => this.error = err?.error?.message ?? 'No fue posible descargar el reporte.'
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
}
