import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge, Subscription } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import Swal from 'sweetalert2';
import { Cita } from 'src/app/models/cita';
import { CitaService } from './service/cita.service';
import { Mascota } from 'src/app/models/mascota';
import { Medico } from 'src/app/models/medico';
import { MascotaService } from '../mascota/service/mascota.service';
import { MedicoService } from '../medico/service/medico.service';
import { hoyBogota } from '../gestion-clinica/clinica-api.service';

/** Enumera las columnas por las que se puede ordenar la tabla. */
type ColumnaOrden = 'mascota' | 'medico' | 'fechaHora' | 'motivo' | 'estado';
/** Define las acciones que usa la pantalla para abrir y cerrar una ventana. */
type ModalBootstrap = {
  /** Abre la ventana. */
  show(): void;
  /** Cierra la ventana. */
  hide(): void;
};
/** Describe dónde se encuentra Bootstrap en la ventana del navegador. */
type WindowBootstrap = Window & { bootstrap: { Modal: new (element: Element) => ModalBootstrap } };



/** Presenta la pantalla de citas y gestiona sus acciones. */
@Component({
  selector: 'app-cita',
  imports: [CommonModule, ReactiveFormsModule, NgbTooltipModule],
  templateUrl: './cita.component.html',
  styleUrl: './cita.component.scss'
})
export class CitaComponent {

  // Variables para el modal.
  modalInstance: ModalBootstrap | null = null;
  modalDetalleInstance: ModalBootstrap | null = null;
  citaDetalle: Cita | null = null;
  historial: Cita[] | null = null;
  errorHistorial = '';
  cargandoHistorial = false;
  private consultaHistorial?: Subscription;
  readonly duracionPredeterminada = 30;
  titleModal: string = "";
  modoFormulario: string = "";
  titleBoton: string = "";


  // Variables para la paginación, ordenamiento y búsqueda en la datatable.
  listEspecializaciones: Cita[] = [];
  listMascotas: Mascota[] = [];
  listMedicos: Medico[] = [];
  cargandoMascotas = false;
  cargandoMedicos = false;
  errorMascotas = '';
  errorMedicos = '';
  errorCitas = '';
  disponibilidadConsultada = false;
  private consultaMedicos?: Subscription;
  private readonly destroyRef = inject(DestroyRef);
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 5;
  columnaOrden: ColumnaOrden = 'mascota';
  direccionOrden: 'asc' | 'desc' = 'asc';

  // Formulario para crear o editar especializacion.
  form!: FormGroup;
  citaSelected: Cita | null = null;
  enviando = false;
  respuestaError = '';

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private readonly citaService: CitaService,    
    private readonly formBuilder: FormBuilder,
    private readonly mascotaService: MascotaService,
    private readonly medicoService: MedicoService) {
    this.inicializarFormulario();
    this.listarCitas();
    this.listarMascotas();
  }

  /** Prepara los campos de la cita y reinicia la consulta de veterinarios al cambiar la mascota, la fecha o la duración. */
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      mascota: [null, Validators.required],
      medico: [null, Validators.required],
      fechaHora: [null, [
        Validators.required,
        (control: AbstractControl) => control.value && Number.isNaN(new Date(control.value).getTime())
          ? { fechaInvalida: true } : null,
        (control: AbstractControl) => control.value && control.value < this.inicioMinimoCita
          ? { diaAnterior: true } : null
      ]],
      motivo: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(255)]],
      estado: ['', Validators.required],
      duracionMinutos: [this.duracionPredeterminada, [Validators.required, Validators.min(1),
        (control: AbstractControl) => Number.isInteger(control.value) ? null : { entero: true }]],
      motivoCancelacion: [''],
    });
    merge(...['fechaHora', 'duracionMinutos', 'mascota'].map((campo) => this.form.controls[campo].valueChanges)).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.consultaMedicos?.unsubscribe();
      this.cargandoMedicos = false;
      this.disponibilidadConsultada = false;
      this.errorMedicos = '';
      this.listMedicos = [];
      this.form.controls['medico'].reset();
    });
  }

  /** Consulta las citas. */
  listarCitas() {
    this.errorCitas = '';
    this.citaService.listarCitas().subscribe({
      next: (citas) => {
        this.listEspecializaciones = citas;
        this.paginaActual = Math.min(this.paginaActual, this.totalPaginas || 1);
      },
      error: (err) => {
        this.errorCitas = this.mensajeErrorCarga(err, 'las citas');
        console.error('Error al listar citas:', err);
      }
    });
  }

  /** Traduce fallos HTTP comunes para que se distinga una sesión inválida de un backend caído. */
  private mensajeErrorCarga(error: { status?: number; error?: { mensaje?: string; message?: string } }, recurso: string): string {
    if (error.status === 0) {
      return `No fue posible conectar con el servidor para cargar ${recurso}. Verifica que el backend esté activo.`;
    }
    if (error.status === 401) {
      return `La sesión venció o no es válida. Inicia sesión nuevamente para cargar ${recurso}.`;
    }
    if (error.status === 403) {
      return `Tu rol no tiene permiso para consultar ${recurso}.`;
    }
    const detalle = error.error?.mensaje ?? error.error?.message;
    return detalle
      ? `No fue posible cargar ${recurso}: ${detalle}`
      : `No fue posible cargar ${recurso} (HTTP ${error.status ?? 'desconocido'}).`;
  }

  /** Consulta las mascotas. */
  listarMascotas(): void {
    this.cargandoMascotas = true;
    this.errorMascotas = '';
    this.mascotaService.listarMascotas().subscribe({
      next: (mascotas) => {
        this.listMascotas = mascotas;
        this.cargandoMascotas = false;
      },
      error: (error) => {
        this.cargandoMascotas = false;
        this.errorMascotas = 'No fue posible cargar las mascotas.';
        console.error('Error al listar mascotas:', error);
      }
    });
  }

  /** Usa el inicio del día actual en Bogotá como límite del calendario. */
  get inicioMinimoCita(): string {
    return hoyBogota() + 'T00:00';
  }

  /** Devuelve el inicio del rango elegido. */
  get fechaInicio(): Date | null {
    const control = this.form.controls['fechaHora'];
    return control.valid && control.value ? new Date(control.value) : null;
  }

  /** Devuelve el final del rango elegido. */
  get fechaFin(): Date | null {
    const inicio = this.fechaInicio;
    const duracion = this.form.controls['duracionMinutos'];
    return inicio && duracion.valid ? new Date(inicio.getTime() + duracion.value * 60_000) : null;
  }

  /** Consulta qué veterinarios pueden atender a la mascota en el horario indicado. */
  consultarMedicosDisponibles(): void {
    this.form.controls['fechaHora'].updateValueAndValidity({ emitEvent: false });
    const inicio = this.fechaInicio;
    const fin = this.fechaFin;
    if (!inicio || !fin) {
      this.form.controls['fechaHora'].markAsTouched();
      return;
    }
    if (this.cargandoMedicos || this.enviando) {
      return;
    }
    this.listarMedicosDisponiblesPorFecha(inicio, fin);
  }

  /** Solicita los veterinarios disponibles para la fecha indicada. */
  listarMedicosDisponiblesPorFecha(fechaInicio: Date, fechaFin: Date): void {
    this.consultaMedicos?.unsubscribe();
    this.listMedicos = [];
    this.form.controls['medico'].reset();
    this.disponibilidadConsultada = false;
    this.cargandoMedicos = true;
    this.errorMedicos = '';
    this.consultaMedicos = this.medicoService
      .listarMedicosDisponiblesPorFecha(fechaInicio, fechaFin, this.citaSelected?.id, this.form.controls['mascota'].value?.mascotaId)
      .pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (medicos) => {
        this.listMedicos = medicos;
        this.cargandoMedicos = false;
        this.disponibilidadConsultada = true;
      },
      error: (error) => {
        this.cargandoMedicos = false;
        this.errorMedicos = 'No fue posible cargar los médicos disponibles.';
        console.error('Error al listar médicos disponibles:', error);
      }
    });
  }

  /** Comprueba si dos opciones representan a la misma mascota. */
  compararMascotas(mascotaA: Mascota | null, mascotaB: Mascota | null): boolean {
    return mascotaA === mascotaB ||
      (mascotaA?.mascotaId != null && mascotaA.mascotaId === mascotaB?.mascotaId);
  }

  /** Comprueba si dos opciones representan al mismo veterinario. */
  compararMedicos(medicoA: Medico | null, medicoB: Medico | null): boolean {
    return medicoA === medicoB || (medicoA?.id != null && medicoA.id === medicoB?.id);
  }

  // Obtiene los controles del formulario para facilitar el acceso a sus propiedades y métodos.
  /** Da acceso a los controles del formulario para consultar su valor y sus errores. */
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /**
   * Filtra la lista de citas según el término de búsqueda ingresado por el usuario.
   * @returns Un arreglo de citas filtradas.
   */
  get citasFiltradas(): Cita[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    const filtradas = this.listEspecializaciones.filter((cita) => {
      if (!termino) {
        return true;
      }

      const valores = [
        this.obtenerValorOrden(cita, 'mascota'),
        this.obtenerValorOrden(cita, 'medico'),
        this.obtenerValorOrden(cita, 'fechaHora'),
        cita.motivo,
        cita.estado
      ];

      return valores.some((valor) =>
        this.normalizarTexto(String(valor ?? '')).includes(termino)
      );
    });

    return [...filtradas].sort((citaA, citaB) => {
      const valorA = this.obtenerValorOrden(citaA, this.columnaOrden);
      const valorB = this.obtenerValorOrden(citaB, this.columnaOrden);
      const comparacion = typeof valorA === 'number' && typeof valorB === 'number'
        ? valorA - valorB
        : String(valorA).localeCompare(String(valorB), 'es', { numeric: true, sensitivity: 'base' });

      return this.direccionOrden === 'asc' ? comparacion : -comparacion;
    });
  }

  /** Obtiene el valor de la columna que se usa para ordenar cada fila. */
  private obtenerValorOrden(cita: Cita, columna: ColumnaOrden): string | number {
    switch (columna) {
      case 'mascota':
        return cita.mascota?.nombreMascota ?? cita.mascota?.nombre ?? '';
      case 'medico':
        return  `${cita.medico?.nombres ?? ''} ${cita.medico?.apellidos ?? ''}`;
      case 'fechaHora':
        return cita.fechaHora ? formatDate(cita.fechaHora, 'yyyy-MM-dd HH:mm', 'en-US')
          : '';
      case 'motivo':
        return cita.motivo ?? '';
      case 'estado':
        return cita.estado ?? '';
    }
  }

  /** Cambia la columna de orden o invierte el sentido del orden actual. */
  ordenarPor(columna: ColumnaOrden): void {
    if (this.columnaOrden === columna) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.columnaOrden = columna;
      this.direccionOrden = 'asc';
    }
    this.paginaActual = 1;
  }

  /** Devuelve las citas que corresponden a la página visible. */
  get citasPaginadas(): Cita[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.citasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  /** Calcula cuántas páginas se necesitan para mostrar el listado. */
  get totalPaginas(): number {
    return Math.ceil(this.citasFiltradas.length / this.registrosPorPagina);
  }

  /** Devuelve los números de página disponibles para el listado. */
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  // Metodo que actualiza el termino de busqueda y reinicia la pagina actual a 1.
  /** Aplica el texto de búsqueda y vuelve a la primera página. */
  actualizarBusqueda(event: Event) {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  // Cambia paginacion.
  /** Muestra la página seleccionada del listado. */
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Metodo privado para normalizar el texto, eliminando acentos y convirtiendo a minúsculas.
  /** Prepara el texto para comparar búsquedas sin distinguir mayúsculas ni tildes. */
  private normalizarTexto(texto: string): string {
    return texto
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

   /**
     * Metodos para la gestion de especializaciones (crear, editar, guardar).
     */
  
    // Evento para abrir el modal de crear o editar especializacion, dependiendo del modo recibido.
    nuevaCita(modo: string) {
      this.titleModal = modo === 'C' ? 'Crear Cita' : 'Editar Cita';
      this.modoFormulario = modo;
      this.citaSelected = null;
      this.resetFormulario();
      this.form.controls['estado'].setValue('programada');
      this.openModal(modo);
    }  
   
  
    /** Muestra la información de la cita seleccionada. */
    verCita(cita: Cita): void {
      this.consultaHistorial?.unsubscribe();
      this.historial = null;
      this.errorHistorial = '';
      this.cargandoHistorial = false;
      this.citaDetalle = cita;
      const modalElement = document.getElementById('modalVerCita');
      if (modalElement) {
        this.modalDetalleInstance ??= new (window as unknown as WindowBootstrap).bootstrap.Modal(modalElement);
        this.modalDetalleInstance.show();
      }
    }

    /** Cierra el detalle y limpia la selección actual. */
    cerrarDetalle(): void {
      this.consultaHistorial?.unsubscribe();
      this.modalDetalleInstance?.hide();
    }

    /** Consulta el historial. */
    consultarHistorial(mascotaId: number): void {
      this.consultaHistorial?.unsubscribe();
      this.historial = null;
      this.errorHistorial = '';
      this.cargandoHistorial = true;
      this.consultaHistorial = this.citaService.listarCitasPorMascota(mascotaId)
        .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (citas) => { this.historial = citas; this.cargandoHistorial = false; },
          error: (error) => {
            this.errorHistorial = this.mensajeErrorCarga(error, 'el historial');
            this.cargandoHistorial = false;
          }
        });
    }

    /** Comprueba si la cita se encuentra en un estado que limita sus cambios. */
    esCitaCerrada(cita: Cita | null): boolean {
      return ['cancelada', 'atendida', 'no_asistida'].includes(cita?.estado?.trim().toLowerCase() ?? '');
    }

    /** Abre el formulario con los datos del registro que se quiere modificar. */
    abrirEdicion(cita: Cita) {
      if (this.esCitaCerrada(cita)) {
        Swal.fire('Cita cerrada', 'No se puede editar una cita cerrada.', 'warning');
        return;
      }
      this.resetFormulario();
      this.citaSelected = cita;
      this.modoFormulario = 'E';
      this.form.patchValue({
        fechaHora: cita.fechaHora ? formatDate(cita.fechaHora, "yyyy-MM-dd'T'HH:mm", 'en-US') : null,
        mascota: cita.mascota,
        medico: cita.medico,
        motivo: cita.motivo ?? null,
        duracionMinutos: cita.duracionMinutos ?? this.duracionPredeterminada,
        estado: cita.estado?.trim().toLowerCase() ?? null
      }, { emitEvent: false });
      this.listMedicos = cita.medico ? [cita.medico] : [];
      this.openModal(this.modoFormulario);
    }
  
    /**
     * 
     * @returns Acción realizada sobre la cita (crear o actualizar).
     */
    guardarCita() {
      if (this.modoFormulario === 'E' && this.esCitaCerrada(this.citaSelected)) {
        this.respuestaError = 'No se puede actualizar una cita cerrada.';
        return;
      }
      if (this.enviando) return;
      const valores = this.form.getRawValue();
      const estado = this.modoFormulario === 'C' || valores.estado?.trim().toUpperCase() === 'PENDIENTE'
        ? 'PROGRAMADA' : valores.estado?.trim().toUpperCase();
      const motivoCancelacion = valores.motivoCancelacion?.trim();
      if (estado === 'CANCELADA' && !motivoCancelacion) {
        this.respuestaError = 'Indica el motivo de cancelación.';
        return;
      }
      this.form.controls['fechaHora'].updateValueAndValidity({ emitEvent: false });
      if (estado !== 'CANCELADA' && this.form.invalid) {
        this.form.markAllAsTouched();
        return;
      }
  
      const cita: Cita = {
        id: this.citaSelected?.id,
        mascotaId: valores.mascota?.mascotaId,
        medicoId: valores.medico?.id,
        fechaHora: valores.fechaHora,
        motivo: valores.motivo ?? null,
        estado,
        duracionMinutos: valores.duracionMinutos,
        motivoCancelacion: estado === 'CANCELADA' ? motivoCancelacion : undefined
      };
  
      this.enviando = true;
      this.respuestaError = '';
      const solicitud = this.modoFormulario === 'C'
        ? this.citaService.guardarCita(cita)
        : this.citaService.actualizarCita(cita);
  
      solicitud.subscribe({
        next: (respuesta) => {
          this.enviando = false;
          const mensaje = this.obtenerMensajeRespuesta(
            respuesta,
            this.modoFormulario === 'C' ? 'La cita fue creada correctamente.' : 'La cita fue actualizada correctamente.'
          );
          this.closeModal();
          this.listarCitas();
          Swal.fire('Operación exitosa', mensaje, 'success');
        },
        error: (error) => {
          this.enviando = false;
          console.error('Error al guardar la cita:', error);
          this.respuestaError = error.error?.mensaje ?? error.error?.message ?? error.message ??
            'No fue posible guardar la cita.';
        }
      });
    }
  
    /** Obtiene el mensaje que devuelve el servidor para mostrarlo en pantalla. */
    private obtenerMensajeRespuesta(respuesta: unknown, mensajePredeterminado: string): string {
      if (respuesta && typeof respuesta === 'object') {
        const cuerpo = respuesta as { mensaje?: unknown; message?: unknown };
        const mensaje = cuerpo.mensaje ?? cuerpo.message;
        if (typeof mensaje === 'string') {
          return mensaje;
        }
      }
      return mensajePredeterminado;
    }


  /** Restablece los campos y la selección del formulario. */
  resetFormulario() {
    this.form.reset({ duracionMinutos: this.duracionPredeterminada });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.respuestaError = '';
  }


  /** Cierra la ventana indicada. */
  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.resetFormulario();
  }

  /** Abre la ventana indicada. */
  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Cita' : 'Editar Cita';
    this.titleBoton = modo === 'C' ? 'Guardar Cita' : 'Actualizar Cita';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearCita');
    if (modalElement) {
      // Verificar si ya existe una instancia del modal
      this.modalInstance ??= new (window as unknown as WindowBootstrap).bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

}
