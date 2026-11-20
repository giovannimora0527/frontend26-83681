import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { Medico } from 'src/app/models/medico';
import { MedicoService } from '../medico/service/medico.service';
import { ReportesService } from './reportes.service';

type TipoReporte = 'inventario' | 'citas' | 'financiero';

@Component({ selector: 'app-reportes', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './reportes.component.html', styleUrl: './reportes.component.scss' })
export class ReportesComponent implements OnInit {
  tipo: TipoReporte = 'citas';
  desde = '';
  hasta = '';
  medicoId = '';
  medicos: Medico[] = [];
  vistaPrevia: unknown;
  error = '';
  cargando = false;
  descargando = '';
  generadoEn?: Date;
  rol = '';

  constructor(private readonly reports: ReportesService, private readonly medicoService: MedicoService) {}
  ngOnInit(): void {
    const hoy = new Date(); this.hasta = this.formatoFecha(hoy); const inicio = new Date(hoy); inicio.setDate(inicio.getDate() - 30); this.desde = this.formatoFecha(inicio);
    try { const token = sessionStorage.getItem('token'); this.rol = token ? String(JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).rol).toUpperCase() : ''; } catch { this.rol = ''; }
    if (this.rol === 'ADMINISTRADOR') this.medicoService.listar().subscribe({ next: rows => this.medicos = rows, error: () => this.error = 'No se pudo cargar el listado de veterinarios.' });
  }
  cambiarTipo(tipo: TipoReporte): void { this.tipo = tipo; this.vistaPrevia = undefined; this.error = ''; }
  consultar(): void {
    if (this.tipo !== 'inventario' && (!this.desde || !this.hasta || this.desde > this.hasta)) { this.error = 'Selecciona un rango de fechas válido.'; return; }
    this.error = ''; this.cargando = true;
    this.reports.consultar(this.tipo, this.params()).pipe(finalize(() => this.cargando = false)).subscribe({
      next: data => { this.vistaPrevia = data; this.generadoEn = new Date(); },
      error: err => { this.vistaPrevia = undefined; this.error = err?.error?.message ?? err?.error?.error ?? 'El backend no pudo generar la vista previa del reporte.'; }
    });
  }
  descargar(formato: 'pdf' | 'xlsx'): void {
    if (this.tipo !== 'inventario' && (!this.desde || !this.hasta || this.desde > this.hasta)) { this.error = 'Selecciona un rango de fechas válido.'; return; }
    const key = `${this.tipo}.${formato}`; this.descargando = key; this.error = '';
    const request = formato === 'pdf' ? this.reports.pdf(this.tipo, this.params()) : this.reports.excel(this.tipo, this.params());
    request.pipe(finalize(() => this.descargando = '')).subscribe({
      next: blob => this.guardarArchivo(blob, `reporte-${this.tipo}-${this.formatoFecha(new Date())}.${formato}`),
      error: err => this.error = err?.error?.message ?? 'La descarga fue rechazada por el backend.'
    });
  }
  private params(): HttpParams {
    let params = new HttpParams();
    if (this.tipo !== 'inventario') params = params.set('desde', `${this.desde}T00:00:00`).set('hasta', `${this.hasta}T23:59:59`);
    if (this.tipo === 'citas' && this.medicoId) params = params.set('medicoId', this.medicoId);
    return params;
  }
  private guardarArchivo(blob: Blob, nombre: string): void {
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = nombre; link.click(); URL.revokeObjectURL(url);
  }
  private formatoFecha(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
}
