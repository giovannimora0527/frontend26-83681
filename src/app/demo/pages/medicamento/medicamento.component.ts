import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { Medicamento } from 'src/app/models/medicamento';
import { MedicamentoService } from './service/medicamento.service';
import { getJwtPayload } from 'src/app/utils/jwt.util';

@Component({
  selector: 'app-medicamento',
  imports: [CommonModule, FormsModule],
  templateUrl: './medicamento.component.html',
  styleUrl: './medicamento.component.scss'
})
export class MedicamentoComponent implements OnInit {
  medicamentos: Medicamento[] = [];
  filtro = '';
  tipoFiltro = '';
  cargando = false;
  guardando = false;
  error = '';
  formularioAbierto = false;
  seleccionado: Medicamento | null = null;
  readonly puedeAdministrar = getJwtPayload()?.rol.toUpperCase() === 'ADMINISTRADOR';
  producto = this.formularioVacio();

  constructor(private readonly servicio: MedicamentoService) {}

  ngOnInit(): void { this.cargar(); }

  get listaFiltrada(): Medicamento[] {
    const query = this.filtro.trim().toLocaleLowerCase();
    return this.medicamentos.filter(item => {
      const coincideTexto = !query || `${item.codigo ?? ''} ${item.nombre} ${item.presentacion ?? ''}`.toLocaleLowerCase().includes(query);
      return coincideTexto && (!this.tipoFiltro || item.tipoProducto === this.tipoFiltro);
    });
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.servicio.listarMedicamentos().pipe(finalize(() => this.cargando = false)).subscribe({
      next: items => this.medicamentos = items,
      error: err => this.error = this.mensajeError(err)
    });
  }

  nuevo(): void {
    this.seleccionado = null;
    this.producto = this.formularioVacio();
    this.formularioAbierto = true;
  }

  editar(item: Medicamento): void {
    this.seleccionado = item;
    this.producto = {
      id: item.id, codigo: item.codigo ?? '', tipoProducto: item.tipoProducto ?? 'MEDICAMENTO',
      nombre: item.nombre, descripcion: item.descripcion ?? '', presentacion: item.presentacion ?? '',
      registroInvima: item.registroInvima ?? '', precioCompra: item.precioCompra ?? 0,
      precioPublico: item.precioPublico ?? 0, stockMinimo: item.stockMinimo ?? 0, activo: item.activo ?? true
    };
    this.formularioAbierto = true;
  }

  guardar(): void {
    if (this.guardando || !this.puedeAdministrar) return;
    this.guardando = true;
    this.error = '';
    const request = this.seleccionado
      ? this.servicio.actualizar({ ...this.producto, id: this.seleccionado.id })
      : this.servicio.crear(this.producto);
    request.pipe(finalize(() => this.guardando = false)).subscribe({
      next: () => { this.formularioAbierto = false; this.cargar(); },
      error: err => this.error = this.mensajeError(err)
    });
  }

  private formularioVacio(): Omit<Medicamento, 'id'> & { id?: number } {
    return { codigo: '', tipoProducto: 'MEDICAMENTO', nombre: '', descripcion: '', presentacion: '', registroInvima: '', precioCompra: 0, precioPublico: 0, stockMinimo: 0, activo: true };
  }

  private mensajeError(error: { error?: { message?: string }; message?: string }): string {
    return error?.error?.message ?? error?.message ?? 'No fue posible completar la operación.';
  }
}
