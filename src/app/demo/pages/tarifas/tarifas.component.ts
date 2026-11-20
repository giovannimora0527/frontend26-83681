import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Especializacion } from 'src/app/models/especializacion';
import { EspecializacionService } from '../especializacion/service/especializacion.service';
import { TarifasService, TarifaRq, TarifaServicio } from './tarifas.service';
@Component({ selector: 'app-tarifas', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './tarifas.component.html', styleUrl: './tarifas.component.scss' })
export class TarifasComponent implements OnInit {
  tarifas: TarifaServicio[] = []; historial: unknown[] = []; especializaciones: Especializacion[] = [];
  tarifa?: TarifaServicio; nombre = ''; descripcion = ''; especializacionId = ''; precio = 0; iva = 0; activo = true;
  formularioAbierto = false; mostrandoHistorial = false; cargando = false; guardando = false; error = '';
  constructor(private readonly api: TarifasService, private readonly especializacionesApi: EspecializacionService) {}
  ngOnInit(): void { this.cargar(); this.especializacionesApi.listar().subscribe({ next: rows => this.especializaciones = rows, error: () => this.error = 'No fue posible cargar especialidades.' }); }
  cargar(): void { this.cargando = true; this.api.listar().pipe(finalize(() => this.cargando = false)).subscribe({ next: rows => this.tarifas = rows, error: err => this.error = err?.error?.message ?? 'No se pudieron cargar las tarifas.' }); }
  nueva(): void { this.tarifa = undefined; this.nombre = ''; this.descripcion = ''; this.especializacionId = ''; this.precio = 0; this.iva = 0; this.activo = true; this.formularioAbierto = true; }
  editar(item: TarifaServicio): void { this.tarifa = item; this.nombre = item.nombre; this.descripcion = item.descripcion ?? ''; this.especializacionId = String(item.especializacion?.id ?? item.especializacionId ?? ''); this.precio = item.precio; this.iva = item.ivaPorcentaje; this.activo = item.activo; this.formularioAbierto = true; }
  guardar(): void {
    if (!this.nombre.trim() || !Number.isFinite(this.precio) || this.precio < 0 || !Number.isFinite(this.iva) || this.iva < 0 || this.iva > 100 || this.guardando) { this.error = 'Completa nombre, precio válido e IVA entre 0 y 100.'; return; }
    const request: TarifaRq = { especializacionId: this.especializacionId ? Number(this.especializacionId) : null, nombre: this.nombre.trim(), descripcion: this.descripcion.trim(), precio: Number(this.precio), ivaPorcentaje: Number(this.iva), activo: this.activo };
    this.guardando = true; this.error = '';
    const call = this.tarifa?.id ? this.api.actualizar(this.tarifa.id, request) : this.api.crear(request);
    call.pipe(finalize(() => this.guardando = false)).subscribe({ next: () => { this.formularioAbierto = false; this.cargar(); }, error: err => this.error = err?.error?.message ?? err?.error?.mensaje ?? 'El backend rechazó la tarifa.' });
  }
  verHistorial(): void { this.mostrandoHistorial = !this.mostrandoHistorial; if (this.mostrandoHistorial) this.api.historial().subscribe({ next: rows => this.historial = rows, error: err => this.error = err?.error?.message ?? 'No fue posible cargar el historial.' }); }
}
