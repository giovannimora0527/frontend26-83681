import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Cliente } from 'src/app/models/cliente';
import { getJwtPayload } from 'src/app/utils/jwt.util';
import { ClienteService } from './service/cliente.service';

@Component({ selector: 'app-cliente', imports: [CommonModule, FormsModule], templateUrl: './cliente.component.html', styleUrl: './cliente.component.scss' })
export class ClienteComponent implements OnInit {
  clientes: Cliente[] = []; filtro = ''; cargando = false; guardando = false; error = ''; exito = '';
  formularioAbierto = false; seleccionado: Cliente | null = null;
  readonly hoy = new Date().toISOString().slice(0, 10);
  readonly puedeAdministrar = ['ADMINISTRADOR', 'RECEPCIONISTA'].includes(getJwtPayload()?.rol.toUpperCase() ?? '');
  cliente: Cliente = this.vacio();
  constructor(private readonly servicio: ClienteService) {}
  ngOnInit(): void { this.cargar(); }
  get listaFiltrada(): Cliente[] {
    const q = this.filtro.trim().toLocaleLowerCase();
    return this.clientes.filter(c => !q || `${c.tipoDocumento ?? ''} ${c.numeroDocumento ?? ''} ${c.nombres ?? ''} ${c.apellidos ?? ''}`.toLocaleLowerCase().includes(q));
  }
  cargar(): void { this.cargando = true; this.servicio.listarClientes().pipe(finalize(() => this.cargando = false)).subscribe({ next: x => this.clientes = x, error: e => this.error = this.mensaje(e) }); }
  nuevo(): void { this.seleccionado = null; this.cliente = this.vacio(); this.error = ''; this.exito = ''; this.formularioAbierto = true; }
  editar(c: Cliente): void { this.seleccionado = c; this.cliente = { ...c, fechaNacimiento: this.fechaInput(c.fechaNacimiento) }; this.error = ''; this.exito = ''; this.formularioAbierto = true; }
  guardar(): void {
    if (this.guardando || !this.puedeAdministrar) return;
    this.guardando = true; this.error = ''; this.exito = '';
    const req = this.seleccionado ? this.servicio.actualizar({ ...this.cliente, id: this.seleccionado.id }) : this.servicio.crear(this.cliente);
    req.pipe(finalize(() => this.guardando = false)).subscribe({ next: () => { this.formularioAbierto = false; this.exito = 'Cliente guardado correctamente.'; this.cargar(); }, error: e => this.error = this.mensaje(e) });
  }
  private vacio(): Cliente { return { tipoDocumento: 'CC', numeroDocumento: '', nombres: '', apellidos: '', fechaNacimiento: '', genero: '', telefono: '', direccion: '', activo: true }; }
  private fechaInput(v?: Date | string): string { return v ? String(v).slice(0, 10) : ''; }
  private mensaje(e: { error?: { message?: string }; message?: string }): string { return e?.error?.message ?? e?.message ?? 'No fue posible completar la operación.'; }
}
