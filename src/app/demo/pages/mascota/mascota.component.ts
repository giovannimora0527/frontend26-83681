
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';
import { ClienteService } from '../cliente/service/cliente.service';
import { MascotaService} from './service/mascota-service.service';

@Component({
  selector: 'app-mascota',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mascota.component.html',
  styleUrl: './mascota.component.scss'
})
export class MascotaComponent implements OnInit {
  clientes: Cliente[] = [];
  mascotas: any[] = [];
  mascotasFiltradas: any[] = [];
  mascotaSeleccionada: any | null = null;

  clienteId: number | null = null;
  mascotaId = '';
  filtro = '';
  cargando = false;
  mensajeError = '';

  pagina = 1;
  tamanoPagina = 8;

  constructor(
    private clienteService: ClienteService,
    private mascotaService: MascotaService
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarMascotas();
  }

  cargarClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (datos: any[]) => {
        this.clientes = (datos || []).map(c => ({
          ...c,
          cliente_id: c.cliente_id ?? c.id,
          numero_documento: c.numero_documento ?? c.numeroDocumento
        }));
      },
      error: () => {
        this.mensajeError = 'No fue posible cargar los clientes.';
      }
    });
  }

  cargarMascotas(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.mascotaService.getMascotas().subscribe({
      next: (datos: any[]) => {
        this.mascotas = (datos || []).map(m => ({
          ...m,
          mascota_id: m.mascota_id ?? m.mascotaId,
          nombre_mascota: m.nombre_mascota ?? m.nombreMascota,
          cliente_id: m.cliente_id ?? m.clienteId ?? m.cliente?.id,
          clienteNombre: m.cliente
            ? `${m.cliente.nombres || ''} ${m.cliente.apellidos || ''}`.trim()
            : ''
        }));

        this.filtrarMascotas();
        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'No fue posible cargar las mascotas. Verifica que el backend esté activo.';
        this.cargando = false;
      }
    });
  }

  seleccionarCliente(): void {
    this.mascotaSeleccionada = null;
    this.filtrarMascotas();
  }

  filtrarMascotas(): void {
    const texto = this.filtro.trim().toLowerCase();

    this.mascotasFiltradas = this.mascotas.filter(m => {
      const perteneceCliente =
        this.clienteId === null ||
        Number(m.cliente_id) === Number(this.clienteId);

      const coincideTexto =
        `${m.nombre_mascota || ''} ${m.mascota_id || ''} ${m.clienteNombre || ''}`
          .toLowerCase()
          .includes(texto);

      return perteneceCliente && coincideTexto;
    });

    this.pagina = 1;
  }

  buscarPorId(): void {
    if (!this.mascotaId.trim()) {
      this.mensajeError = 'Ingresa el ID de la mascota.';
      this.mascotaSeleccionada = null;
      return;
    }

    const mascota = this.mascotas.find(m =>
      Number(m.mascota_id) === Number(this.mascotaId)
    );

    if (!mascota) {
      this.mensajeError = 'No se encontró una mascota con ese ID.';
      this.mascotaSeleccionada = null;
      return;
    }

    this.mascotaSeleccionada = mascota;
    this.mensajeError = '';
  }

  verDetalle(mascota: any): void {
    this.mascotaSeleccionada = mascota;
    this.mensajeError = '';
  }

  cerrarDetalle(): void {
    this.mascotaSeleccionada = null;
  }

  get mascotasPagina(): any[] {
    const inicio = (this.pagina - 1) * this.tamanoPagina;
    return this.mascotasFiltradas.slice(inicio, inicio + this.tamanoPagina);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.mascotasFiltradas.length / this.tamanoPagina));
  }

  cambiarPagina(valor: number): void {
    if (valor >= 1 && valor <= this.totalPaginas) {
      this.pagina = valor;
    }
  }
}
