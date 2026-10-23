import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize } from 'rxjs';
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';

import { CitaService } from './service/cita.service';
import { ClienteService } from '../cliente/service/cliente.service';
import { MedicosServiceService } from '../medicos/service/medicos-service.service';
import { Cita, ESTADOS_CITA, ESTADOS_INICIALES_CITA, EstadoCita, TRANSICIONES_CITA } from 'src/app/models/cita';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';
import { Medico } from 'src/app/models/medico';
import { PaginaRs } from 'src/app/models/pagina';
import { CitaRq, MiRespuestaRS } from 'src/app/models/requests';
import { TablaPaginada } from 'src/app/shared/tabla-paginada';
import { PaginacionComponent } from 'src/app/shared/components/paginacion/paginacion.component';
import { ColumnaOrdenableComponent } from 'src/app/shared/components/columna-ordenable/columna-ordenable.component';
import { EstadoBadgeComponent } from 'src/app/shared/components/estado-badge/estado-badge.component';
import { CargandoComponent } from 'src/app/shared/components/cargando/cargando.component';
import { aFechaHoraBackend, aInputFechaHora, ahora, hoy, soloFecha, soloHora, unirFechaHora } from 'src/app/utils/fecha.util';
import { confirmar, notificarError, notificarExito } from 'src/app/utils/notificacion.util';
import { fechaHoraNoPasada, noSoloEspacios } from 'src/app/utils/validadores';

/**
 * Pantalla de gestión de citas médicas: listado paginado en el servidor con
 * filtros y ordenamiento, creación y edición con combos dependientes
 * (Cliente → Mascotas del cliente), detalle y cambios de estado.
 */
@Component({
  selector: 'app-cita',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PaginacionComponent, ColumnaOrdenableComponent,
    EstadoBadgeComponent, CargandoComponent],
  templateUrl: './cita.component.html',
  styleUrl: './cita.component.scss'
})
export class CitaComponent extends TablaPaginada<Cita> implements OnInit {
  /** Estados disponibles en el filtro. */
  readonly estados = ESTADOS_CITA;
  /** Estados con los que se puede crear una cita. */
  readonly estadosIniciales = ESTADOS_INICIALES_CITA;
  /** Texto de cada acción de cambio de estado. */
  readonly etiquetasAccion: Partial<Record<EstadoCita, string>> = {
    PROGRAMADA: 'Programar',
    CONFIRMADA: 'Confirmar',
    ATENDIDA: 'Marcar como atendida',
    CANCELADA: 'Cancelar cita'
  };
  /** Fecha mínima del formulario (hoy). */
  readonly fechaMinima = hoy();

  // Filtros del DataTable.
  filtroTexto = '';
  filtroEstado = '';
  filtroMedicoId: number | null = null;
  filtroDesde = '';
  filtroHasta = '';

  // Catálogos de los combos.
  clientes: Cliente[] = [];
  medicos: Medico[] = [];
  mascotasCliente: Mascota[] = [];
  cargandoMascotas = false;

  /** Formulario de creación/edición. */
  form: FormGroup;
  /** Cita que se está editando (null al crear). */
  citaEditada: Cita | null = null;
  /** Indica si se está enviando el formulario. */
  guardando = false;
  /** Cita mostrada en el modal de detalle. */
  citaDetalle: Cita | null = null;
  /** Indica si se está consultando el detalle. */
  cargandoDetalle = false;

  protected readonly mensajeErrorConsulta = 'No fue posible consultar las citas.';

  constructor(
    private readonly citaService: CitaService,
    private readonly clienteService: ClienteService,
    private readonly medicosService: MedicosServiceService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router
  ) {
    super({ columna: 'fecha', direccion: 'desc' });
    this.form = this.formBuilder.group({
      clienteId: [null, Validators.required],
      mascotaId: [{ value: null, disabled: true }, Validators.required],
      medicoId: [null, Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      motivo: ['', [Validators.required, Validators.maxLength(255), noSoloEspacios]],
      estado: ['PENDIENTE', Validators.required]
    }, { validators: fechaHoraNoPasada('fecha', 'hora', () => this.citaEditada?.fechaCita ?? null) });

    // Combo dependiente: al cambiar el cliente se consultan solo sus mascotas.
    this.form.get('clienteId')!.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((clienteId: number | null) => this.cargarMascotasCliente(clienteId));
  }

  /** Carga el listado y los catálogos al abrir la pantalla. */
  ngOnInit(): void {
    this.cargar();
    this.cargarCatalogos();
  }

  /** Acceso corto a los controles del formulario desde la plantilla. */
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /** {@inheritDoc} */
  protected consultar(params: HttpParams): Observable<PaginaRs<Cita>> {
    return this.citaService.listar(params);
  }

  /** {@inheritDoc} */
  protected filtros(): Record<string, unknown> {
    return {
      texto: this.filtroTexto,
      estado: this.filtroEstado,
      medicoId: this.filtroMedicoId,
      fechaDesde: this.filtroDesde,
      fechaHasta: this.filtroHasta
    };
  }

  /** Quita todos los filtros y vuelve al orden inicial. */
  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroEstado = '';
    this.filtroMedicoId = null;
    this.filtroDesde = '';
    this.filtroHasta = '';
    this.restablecerOrden();
    this.buscar();
  }

  /** Carga clientes y veterinarios para los combos. */
  private cargarCatalogos(): void {
    this.clienteService.getClientes().subscribe({
      next: (clientes) => this.clientes = clientes.filter((cliente) => cliente.activo !== false),
      error: (error) => notificarError(error, 'No fue posible cargar los clientes.')
    });
    this.medicosService.getMedicos().subscribe({
      next: (medicos) => this.medicos = medicos,
      error: (error) => notificarError(error, 'No fue posible cargar los veterinarios.')
    });
  }

  /**
   * Consulta las mascotas del cliente seleccionado y limpia la mascota elegida,
   * así nunca queda seleccionada una mascota de otro cliente.
   * @param clienteId Cliente seleccionado.
   */
  private cargarMascotasCliente(clienteId: number | null): void {
    const mascota = this.form.get('mascotaId')!;
    mascota.reset(null);
    this.mascotasCliente = [];
    if (!clienteId) {
      mascota.disable();
      return;
    }
    this.cargandoMascotas = true;
    this.clienteService.getMascotasCliente(clienteId)
      .pipe(finalize(() => this.cargandoMascotas = false))
      .subscribe({
        next: (mascotas) => {
          this.mascotasCliente = mascotas;
          mascota.enable();
        },
        error: (error) => notificarError(error, 'No fue posible cargar las mascotas del cliente.')
      });
  }

  /** Abre el formulario para crear una cita. */
  nuevaCita(): void {
    this.citaEditada = null;
    this.form.reset({ estado: 'PENDIENTE' });
    this.form.get('clienteId')!.enable({ emitEvent: false });
    this.form.get('estado')!.enable();
    this.abrirModal('modalFormularioCita');
  }

  /**
   * Abre el formulario para editar una cita activa. El cliente, la mascota y el
   * estado no se editan aquí (ver restricciones en el backend).
   * @param cita Cita a editar.
   */
  editarCita(cita: Cita): void {
    this.citaEditada = cita;
    this.mascotasCliente = [cita.mascota];
    this.form.reset({
      clienteId: cita.mascota.cliente?.id,
      mascotaId: cita.mascota.mascotaId,
      medicoId: cita.medico.id,
      fecha: soloFecha(cita.fechaCita),
      hora: soloHora(cita.fechaCita),
      motivo: cita.motivo,
      estado: cita.estado
    }, { emitEvent: false });
    this.form.get('clienteId')!.disable({ emitEvent: false });
    this.form.get('mascotaId')!.disable();
    this.form.get('estado')!.disable();
    this.form.updateValueAndValidity();
    this.abrirModal('modalFormularioCita');
  }

  /** Envía el formulario al backend (crear o editar). */
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.getRawValue();
    const rq: CitaRq = {
      clienteId: valores.clienteId,
      mascotaId: valores.mascotaId,
      medicoId: valores.medicoId,
      fechaCita: unirFechaHora(valores.fecha, valores.hora),
      motivo: valores.motivo.trim(),
      estado: this.citaEditada ? undefined : valores.estado
    };
    const peticion: Observable<MiRespuestaRS> = this.citaEditada
      ? this.citaService.editar(this.citaEditada.citaId, rq)
      : this.citaService.crear(rq);

    this.guardando = true;
    peticion.pipe(finalize(() => this.guardando = false)).subscribe({
      next: (respuesta) => {
        notificarExito(respuesta.message);
        this.cerrarModal('modalFormularioCita');
        this.cargar();
      },
      error: (error) => notificarError(error, 'No fue posible guardar la cita.')
    });
  }

  /**
   * Consulta y muestra el detalle completo de una cita.
   * @param cita Cita seleccionada en la tabla.
   */
  verDetalle(cita: Cita): void {
    this.citaDetalle = null;
    this.cargandoDetalle = true;
    this.abrirModal('modalDetalleCita');
    this.citaService.consultar(cita.citaId).pipe(finalize(() => this.cargandoDetalle = false)).subscribe({
      next: (detalle) => this.citaDetalle = detalle,
      error: (error) => {
        this.cerrarModal('modalDetalleCita');
        notificarError(error, 'No fue posible consultar la cita.');
      }
    });
  }

  /**
   * Indica si la información de la cita aún se puede editar.
   * @param cita Cita a evaluar.
   * @returns true si no está atendida ni cancelada.
   */
  esModificable(cita: Cita): boolean {
    return cita.estado !== 'ATENDIDA' && cita.estado !== 'CANCELADA';
  }

  /**
   * Estados a los que puede pasar la cita (mismas transiciones del backend).
   * @param cita Cita a evaluar.
   * @returns Estados destino permitidos.
   */
  accionesEstado(cita: Cita): EstadoCita[] {
    return TRANSICIONES_CITA[cita.estado];
  }

  /**
   * Cambia el estado de una cita previa confirmación. Si queda atendida,
   * ofrece registrar de inmediato su historia clínica.
   * @param cita Cita a modificar.
   * @param estado Nuevo estado.
   */
  async cambiarEstado(cita: Cita, estado: EstadoCita): Promise<void> {
    const aceptado = await confirmar(`${this.etiquetasAccion[estado]}?`,
      `La cita de ${cita.mascota.nombreMascota} quedará en estado ${estado}.`);
    if (!aceptado) {
      return;
    }
    this.citaService.cambiarEstado(cita.citaId, estado).subscribe({
      next: async (respuesta) => {
        this.cargar();
        if (estado !== 'ATENDIDA') {
          notificarExito(respuesta.message);
          return;
        }
        const registrar = await confirmar('Cita atendida',
          '¿Desea registrar ahora la historia clínica de esta consulta?', 'Registrar historia');
        if (registrar) {
          this.router.navigate(['/inicio/historias-medicas'], { queryParams: { citaId: cita.citaId } });
        }
      },
      error: (error) => notificarError(error, 'No fue posible cambiar el estado de la cita.')
    });
  }

  /**
   * Reactiva una cita cancelada (operación explícita). Pide la nueva fecha y hora.
   * @param cita Cita cancelada.
   */
  async reactivar(cita: Cita): Promise<void> {
    const fechaOriginal = aInputFechaHora(cita.fechaCita);
    const resultado = await Swal.fire({
      title: 'Reactivar cita',
      text: 'La cita volverá a estado PENDIENTE. Confirme la fecha y hora:',
      input: 'datetime-local',
      inputValue: fechaOriginal > ahora() ? fechaOriginal : '',
      inputAttributes: { min: ahora() },
      showCancelButton: true,
      confirmButtonText: 'Reactivar',
      cancelButtonText: 'Cancelar',
      inputValidator: (valor) => {
        if (!valor) {
          return 'Seleccione la fecha y hora.';
        }
        return valor < ahora() ? 'La fecha y hora no puede ser anterior a la actual.' : null;
      }
    });
    if (!resultado.isConfirmed) {
      return;
    }
    this.citaService.reactivar(cita.citaId, aFechaHoraBackend(resultado.value)).subscribe({
      next: (respuesta) => {
        notificarExito(respuesta.message);
        this.cargar();
      },
      error: (error) => notificarError(error, 'No fue posible reactivar la cita.')
    });
  }

  /**
   * Muestra un modal de Bootstrap.
   * @param id Id del elemento del modal.
   */
  private abrirModal(id: string): void {
    const elemento = document.getElementById(id);
    if (elemento) {
      Modal.getOrCreateInstance(elemento).show();
    }
  }

  /**
   * Oculta un modal de Bootstrap.
   * @param id Id del elemento del modal.
   */
  cerrarModal(id: string): void {
    const elemento = document.getElementById(id);
    if (elemento) {
      Modal.getOrCreateInstance(elemento).hide();
    }
  }
}
