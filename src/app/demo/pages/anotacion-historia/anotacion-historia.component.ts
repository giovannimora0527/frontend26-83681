import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnotacionHistoriaServiceService } from './service/anotacion-historia-service.service';
import { ClienteServiceService } from '../cliente/service/cliente-service.service';
import { MascotaServiceService } from '../mascota/service/mascota-service.service';
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';
import { mostrarError } from 'src/app/utils/mensajes.util';
import { TablaAnotacionesComponent } from '../../shared/tabla-anotaciones/tabla-anotaciones.component';

/**
 * Pagina de consulta del historial de anotaciones de una mascota.
 * Se elige Cliente -> Mascota y se muestran todas sus anotaciones
 * (de todas sus historias clinicas). Para AGREGAR anotaciones se usa
 * el boton "Ver" del modulo de Historia Clinica.
 */
@Component({
  selector: 'app-anotacion-historia',
  imports: [CommonModule, FormsModule, TablaAnotacionesComponent],
  templateUrl: './anotacion-historia.component.html',
  styleUrl: './anotacion-historia.component.scss'
})
export class AnotacionHistoriaComponent {

  listClientes: Cliente[] = [];
  listMascotas: Mascota[] = [];
  clienteId?: number;
  mascotaId?: number;
  anotaciones: AnotacionHistoria[] = [];
  cargando = false;

  constructor(
    private readonly anotacionService: AnotacionHistoriaServiceService,
    private readonly clienteService: ClienteServiceService,
    private readonly mascotaService: MascotaServiceService
  ) {
    this.clienteService.getClientes().subscribe({ next: d => this.listClientes = d, error: e => mostrarError(e) });
  }

  /** Combo dependiente: al elegir cliente se cargan solo sus mascotas. */
  cambiarCliente(): void {
    this.mascotaId = undefined;
    this.listMascotas = [];
    this.anotaciones = [];
    if (!this.clienteId) {
      return;
    }
    this.mascotaService.getMascotasPorCliente(this.clienteId).subscribe({
      next: d => this.listMascotas = d,
      error: e => mostrarError(e)
    });
  }

  /** Al elegir la mascota se consulta su historial de anotaciones. */
  cambiarMascota(): void {
    this.anotaciones = [];
    if (!this.mascotaId) {
      return;
    }
    this.cargando = true;
    this.anotacionService.listarPorMascota(this.mascotaId).subscribe({
      next: (data) => {
        this.anotaciones = data;
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        mostrarError(error);
      }
    });
  }
}
