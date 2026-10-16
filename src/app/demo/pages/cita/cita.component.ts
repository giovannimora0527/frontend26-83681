import { CommonModule, formatDate } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';

import { Cita } from 'src/app/models/cita';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';
import { Medico } from 'src/app/models/medico';
import { ClienteService } from '../cliente/service/cliente.service';
import { MascotaService } from '../mascota/service/mascota.service';
import { MedicoService } from '../medico/service/medico.service';
import { CitaService } from './service/cita.service';

type ColumnaOrden = 'fechaHora' | 'cliente' | 'mascota' | 'medico' | 'estado';

@Component({
  selector: 'app-cita',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cita.component.html',
  styleUrl: './cita.component.scss'
})
export class CitaComponent {
  citas: Cita[] = [];
  clientes: Cliente[] = [];
  mascotas: Mascota[] = [];
  medicos: Medico[] = [];

  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 5;
  readonly estados = ['PENDIENTE', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA', 'PROGRAMADA'];

  columnaOrden: ColumnaOrden = 'mascota';
  direccionOrden: 'asc' | 'desc' = 'desc';
  formulario!: FormGroup;
  citaSeleccionada: Cita | null = null;
  detalle: Cita | null = null;
  enviando = false;
  cargando = false;
  errorLista = '';
  errorFormulario = '';
  modoFormulario: 'C' | 'E' = 'C';
  modalFormulario: Modal | null = null;
  modalDetalle: Modal | null = null;
  private solicitudMascotas = 0;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly citaService: CitaService,
    private readonly clienteService: ClienteService,
    private readonly mascotaService: MascotaService,
    private readonly medicoService: MedicoService
  ) {
    this.inicializarFormulario();
    this.cargarCitas();
    this.cargarCatalogos();
    this.formulario.controls['clienteId'].valueChanges.subscribe((id) => {
      this.cargarMascotasCliente(id == null ? null : Number(id));
    });
  }

  inicializarFormulario(): void {
    this.formulario = this.formBuilder.group({
      clienteId: [null, Validators.required],
      mascotaId: [{ value: null, disabled: true }, Validators.required],
      medicoId: [null, Validators.required],
      fechaHora: ['', Validators.required],
      motivo: ['', [Validators.required, Validators.maxLength(1000)]],
      estado: ['PROGRAMADA', Validators.required]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.formulario.controls;
  }

  private cargarCatalogos(): void {
    this.clienteService.listarClientes().subscribe({
      next: (data) => this.clientes = data ?? [],
      error: () => this.errorFormulario = 'No fue posible cargar los clientes.'
    });
    this.medicoService.listar().subscribe({
      next: (data) => this.medicos = data ?? [],
      error: () => this.errorFormulario = 'No fue posible cargar los veterinarios.'
    });
  }

  private cargarMascotasCliente(
    clienteId: number | null,
    mascotaIdSeleccionada?: number
  ): void {
    const solicitud = ++this.solicitudMascotas;
    this.f['mascotaId'].setValue(null);
    if (clienteId == null) {
      this.mascotas = [];
      this.f['mascotaId'].disable();
      return;
    }

    this.f['mascotaId'].enable();
    this.mascotaService.listarMascotasPorCliente(clienteId).subscribe({
      next: (data) => {
        if (solicitud !== this.solicitudMascotas) return;
        this.mascotas = data ?? [];
        if (mascotaIdSeleccionada != null && this.mascotas.some((m) => Number(m.mascotaId) === Number(mascotaIdSeleccionada))) {
          this.f['mascotaId'].setValue(mascotaIdSeleccionada);
        }
      },
      error: () => {
        if (solicitud === this.solicitudMascotas) {
          this.mascotas = [];
          this.errorFormulario = 'No fue posible cargar las mascotas de ese cliente.';
        }
      }
    });
  }

  cargarCitas(): void {
    this.cargando = true;
    this.errorLista = '';
    this.citaService.listarCitas().subscribe({
      next: (data) => {
        this.citas = data ?? [];
        this.paginaActual = 1;
        this.cargando = false;
      },
      error: (error) => {
        this.errorLista = this.mensajeError(error, 'No fue posible cargar las citas.');
        this.cargando = false;
      }
    });
  }

  get citasFiltradas(): Cita[] {
    const termino = this.normalizar(this.terminoBusqueda.trim());
    const filtradas = this.citas.filter((cita) => {
      if (!termino) return true;
      const valores = [
        this.formatearFecha(cita.fechaHora),
        cita.fechaHora,
        cita.estado,
        cita.motivo,
        cita.cliente?.nombres,
        cita.cliente?.apellidos,
        cita.mascota?.nombreMascota,
        cita.medico?.nombres,
        cita.medico?.apellidos
      ];
      return valores.some((valor) =>
        this.normalizar(String(valor ?? '')).includes(termino)
      );
    });

    return [...filtradas].sort((a, b) => {
      const valorA = this.valorOrden(a, this.columnaOrden);
      const valorB = this.valorOrden(b, this.columnaOrden);
      const comparacion = typeof valorA === 'number' && typeof valorB === 'number'
        ? valorA - valorB
        : String(valorA).localeCompare(String(valorB), 'es', {
            numeric: true,
            sensitivity: 'base'
          });
      return this.direccionOrden === 'asc' ? comparacion : -comparacion;
    });
  }

  private valorOrden(cita: Cita, columna: ColumnaOrden): string | number {
    switch (columna) {
      case 'fechaHora': return this.aTiempo(cita.fechaHora);
      case 'cliente': return `${cita.cliente?.nombres ?? ''} ${cita.cliente?.apellidos ?? ''}`;
      case 'mascota': return cita.mascota?.nombreMascota ?? '';
      case 'medico': return `${cita.medico?.nombres ?? ''} ${cita.medico?.apellidos ?? ''}`;
      case 'estado': return cita.estado ?? '';
    }
  }

  ordenarPor(columna: ColumnaOrden): void {
    if (this.columnaOrden === columna) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.columnaOrden = columna;
      this.direccionOrden = columna === 'fechaHora' ? 'desc' : 'asc';
    }
    this.paginaActual = 1;
  }

  get citasPaginadas(): Cita[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.citasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.citasFiltradas.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  actualizarBusqueda(event: Event): void {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) this.paginaActual = pagina;
  }

  nuevaCita(): void {
    this.modoFormulario = 'C';
    this.citaSeleccionada = null;
    this.errorFormulario = '';
    this.formulario.reset({
      clienteId: null,
      mascotaId: null,
      medicoId: null,
      fechaHora: '',
      motivo: '',
      estado: 'PROGRAMADA'
    });
    this.mascotas = [];
    this.f['mascotaId'].disable();
    this.abrirModal('modalCita', 'formulario');
  }

  editarCita(cita: Cita): void {
    if (this.noEditable(cita)) return;
    this.modoFormulario = 'E';
    this.citaSeleccionada = cita;
    this.errorFormulario = '';
    const clienteId = cita.cliente?.id ?? cita.mascota?.cliente?.id ?? null;
    this.formulario.patchValue({
      clienteId,
      medicoId: cita.medico?.id ?? null,
      fechaHora: this.fechaParaInput(cita.fechaHora),
      motivo: cita.motivo ?? '',
      estado: cita.estado ?? 'PROGRAMADA'
    }, { emitEvent: false });
    this.cargarMascotasCliente(
      clienteId == null ? null : Number(clienteId),
      cita.mascota?.mascotaId
    );
    this.abrirModal('modalCita', 'formulario');
  }

  guardarCita(): void {
    if (this.formulario.invalid || this.enviando) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valor = this.formulario.getRawValue();
    const clienteId = Number(valor.clienteId);
    const mascotaId = Number(valor.mascotaId);
    const medicoId = Number(valor.medicoId);
    const mascota = this.mascotas.find(
      (item) => Number(item.mascotaId) === mascotaId
    );
    const medicoExiste = this.medicos.some((item) => Number(item.id) === medicoId);

    if (!mascota || Number(mascota.cliente?.id) !== clienteId) {
      this.errorFormulario = 'Selecciona una mascota que pertenezca al cliente.';
      return;
    }
    if (!medicoExiste) {
      this.errorFormulario = 'Selecciona un veterinario válido.';
      return;
    }

    const fechaHora = String(valor.fechaHora);
    const tiempo = this.aTiempo(fechaHora);
    if (!tiempo || tiempo < Date.now()) {
      this.errorFormulario = 'La fecha y hora de la cita deben ser actuales o futuras.';
      return;
    }

    const conflicto = this.citas.some((otra) => {
      if (Number(otra.id) === Number(this.citaSeleccionada?.id)) return false;
      if ((otra.estado ?? '').toUpperCase() === 'CANCELADA') return false;
      const diferencia = Math.abs(this.aTiempo(otra.fechaHora) - tiempo);
      const mismoMedico = Number(otra.medico?.id) === medicoId;
      const mismaMascota = Number(otra.mascota?.mascotaId) === mascotaId;
      return (mismoMedico && diferencia <= 15 * 60 * 1000) || (mismaMascota && diferencia === 0);
    });
    if (conflicto) {
      this.errorFormulario = 'La mascota o el veterinario ya tienen una cita en ese horario.';
      return;
    }

    // Se envía el cliente para que el backend valide su relación con la mascota.
    const solicitud: Cita = {
      id: this.citaSeleccionada?.id,
      clienteId,
      mascotaId,
      medicoId,
      fechaHora,
      motivo: String(valor.motivo).trim(),
      estado: String(valor.estado)
    };

    this.enviando = true;
    this.errorFormulario = '';
    const operacion = this.modoFormulario === 'C'
      ? this.citaService.crearCita(solicitud)
      : this.citaService.actualizarCita(solicitud);

    operacion.subscribe({
      next: (respuesta) => {
        this.enviando = false;
        const mensaje = this.obtenerMensaje(
          respuesta,
          this.modoFormulario === 'C'
            ? 'La cita fue creada correctamente.'
            : 'La cita fue actualizada correctamente.'
        );
        this.cerrarModal('formulario');
        this.cargarCitas();
        Swal.fire('Operación exitosa', mensaje, 'success');
      },
      error: (error) => {
        this.enviando = false;
        this.errorFormulario = this.mensajeError(error, 'No fue posible guardar la cita.');
      }
    });
  }

  verDetalle(cita: Cita): void {
    this.detalle = cita;
    this.abrirModal('modalDetalleCita', 'detalle');
  }

  noEditable(cita: Cita): boolean {
    return ['CANCELADA', 'ATENDIDA'].includes((cita.estado ?? '').toUpperCase());
  }

  textoCliente(cita: Cita): string {
    return `${cita.cliente?.nombres ?? ''} ${cita.cliente?.apellidos ?? ''}`.trim() || '—';
  }

  textoMedico(cita: Cita): string {
    return `${cita.medico?.nombres ?? ''} ${cita.medico?.apellidos ?? ''}`.trim() || '—';
  }

  formatearFecha(fecha: Date | string | undefined): string {
    const tiempo = this.aTiempo(fecha);
    return tiempo ? formatDate(tiempo, 'dd/MM/yyyy HH:mm', 'en-US') : '—';
  }

  get fechaMinima(): string {
    const ahora = new Date();
    const pad = (numero: number) => String(numero).padStart(2, '0');
    return `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}T${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
  }

  private fechaParaInput(fecha: Date | string | undefined): string {
    if (!fecha) return '';
    const date = this.fechaComoDate(fecha);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (numero: number) => String(numero).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private aTiempo(fecha: Date | string | undefined): number {
    if (!fecha) return 0;
    const tiempo = this.fechaComoDate(fecha).getTime();
    return Number.isNaN(tiempo) ? 0 : tiempo;
  }

  private fechaComoDate(fecha: Date | string): Date {
    return fecha instanceof Date ? fecha : new Date(String(fecha).replace(' ', 'T'));
  }

  private normalizar(texto: string): string {
    return texto.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private abrirModal(id: string, tipo: 'formulario' | 'detalle'): void {
    const elemento = document.getElementById(id);
    if (!elemento) return;
    const modal = Modal.getOrCreateInstance(elemento);
    if (tipo === 'formulario') this.modalFormulario = modal;
    else this.modalDetalle = modal;
    modal.show();
  }

  cerrarModal(tipo: 'formulario' | 'detalle'): void {
    if (tipo === 'formulario') {
      this.modalFormulario?.hide();
      this.formulario.markAsPristine();
      this.formulario.markAsUntouched();
      this.errorFormulario = '';
    } else {
      this.modalDetalle?.hide();
    }
  }

  private obtenerMensaje(respuesta: unknown, predeterminado: string): string {
    if (respuesta && typeof respuesta === 'object') {
      const cuerpo = respuesta as { message?: unknown; mensaje?: unknown };
      const mensaje = cuerpo.message ?? cuerpo.mensaje;
      if (typeof mensaje === 'string') return mensaje;
    }
    return predeterminado;
  }

  private mensajeError(error: unknown, predeterminado: string): string {
    if (error && typeof error === 'object') {
      const respuesta = error as { error?: { message?: unknown; mensaje?: unknown }; message?: unknown };
      const mensaje = respuesta.error?.message ?? respuesta.error?.mensaje ?? respuesta.message;
      if (typeof mensaje === 'string' && mensaje.trim()) return mensaje;
    }
    return predeterminado;
  }
}
