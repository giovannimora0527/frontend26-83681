<<<<<<< HEAD
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
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

type ColumnaOrden = 'mascota' | 'medico' | 'fechaHora' | 'motivo' | 'estado';
type ModalBootstrap = { show(): void; hide(): void };
type WindowBootstrap = Window & { bootstrap: { Modal: new (element: Element) => ModalBootstrap } };


=======
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertaComponent } from 'src/app/components/alerta/alerta.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { PaginadorComponent } from 'src/app/components/paginador/paginador.component';
import { ClienteResumen, MascotaResumen, VeterinarioResumen, nombreCompleto } from 'src/app/models/catalogos';
import { Cita, CitaRq, ESTADOS_CITA, FiltrosCita } from 'src/app/models/cita';
import { DireccionOrden, Pagina } from 'src/app/models/pagina';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { mensajeDeError } from 'src/app/services/api.util';
import { CitaService } from './service/cita.service';
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3

/** Mensaje mostrado en pantalla (éxito, advertencia o error). */
interface Aviso {
  tipo: 'success' | 'danger' | 'warning' | 'info';
  texto: string;
}

/**
 * Gestión de citas: listado paginado (DataTable) con filtros y orden en el servidor,
 * formulario con combos dependientes cliente → mascota, y acciones según el estado de la cita.
 */
@Component({
  selector: 'app-cita',
<<<<<<< HEAD
  imports: [CommonModule, ReactiveFormsModule, NgbTooltipModule],
=======
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertaComponent, ModalComponent, PaginadorComponent],
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
  templateUrl: './cita.component.html',
  styleUrl: './cita.component.scss'
})
export class CitaComponent {
  private readonly citaService = inject(CitaService);
  private readonly catalogo = inject(CatalogoService);

<<<<<<< HEAD
  // Variables para el modal.
  modalInstance: ModalBootstrap | null = null;
  modalDetalleInstance: ModalBootstrap | null = null;
  citaDetalle: Cita | null = null;
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

  constructor(private readonly citaService: CitaService,    
    private readonly formBuilder: FormBuilder,
    private readonly mascotaService: MascotaService,
    private readonly medicoService: MedicoService) {
    this.inicializarFormulario();
    this.listarCitas();
    this.listarMascotas();
  }

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      mascota: [null, Validators.required],
      medico: [null, Validators.required],
      fechaHora: [null, [
        Validators.required,
        (control: AbstractControl) => control.value && Number.isNaN(new Date(control.value).getTime())
          ? { fechaInvalida: true } : null
      ]],
      motivo: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(255)]],
      estado: ['', Validators.required],
    });
    this.form.controls['fechaHora'].valueChanges.pipe(
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

  listarCitas() {
    this.errorCitas = '';
    this.citaService.listarCitas().subscribe({
      next: (citas) => {
        this.listEspecializaciones = citas;
        this.paginaActual = Math.min(this.paginaActual, this.totalPaginas || 1);
      },
      error: (err) => {
        this.errorCitas = 'No fue posible cargar las citas.';
        console.error('Error al listar citas:', err);
      }
    });
  }

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

  get fechaInicio(): Date | null {
    const control = this.form.controls['fechaHora'];
    return control.valid && control.value ? new Date(control.value) : null;
  }

  get fechaFin(): Date | null {
    const inicio = this.fechaInicio;
    return inicio ? new Date(inicio.getTime() + 15 * 60 * 1000) : null;
  }

  consultarMedicosDisponibles(): void {
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

  listarMedicosDisponiblesPorFecha(fechaInicio: Date, fechaFin: Date): void {
    this.consultaMedicos?.unsubscribe();
    this.listMedicos = [];
    this.form.controls['medico'].reset();
    this.disponibilidadConsultada = false;
    this.cargandoMedicos = true;
    this.errorMedicos = '';
    this.consultaMedicos = this.medicoService
      .listarMedicosDisponiblesPorFecha(fechaInicio, fechaFin)
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

  compararMascotas(mascotaA: Mascota | null, mascotaB: Mascota | null): boolean {
    return mascotaA === mascotaB ||
      (mascotaA?.mascotaId != null && mascotaA.mascotaId === mascotaB?.mascotaId);
  }

  compararMedicos(medicoA: Medico | null, medicoB: Medico | null): boolean {
    return medicoA === medicoB || (medicoA?.id != null && medicoA.id === medicoB?.id);
  }

  // Obtiene los controles del formulario para facilitar el acceso a sus propiedades y métodos.
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

  ordenarPor(columna: ColumnaOrden): void {
    if (this.columnaOrden === columna) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.columnaOrden = columna;
      this.direccionOrden = 'asc';
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

  // Metodo que actualiza el termino de busqueda y reinicia la pagina actual a 1.
  actualizarBusqueda(event: Event) {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  // Cambia paginacion.
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Metodo privado para normalizar el texto, eliminando acentos y convirtiendo a minúsculas.
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
   
  
    verCita(cita: Cita): void {
      this.citaDetalle = cita;
      const modalElement = document.getElementById('modalVerCita');
      if (modalElement) {
        this.modalDetalleInstance ??= new (window as unknown as WindowBootstrap).bootstrap.Modal(modalElement);
        this.modalDetalleInstance.show();
      }
    }

    cerrarDetalle(): void {
      this.modalDetalleInstance?.hide();
    }

    esCitaCancelada(cita: Cita | null): boolean {
      return cita?.estado?.trim().toLowerCase() === 'cancelada';
    }

    abrirEdicion(cita: Cita) {
      if (this.esCitaCancelada(cita)) {
        Swal.fire('Cita cancelada', 'No se puede editar una cita cancelada.', 'warning');
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
        estado: cita.estado?.trim().toLowerCase() ?? null
      });
      this.listMedicos = cita.medico ? [cita.medico] : [];
      this.openModal(this.modoFormulario);
    }
  
    /**
     * 
     * @returns Acción realizada sobre la cita (crear o actualizar).
     */
    guardarCita() {
      if (this.modoFormulario === 'E' && this.esCitaCancelada(this.citaSelected)) {
        this.respuestaError = 'No se puede actualizar una cita cancelada.';
        return;
      }
      if (this.form.invalid || this.enviando) {
        this.form.markAllAsTouched();
        return;
      }
  
      const valores = this.form.getRawValue();
      const cita: Cita = {
        id: this.citaSelected?.id,
        mascotaId: valores.mascota.mascotaId,
        medicoId: valores.medico.id,
        fechaHora: valores.fechaHora,
        motivo: valores.motivo ?? null,
        estado: this.modoFormulario === 'C' ? 'programada' : valores.estado
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


  resetFormulario() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.respuestaError = '';
  }


  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.resetFormulario();
  }

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

=======
  /** Función expuesta a la plantilla para mostrar nombres completos. */
  readonly nombreCompleto = nombreCompleto;

  /** Estados válidos (vienen del modelo, igual que las reglas del backend). */
  readonly estados = ESTADOS_CITA;

  /** Fecha de hoy en formato yyyy-MM-dd (hora local) para restringir citas pasadas. */
  readonly hoy = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  /** Columnas del DataTable. Las que tienen campo se pueden ordenar en el servidor. */
  readonly columnas: { campo: string; etiqueta: string }[] = [
    { campo: 'fechaHora', etiqueta: 'Fecha' },
    { campo: 'fechaHora', etiqueta: 'Hora' },
    { campo: 'clienteId', etiqueta: 'Cliente' },
    { campo: 'mascotaId', etiqueta: 'Mascota' },
    { campo: 'medicoId', etiqueta: 'Veterinario' },
    { campo: 'estado', etiqueta: 'Estado' },
    { campo: 'motivo', etiqueta: 'Motivo' }
  ];

  readonly tamanio = 10;

  // ----- Listado -----
  citas: Cita[] = [];
  pagina = 0;
  totalPaginas = 0;
  totalRegistros = 0;
  campo = 'fechaHora';
  direccion: DireccionOrden = 'desc';
  cargando = false;
  aviso: Aviso | null = null;

  // ----- Catálogos -----
  clientes: ClienteResumen[] = [];
  veterinarios: VeterinarioResumen[] = [];
  mascotasFiltro: MascotaResumen[] = [];
  mascotasFormulario: MascotaResumen[] = [];

  // ----- Formularios -----
  readonly filtrosForm = new FormGroup({
    clienteId: new FormControl('', { nonNullable: true }),
    mascotaId: new FormControl('', { nonNullable: true }),
    medicoId: new FormControl('', { nonNullable: true }),
    estado: new FormControl('', { nonNullable: true }),
    fechaDesde: new FormControl('', { nonNullable: true }),
    fechaHasta: new FormControl('', { nonNullable: true }),
    texto: new FormControl('', { nonNullable: true })
  });

  readonly citaForm = new FormGroup({
    clienteId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    mascotaId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    medicoId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fecha: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    hora: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    motivo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] }),
    estado: new FormControl('Pendiente', { nonNullable: true, validators: [Validators.required] })
  });

  mostrarFormulario = false;
  editando: Cita | null = null;
  guardando = false;
  avisoFormulario: Aviso | null = null;

  /** Cita mostrada en el detalle "Ver"; null si el detalle está cerrado. */
  detalle: Cita | null = null;

  constructor() {
    // Combo dependiente del filtro: al cambiar el cliente se recargan solo sus mascotas.
    this.filtrosForm.controls.clienteId.valueChanges.pipe(takeUntilDestroyed()).subscribe(id => {
      this.filtrosForm.controls.mascotaId.setValue('', { emitEvent: false });
      this.mascotasFiltro = [];
      if (id) {
        this.catalogo.mascotasDeCliente(Number(id)).subscribe({
          next: mascotas => (this.mascotasFiltro = mascotas),
          error: error => this.mostrarAviso(error, 'danger')
        });
      }
    });

    // Combo dependiente del formulario: cliente -> mascotas del cliente.
    this.citaForm.controls.clienteId.valueChanges.pipe(takeUntilDestroyed()).subscribe(id => {
      this.citaForm.controls.mascotaId.setValue('', { emitEvent: false });
      this.mascotasFormulario = [];
      if (id) {
        this.catalogo.mascotasDeCliente(Number(id)).subscribe({
          next: mascotas => (this.mascotasFormulario = mascotas),
          error: error => this.mostrarAvisoFormulario(error)
        });
      }
    });

    this.catalogo.clientes().subscribe({
      next: clientes => (this.clientes = clientes),
      error: error => this.mostrarAviso(error, 'danger')
    });
    this.catalogo.veterinarios().subscribe({
      next: veterinarios => (this.veterinarios = veterinarios),
      error: error => this.mostrarAviso(error, 'danger')
    });

    this.cargar();
  }

  /**
   * Carga la página actual con los filtros y el orden seleccionados.
   */
  cargar(): void {
    this.cargando = true;
    this.citaService.listar(this.filtrosDesdeFormulario(), this.pagina, this.tamanio, this.campo, this.direccion)
      .subscribe({
        next: (respuesta: Pagina<Cita>) => {
          this.citas = respuesta.contenido;
          this.pagina = respuesta.pagina;
          this.totalPaginas = respuesta.totalPaginas;
          this.totalRegistros = respuesta.totalRegistros;
          this.cargando = false;
        },
        error: error => {
          this.cargando = false;
          this.mostrarAviso(error, 'danger');
        }
      });
  }

  /** Aplica los filtros desde la primera página. */
  buscar(): void {
    this.pagina = 0;
    this.cargar();
  }

  /** Limpia los filtros y recarga el listado. */
  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.buscar();
  }

  /**
   * Ordena por una columna. Si ya estaba ordenada, invierte la dirección.
   *
   * @param campo campo del backend por el que se ordena.
   */
  ordenar(campo: string): void {
    if (this.campo === campo) {
      this.direccion = this.direccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.campo = campo;
      this.direccion = 'asc';
    }
    this.pagina = 0;
    this.cargar();
  }

  /**
   * Indicador visual de la columna ordenada.
   *
   * @param campo campo de la columna.
   * @returns flecha de orden o cadena vacía.
   */
  indicador(campo: string): string {
    if (this.campo !== campo) {
      return '';
    }
    return this.direccion === 'asc' ? '▲' : '▼';
  }

  /**
   * @param pagina página solicitada (base 0).
   */
  irAPagina(pagina: number): void {
    this.pagina = pagina;
    this.cargar();
  }

  /** Abre el formulario en modo creación. */
  abrirNueva(): void {
    this.editando = null;
    this.avisoFormulario = null;
    this.citaForm.reset({ clienteId: '', mascotaId: '', medicoId: '', fecha: '', hora: '', motivo: '', estado: 'Pendiente' });
    this.mostrarFormulario = true;
  }

  /**
   * Abre el formulario en modo edición. Las citas atendidas y canceladas no se editan.
   *
   * @param cita cita seleccionada.
   */
  editar(cita: Cita): void {
    if (!this.sePuedeEditar(cita)) {
      return;
    }
    this.editando = cita;
    this.avisoFormulario = null;
    const [fecha, horaCompleta] = cita.fechaHora.split('T');
    // emitEvent:false evita que el combo de mascotas borre la mascota ya asignada.
    this.citaForm.reset({
      clienteId: String(cita.clienteId),
      mascotaId: String(cita.mascotaId),
      medicoId: String(cita.medicoId),
      fecha,
      hora: horaCompleta.slice(0, 5),
      motivo: cita.motivo,
      estado: cita.estado
    }, { emitEvent: false });
    this.catalogo.mascotasDeCliente(cita.clienteId).subscribe({
      next: mascotas => {
        this.mascotasFormulario = mascotas;
        this.citaForm.controls.mascotaId.setValue(String(cita.mascotaId), { emitEvent: false });
      },
      error: error => this.mostrarAvisoFormulario(error)
    });
    this.mostrarFormulario = true;
  }

  /** Cierra el formulario sin guardar. */
  cerrarFormulario(): void {
    this.mostrarFormulario = false;
  }

  /**
   * Valida el formulario y envía la cita al backend (crear o actualizar).
   * Las reglas de negocio las valida el backend; aquí solo se muestran sus mensajes.
   */
  guardar(): void {
    if (this.citaForm.invalid) {
      this.citaForm.markAllAsTouched();
      this.avisoFormulario = { tipo: 'warning', texto: 'Complete los campos obligatorios marcados en rojo.' };
      return;
    }
    const v = this.citaForm.getRawValue();
    const rq: CitaRq = {
      clienteId: Number(v.clienteId),
      mascotaId: Number(v.mascotaId),
      medicoId: Number(v.medicoId),
      fechaHora: `${v.fecha}T${v.hora}:00`,
      motivo: v.motivo.trim(),
      estado: v.estado
    };

    this.guardando = true;
    const peticion = this.editando
      ? this.citaService.actualizar(this.editando.id, rq)
      : this.citaService.crear(rq);

    peticion.subscribe({
      next: respuesta => {
        this.guardando = false;
        this.mostrarFormulario = false;
        this.aviso = { tipo: 'success', texto: respuesta.message };
        this.cargar();
      },
      error: error => {
        this.guardando = false;
        this.mostrarAvisoFormulario(error);
      }
    });
  }

  /**
   * Reactiva una cita cancelada tras confirmación del usuario.
   *
   * @param cita cita cancelada.
   */
  reactivar(cita: Cita): void {
    if (!confirm(`¿Reactivar la cita de ${cita.mascotaNombre ?? 'la mascota'} del ${cita.fechaHora.slice(0, 10)}?`)) {
      return;
    }
    this.citaService.reactivar(cita.id).subscribe({
      next: respuesta => {
        this.aviso = { tipo: 'success', texto: respuesta.message };
        this.cargar();
      },
      error: error => this.mostrarAviso(error, 'danger')
    });
  }

  /**
   * Consulta el detalle completo de la cita desde el backend.
   *
   * @param cita cita de la fila.
   */
  verDetalle(cita: Cita): void {
    this.citaService.consultar(cita.id).subscribe({
      // /consultar devuelve la entidad (objetos anidados, sin nombres); la fila ya trae los nombres resueltos.
      next: detalle => (this.detalle = { ...detalle, ...cita }),
      error: error => this.mostrarAviso(error, 'danger')
    });
  }

  /**
   * @param cita cita a evaluar.
   * @returns true si el estado permite modificar la cita.
   */
  sePuedeEditar(cita: Cita): boolean {
    return cita.estado !== 'Atendida' && cita.estado !== 'Cancelada';
  }

  /**
   * @param estado estado de la cita.
   * @returns clase de Bootstrap para el distintivo de estado.
   */
  claseEstado(estado: string): string {
    const clases: Record<string, string> = {
      Pendiente: 'bg-warning text-dark',
      Confirmada: 'bg-info text-dark',
      Programada: 'bg-primary',
      Atendida: 'bg-success',
      Cancelada: 'bg-secondary'
    };
    return clases[estado] ?? 'bg-light text-dark';
  }

  /**
   * Convierte los controles de filtros en el objeto que espera el servicio.
   *
   * @returns filtros con números donde corresponde y null para los vacíos.
   */
  private filtrosDesdeFormulario(): FiltrosCita {
    const v = this.filtrosForm.getRawValue();
    return {
      clienteId: v.clienteId ? Number(v.clienteId) : null,
      mascotaId: v.mascotaId ? Number(v.mascotaId) : null,
      medicoId: v.medicoId ? Number(v.medicoId) : null,
      estado: v.estado || null,
      fechaDesde: v.fechaDesde || null,
      fechaHasta: v.fechaHasta || null,
      texto: v.texto || null
    };
  }

  /**
   * Muestra un error de petición en el aviso general.
   *
   * @param error  error recibido.
   * @param tipo   tipo de aviso.
   */
  private mostrarAviso(error: unknown, tipo: Aviso['tipo']): void {
    this.aviso = { tipo, texto: mensajeDeError(error) };
  }

  /**
   * Muestra un error dentro del formulario modal.
   *
   * @param error error recibido.
   */
  private mostrarAvisoFormulario(error: unknown): void {
    this.avisoFormulario = { tipo: 'danger', texto: mensajeDeError(error) };
  }
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
}
