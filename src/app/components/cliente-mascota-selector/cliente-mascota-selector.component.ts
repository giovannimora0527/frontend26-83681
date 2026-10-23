import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';
import { ClienteService } from 'src/app/demo/pages/cliente/service/cliente.service';
import { MascotaService } from 'src/app/demo/pages/mascota/service/mascota.service';
import { NotificacionService } from 'src/app/services/notificacion.service';
import { mensajeDeError } from 'src/app/utils/api-error.util';

/**
 * Par de combos dependientes Cliente → Mascotas del cliente.
 * Se reutiliza en los formularios de citas, historias clínicas y fórmulas médicas.
 * El formulario padre debe tener los controles `clienteId` y `mascotaId`.
 */
@Component({
  selector: 'app-cliente-mascota-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cliente-mascota-selector.component.html'
})
export class ClienteMascotaSelectorComponent implements OnInit {

  /** Formulario del padre (con los controles clienteId y mascotaId). */
  @Input({ required: true }) form!: FormGroup;

  /** Clientes disponibles. */
  clientes: Cliente[] = [];
  /** Mascotas del cliente seleccionado (únicamente las suyas). */
  mascotas: Mascota[] = [];
  /** Indica si se están cargando las mascotas. */
  cargandoMascotas = false;

  constructor(
    private clienteService: ClienteService,
    private mascotaService: MascotaService,
    private notificacion: NotificacionService
  ) { }

  /** Carga los clientes y, si el formulario ya trae un cliente (edición), sus mascotas. */
  ngOnInit(): void {
    this.clienteService.listar().subscribe({
      next: (c) => (this.clientes = c),
      error: (err) => this.notificacion.error(mensajeDeError(err))
    });
    const clienteId = this.form.get('clienteId')?.value;
    if (clienteId) {
      this.cargarMascotas(clienteId);
    }
  }

  /** Al elegir otro cliente se limpia la mascota y se consultan solo las mascotas de ese cliente. */
  alCambiarCliente(): void {
    this.form.get('mascotaId')?.setValue(null);
    this.mascotas = [];
    const clienteId = this.form.get('clienteId')?.value;
    if (clienteId) {
      this.cargarMascotas(clienteId);
    }
  }

  /**
   * Consulta las mascotas de un cliente.
   * @param clienteId identificador del cliente.
   */
  private cargarMascotas(clienteId: number): void {
    this.cargandoMascotas = true;
    this.mascotaService.listarPorCliente(clienteId).subscribe({
      next: (m) => { this.mascotas = m; this.cargandoMascotas = false; },
      error: (err) => { this.cargandoMascotas = false; this.notificacion.error(mensajeDeError(err)); }
    });
  }

  /**
   * Indica si un control es inválido y ya fue tocado.
   * @param control nombre del control.
   */
  invalido(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.touched || c.dirty);
  }
}
