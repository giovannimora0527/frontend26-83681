import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Medicamento } from 'src/app/models/medicamento';
import { MedicamentoService } from './service/medicamento.service';

@Component({
  selector: 'app-medicamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicamento.component.html',
  styleUrl: './medicamento.component.scss'
})
export class MedicamentoComponent implements OnInit {
  medicamentos: Medicamento[] = [];
  lotes: any[] = [];
  seleccionado: Medicamento | null = null;
  error = '';
  mensaje = '';
  cargando = false;
  producto: Medicamento = this.nuevoProducto();
  lote = this.nuevoLote();

  constructor(private servicio: MedicamentoService) {}
  ngOnInit(): void { this.cargar(); }
  nuevoProducto(): Medicamento {
    return { id: 0, codigo: '', nombre: '', descripcion: '', presentacion: '', tipoProducto: 'MEDICAMENTO',
      registroInvima: '', fechaCompra: new Date().toISOString().slice(0, 10),
      fechaVence: '', precioCompra: 0, precioVenta: 0, stockMinimo: 0, activo: true };
  }
  nuevoLote() { return { medicamentoId: 0, numeroLote: '', fechaVence: '', precioCompra: 0,
    cantidadInicial: 1, fechaIngreso: new Date().toISOString().slice(0, 10) }; }
  private fallo(e: HttpErrorResponse) { this.error = e.error?.message || e.error?.detail || `Error HTTP ${e.status}`; this.cargando = false; }
  cargar() {
    this.error = ''; this.cargando = true;
    this.servicio.listarInventario().subscribe({
      next: datos => { this.medicamentos = datos; this.cargando = false; },
      error: e => this.fallo(e)
    });
  }
  editar(m: Medicamento) { this.producto = { ...m }; this.error = ''; this.mensaje = ''; }
  cancelar() { this.producto = this.nuevoProducto(); }
  guardar() {
    this.error = ''; this.mensaje = '';
    const datos = { ...this.producto, requiereInvima: this.producto.tipoProducto === 'MEDICAMENTO' };
    const solicitud = datos.id ? this.servicio.actualizar(datos.id, datos) : this.servicio.crear(datos);
    solicitud.subscribe({ next: () => { this.mensaje = 'Producto guardado'; this.cancelar(); this.cargar(); }, error: e => this.fallo(e) });
  }
  verLotes(m: Medicamento) {
    this.seleccionado = m; this.lote = this.nuevoLote(); this.lote.medicamentoId = m.id;
    this.servicio.listarLotes(m.id).subscribe({ next: datos => this.lotes = datos, error: e => this.fallo(e) });
  }
  registrarLote() {
    this.error = ''; this.mensaje = '';
    this.servicio.crearLote(this.lote).subscribe({ next: () => {
      this.mensaje = 'Lote registrado'; this.cargar(); if (this.seleccionado) this.verLotes(this.seleccionado);
    }, error: e => this.fallo(e) });
  }
}
