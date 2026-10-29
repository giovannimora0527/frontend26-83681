import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

import { HistoriaMedica } from 'src/app/models/historia-medica';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';
import { Cita } from 'src/app/models/cita';
import { Medico } from 'src/app/models/medico';
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';

import { HistoriaMedicaService } from './service/historia-medica.service';
import { ClienteService } from '../cliente/service/cliente.service';
import { MascotaService } from '../mascota/service/mascota.service';
import { CitaService } from '../cita/service/cita.service';
import { MedicoService } from '../medico/service/medico.service';
import { AnotacionHistoriaService } from '../anotacion-historia/service/anotacion-historia.service';

type ColumnaOrden = 'fechaCreacion' | 'cliente' | 'mascota' | 'medico' | 'motivoConsulta' | 'estado';
type ColumnaOrdenAnotacion = 'fechaHora';

@Component({
  selector: 'app-historia-medica',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbTooltipModule],
  templateUrl: './historia-medica.component.html',
  styleUrls: ['./historia-medica.component.scss']
})
export class HistoriaMedicaComponent implements OnInit {
  // Variables para el modal
  modalInstance: Modal | null = null;
  titleModal: string = "";
  modoFormulario: string = "";
  titleBoton: string = "";

  // Variables para la tabla, búsqueda y paginación
  listHistorias: HistoriaMedica[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10; 
  columnaOrden: ColumnaOrden = 'fechaCreacion';
  direccionOrden: 'desc' | 'asc' = 'desc';

  // Variables para el modal de detalle e histórico
  modalVerInstance: Modal | null = null;
  historiaSeleccionadaVer: HistoriaMedica | null = null;
  listAnotacionesHistoria: AnotacionHistoria[] = [];
  terminoBusquedaAnotacion = '';
  paginaActualAnotacion = 1;
  readonly registrosPorPaginaAnotacion = 10;
  columnaOrdenAnotacion: ColumnaOrdenAnotacion = 'fechaHora';
  direccionOrdenAnotacion: 'desc' | 'asc' = 'desc';

  // Variables para el modal individual de la anotación
  modalDetalleAnotacionInstance: Modal | null = null;
  anotacionSeleccionadaVer: AnotacionHistoria | null = null;

  // Listas completas desde la base de datos para filtrar 
  // y mostrar en los selectores del formulario
  listClientes: Cliente[] = [];
  listMascotas: Mascota[] = [];
  listCitas: Cita[] = [];
  listMedicos: Medico[] = [];

  // Listas dinámicas para los selectores del formulario
  listMascotasSelect: Mascota[] = [];
  listCitasSelect: Cita[] = [];
  listMedicosSelect: Medico[] = [];

  // Formulario
  form!: FormGroup;
  historiaSeleccionada: HistoriaMedica | null = null;
  enviando = false;
  respuestaError = '';

  constructor(
    private readonly historiaMedicaService: HistoriaMedicaService,
    private readonly clienteService: ClienteService,
    private readonly mascotaService: MascotaService,
    private readonly citaService: CitaService,
    private readonly medicoService: MedicoService,
    private readonly anotacionHistoriaService: AnotacionHistoriaService,
    private readonly formBuilder: FormBuilder
  ) {}

  // Ejecutar automáticamente al cargar el componente en la página
  ngOnInit(): void {
    this.listarHistorias();
    this.listarClientes();
    this.listarMascotas();
    this.listarCitas();
    this.listarMedicos();
    this.inicializarFormulario();
  }

  // Obtener los clientes para mostrarlos en la lista desplegable
  listarClientes() {
    this.clienteService.listarClientes().subscribe({
      next: (data: Cliente[]) => {
        this.listClientes = data;
      },
      error: (error: any) => console.error('Error al obtener los clientes:', error)
    });
  }

  // Obtener las mascotas para mostrarlas en la lista desplegable
  listarMascotas() {
    this.mascotaService.listarMascotas().subscribe({
      next: (data: Mascota[]) => {
        this.listMascotas = data;
        this.listMascotasSelect = data;
      },
      error: (error: any) => console.error('Error al obtener las mascotas:', error)
    });
  }

  // Obtener las citas para mostrarlas en la lista desplegable
  listarCitas() {
    this.citaService.listarCitas().subscribe({
      next: (data: Cita[]) => {
        this.listCitas = data;
        this.listCitasSelect = data;
      },
      error: (error: any) => console.error('Error al obtener las citas:', error)
    });
  }

  // Obtener los médicos para mostrarlos en la lista desplegable
  listarMedicos() {
    this.medicoService.listarMedicos().subscribe({
      next: (data: Medico[]) => {
        this.listMedicos = data;
        this.listMedicosSelect = data;
      },
      error: (error: any) => console.error('Error al obtener los médicos:', error)
    });
  }

  // Inicializa el formulario indicando los campos obligatorios y sus valores por defecto
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      fechaHora: [{ value: '', disabled: true }],
      cliente: [null, Validators.required],
      mascota: [null, Validators.required],
      cita: [null, Validators.required],
      medico: [{ value: null, disabled: true }, Validators.required],
      motivoConsulta: ['', Validators.required],
      diagnostico: ['', Validators.required],
      observaciones: [''],
      estado: ['Abierta', Validators.required]
    });

    let actualizandoFormulario = false;

    // Seleccionar o restablecer el campo Cliente para filtrar las Mascotas permitidas
    this.form.controls['cliente'].valueChanges.subscribe((clienteSeleccionado) => {
      if (actualizandoFormulario) return;
      actualizandoFormulario = true;

      if (clienteSeleccionado) {
        const idCliente = Number(clienteSeleccionado.id);
        // Filtrar mascotas asegurando que pertenezcan al cliente seleccionado
        this.listMascotasSelect = this.listMascotas.filter(m => Number(m.cliente?.id) === idCliente);
        
        // Si previamente se ha seleccionado una mascota y no pertenece al nuevo cliente, restablecer el campo mascota
        const mascotaActual = this.form.controls['mascota'].value;
        if (mascotaActual && Number(mascotaActual.cliente?.id) !== idCliente) {
            this.form.controls['mascota'].setValue(null, { emitEvent: false });
        }
      } else {
        // Restablecer campos
        this.listMascotasSelect = [...this.listMascotas];
      }

      actualizandoFormulario = false;
    });

    // Seleccionar o restablecer el campo Mascota
    this.form.controls['mascota'].valueChanges.subscribe((mascotaSeleccionada) => {
      if (actualizandoFormulario) return;
      actualizandoFormulario = true;

      if (mascotaSeleccionada) {
        // Autocompletar el cliente si no se ha seleccionado previamente
        if (mascotaSeleccionada.cliente) {
          const idClienteMascota = Number(mascotaSeleccionada.cliente?.id);
          const clienteEncontrado = this.listClientes.find(c => Number(c.id) === idClienteMascota);
          if (clienteEncontrado) this.form.controls['cliente'].setValue(clienteEncontrado, { emitEvent: false });
        }

        const idMascota = Number(mascotaSeleccionada.mascotaId);
        // Filtrar citas de dicha mascota
        this.listCitasSelect = this.listCitas.filter(c => Number(c.mascota?.mascotaId) === idMascota);
        // Filtrar médicos que atendieron a dicha mascota
        const idsMedicosValidos = new Set(this.listCitasSelect.map(c => Number(c.medico?.id)));
        this.listMedicosSelect = this.listMedicos.filter(med => idsMedicosValidos.has(Number(med.id)));
      } else {
        // Restablecer campos
        this.listCitasSelect = [...this.listCitas];
        this.listMedicosSelect = [...this.listMedicos];
      }

      actualizandoFormulario = false;
    });

    // Seleccionar o restablecer el campo Médico
    this.form.controls['medico'].valueChanges.subscribe((medicoSeleccionado) => {
      if (actualizandoFormulario) return;
      actualizandoFormulario = true;

      if (medicoSeleccionado) {
        const idMedico = Number(medicoSeleccionado.id);
        // Filtrar citas de dicho médico
        this.listCitasSelect = this.listCitas.filter(c => Number(c.medico?.id) === idMedico);
        // Filtrar mascotas atendidas por dicho médico
        const idsMascotasValidas = new Set(this.listCitasSelect.map(c => Number(c.mascota?.mascotaId)));
        this.listMascotasSelect = this.listMascotas.filter(m => idsMascotasValidas.has(Number(m.mascotaId)));
      } else {
        // Restablecer campos
        this.listCitasSelect = [...this.listCitas];
        this.listMascotasSelect = [...this.listMascotas];
      }

      actualizandoFormulario = false;
    });

    // Seleccionar o restablecer el campo Cita 
    this.form.controls['cita'].valueChanges.subscribe((citaSeleccionada) => {
      if (actualizandoFormulario) return;
      actualizandoFormulario = true;

      if (citaSeleccionada) {
        if (citaSeleccionada.mascota) {
          const mascotaEncontrada = this.listMascotas.find(m => Number(m.mascotaId) === Number(citaSeleccionada.mascota?.mascotaId));
          if (mascotaEncontrada) this.form.controls['mascota'].setValue(mascotaEncontrada, { emitEvent: false });
        }
        if (citaSeleccionada.medico) {
          const medicoEncontrado = this.listMedicos.find(med => Number(med.id) === Number(citaSeleccionada.medico?.id));
          if (medicoEncontrado) this.form.controls['medico'].setValue(medicoEncontrado, { emitEvent: false });
        }
        // Autocompletar el motivo de consulta con el motivo registrado en la cita seleccionada
        const motivoTexto = citaSeleccionada.motivo || citaSeleccionada.motivoConsulta || '';
        this.form.controls['motivoConsulta'].setValue(motivoTexto, { emitEvent: false });
      } else {
        // Restablecer campos
        this.listMascotasSelect = [...this.listMascotas];
        this.listMedicosSelect = [...this.listMedicos];
        this.form.controls['medico'].setValue(null, { emitEvent: false });
        this.form.controls['motivoConsulta'].setValue('', { emitEvent: false });
      }

      actualizandoFormulario = false;
    });
  }

  // Obtener los controles del formulario para facilitar el acceso a sus propiedades y métodos
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  // Solicitar todas las historias médicas guardadas y mostrarlas en la tabla
  listarHistorias() {
    this.historiaMedicaService.listarHistorias().subscribe({
      next: (data) => {
        this.listHistorias = data;
        this.paginaActual = 1;
      },
      error: (error) => {
        console.error('Error al obtener las historias médicas:', error);
      }
    });
  }

  // Actualizar el término de búsqueda y reiniciar la página actual
  actualizarBusqueda(event: Event) {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  // Filtrar la lista de historias dependiendo de lo que se escriba en el buscador
  get historiasFiltradas(): HistoriaMedica[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    const filtradas = this.listHistorias.filter((historia) => {
      if (!termino) return true;

      const valores = [
        `${historia.mascota?.cliente?.nombres ?? ''} ${historia.mascota?.cliente?.apellidos ?? ''}`,
        historia.mascota?.nombreMascota, 
        `${historia.medico?.nombres ?? ''} ${historia.medico?.apellidos ?? ''}`,
        historia.motivoConsulta,
        historia.estado,
        historia.fechaCreacion ? formatDate(historia.fechaCreacion, 'yyyy-MM-dd', 'en-US') : ''
      ];

      return valores.some((valor) =>
        this.normalizarTexto(String(valor ?? '')).includes(termino)
      );
    });

    // Ordenar los resultados según la columna seleccionada
    return [...filtradas].sort((historiaA, historiaB) => {
      const valorA = this.obtenerValorOrden(historiaA, this.columnaOrden);
      const valorB = this.obtenerValorOrden(historiaB, this.columnaOrden);
      const comparacion = typeof valorA === 'number' && typeof valorB === 'number'
        ? valorA - valorB
        : String(valorA).localeCompare(String(valorB), 'es', { numeric: true, sensitivity: 'base' });

      return this.direccionOrden === 'asc' ? comparacion : -comparacion;
    });
  }

  // Obtener el valor exacto de la columna para ordenarla en base a la selección del usuario
  private obtenerValorOrden(historia: HistoriaMedica, columna: ColumnaOrden): string | number {
    switch (columna) {
      case 'cliente': return `${historia.mascota?.cliente?.nombres ?? ''} ${historia.mascota?.cliente?.apellidos ?? ''}`;
      case 'mascota': return historia.mascota?.nombreMascota ?? '';
      case 'medico': return `${historia.medico?.nombres ?? ''} ${historia.medico?.apellidos ?? ''}`;
      case 'motivoConsulta': return historia.motivoConsulta ?? '';
      case 'estado': return historia.estado ?? '';
      case 'fechaCreacion': return historia.fechaCreacion ? new Date(historia.fechaCreacion).getTime() : 0;
      default: return 0;
    }
  }

  // Cambiar el orden de la tabla segun la columna seleccionada por el usuario
  ordenarPor(columna: ColumnaOrden): void {
    if (this.columnaOrden === columna) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.columnaOrden = columna;
      this.direccionOrden = 'asc';
    }
    this.paginaActual = 1;
  }

  // Obtener solo las historias permitidas para la página actual según la paginación
  get historiasPaginadas(): HistoriaMedica[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.historiasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  // Calcular el total de las páginas que tendrá la tabla
  get totalPaginas(): number {
    return Math.ceil(this.historiasFiltradas.length / this.registrosPorPagina);
  }

  // Crear lista de números para mostrar los botones de paginación
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  // Cambiar de página
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Actualizar el término de búsqueda de anotaciones y reiniciar a la primera página
  actualizarBusquedaAnotacion(event: Event) {
    this.terminoBusquedaAnotacion = (event.target as HTMLInputElement).value;
    this.paginaActualAnotacion = 1;
  }

  // Filtrar y ordenar la lista de anotaciones dentro del modal de detalle
  get anotacionesFiltradasDetalle(): AnotacionHistoria[] {
    const termino = this.normalizarTexto(this.terminoBusquedaAnotacion.trim());
    const filtradas = this.listAnotacionesHistoria.filter((anotacion) => {
      if (!termino) return true;
      const valores = [
        `${anotacion.medico?.nombres ?? ''} ${anotacion.medico?.apellidos ?? ''}`,
        anotacion.descripcion,
        anotacion.diagnosticoEvolucion,
        anotacion.fechaHora ? formatDate(anotacion.fechaHora, 'yyyy-MM-dd HH:mm', 'en-US') : ''
      ];
      return valores.some((valor) => this.normalizarTexto(String(valor ?? '')).includes(termino));
    });

    return [...filtradas].sort((a, b) => {
      const valorA = a.fechaHora ? new Date(a.fechaHora).getTime() : 0;
      const valorB = b.fechaHora ? new Date(b.fechaHora).getTime() : 0;

      const comparacion = valorA - valorB;
      return this.direccionOrdenAnotacion === 'asc' ? comparacion : -comparacion;
    });
  }

  // Cambiar el orden de las anotaciones basado en la columna de fecha
  ordenarPorAnotacion(columna: ColumnaOrdenAnotacion): void {
    if (this.columnaOrdenAnotacion === columna) {
      this.direccionOrdenAnotacion = this.direccionOrdenAnotacion === 'asc' ? 'desc' : 'asc';
    } else {
      this.columnaOrdenAnotacion = columna;
      this.direccionOrdenAnotacion = 'desc';
    }
    this.paginaActualAnotacion = 1;
  }

  // Obtener solo las anotaciones paginadas correspondientes a la vista actual del modal
  get anotacionesPaginadasDetalle(): AnotacionHistoria[] {
    const inicio = (this.paginaActualAnotacion - 1) * this.registrosPorPaginaAnotacion;
    return this.anotacionesFiltradasDetalle.slice(inicio, inicio + this.registrosPorPaginaAnotacion);
  }

  // Calcular el número total de páginas para la paginación del histórico de anotaciones
  get totalPaginasAnotacion(): number {
    return Math.ceil(this.anotacionesFiltradasDetalle.length / this.registrosPorPaginaAnotacion);
  }

  // Generar la lista de números para los botones de paginación del histórico de anotaciones  
  get paginasAnotacion(): number[] {
    return Array.from({ length: this.totalPaginasAnotacion }, (_, indice) => indice + 1);
  }

  // Cambiar de página en el listado de anotaciones controlando el rango permitido
  cambiarPaginaAnotacion(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginasAnotacion) {
      this.paginaActualAnotacion = pagina;
    }
  }

  // Preparar el entorno para abrir el modal y crear una historia nueva
  nuevaHistoria(modo: string) {
    this.titleModal = 'Crear historia médica';
    this.modoFormulario = modo;
    this.historiaSeleccionada = null;
    // Restaurar listas completas al abrir el modal
    this.listMascotasSelect = [...this.listMascotas];
    this.listCitasSelect = [...this.listCitas];
    this.listMedicosSelect = [...this.listMedicos];
    this.resetFormulario();
    this.openModal(modo);
  }

  // Borrar los datos del formulario y limpiar los errores visuales
  resetFormulario() {
    const fechaActual = formatDate(new Date(), 'yyyy-MM-dd HH:mm', 'en-US');
    this.form.reset({ 
        fechaHora: fechaActual, 
        cliente: null, 
        mascota: null, 
        cita: null, 
        medico: null, 
        estado: 'Abierta' 
    }); 
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.respuestaError = '';
    // Restaurar selectores a sus listas completas
    this.listMascotasSelect = [...this.listMascotas];
    this.listCitasSelect = [...this.listCitas];
    this.listMedicosSelect = [...this.listMedicos];
  }

  // Enviar los datos del formulario al backend para guardar la nueva historia clínica  
  guardarHistoria() {
    if (this.form.invalid || this.enviando) {
      this.form.markAllAsTouched(); 
      return;
    }

    const valores = this.form.getRawValue();

    const historiaRq = {
      clienteId: valores.cliente?.id,
      mascotaId: valores.mascota?.mascotaId ? Number(valores.mascota.mascotaId) : null,
      citaId: valores.cita?.id ? Number(valores.cita.id) : null,
      medicoId: valores.medico?.id ? Number(valores.medico.id) : null,
      motivoConsulta: valores.motivoConsulta,
      diagnostico: valores.diagnostico,
      observaciones: valores.observaciones,
      estado: valores.estado
    };

    this.enviando = true;
    this.respuestaError = '';
    
    this.historiaMedicaService.crearHistoria(historiaRq).subscribe({
      next: (respuesta) => {
        const mensaje = this.obtenerMensajeRespuesta(respuesta, 'La historia médica fue creada correctamente.');
        setTimeout(() => {
          this.enviando = false;
          this.closeModal();
          this.listarHistorias(); 
          Swal.fire('Operación exitosa', mensaje, 'success');
        }, 1500);
      },
      error: (error) => {
        // Mostrar el error en el modal
        setTimeout(() => {
          this.enviando = false;
          console.error('Error al guardar la historia médica:', error);
          this.respuestaError = error.error?.message || error.error?.mensaje || error.message || 'Ocurrió un error al procesar la solicitud.';
        }, 1000);
      }
    });
  }

  // Obtener el mensaje de respuesta tras guardar con éxito
  private obtenerMensajeRespuesta(respuesta: unknown, mensajePredeterminado: string): string {
    if (respuesta && typeof respuesta === 'object') {
      const cuerpo = respuesta as { mensaje?: unknown; message?: unknown };
      const mensaje = cuerpo.mensaje ?? cuerpo.message;
      if (typeof mensaje === 'string') return mensaje;
    }
    return mensajePredeterminado;
  }

  // Abrir el modal para crear o editar una historia médica
  openModal(modo: string) {
    this.titleModal = 'Crear historia médica';
    this.titleBoton = 'Guardar historia';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearHistoria');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  // Cerrar el modal principal de historia médica y limpiar el formulario
  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.resetFormulario();
  }

  // Abrir el modal de detalle de la historia clínica y cargar su respectivo histórico de anotaciones
  abrirModalVer(historia: HistoriaMedica) {
    this.historiaSeleccionadaVer = historia;
    this.listAnotacionesHistoria = [];
    this.paginaActualAnotacion = 1;
    this.terminoBusquedaAnotacion = '';
    
    const idHistoria = Number(historia.id || (historia as any).historiaMedicaId);
    if (idHistoria) {
        this.anotacionHistoriaService.listarAnotacionesPorHistoria(idHistoria).subscribe({
            next: (data: AnotacionHistoria[]) => {
                this.listAnotacionesHistoria = data;
            },
            error: (error) => console.error('Error al obtener anotaciones:', error)
        });
    }

    const modalElement = document.getElementById('modalVerHistoria');
    if (modalElement) {
      this.modalVerInstance ??= new Modal(modalElement);
      this.modalVerInstance.show();
    }
  }

  // Cerrar el modal de visualización del historial clínico
  cerrarModalVer() {
    if (this.modalVerInstance) {
      this.modalVerInstance.hide();
    }
    this.historiaSeleccionadaVer = null;
    this.listAnotacionesHistoria = [];
  }

  // Consultar el detalle individual de una anotación clínica seleccionada
  verDetalleAnotacion(anotacion: AnotacionHistoria) {
    this.anotacionSeleccionadaVer = anotacion;

    // Ocultar temporalmente el modal para evitar superposición
    if (this.modalVerInstance) {
        this.modalVerInstance.hide();
    }

    // Mostrar el nuevo modal de la anotación
    const modalElement = document.getElementById('modalDetalleAnotacion');
    if (modalElement) {
        this.modalDetalleAnotacionInstance ??= new Modal(modalElement);
        this.modalDetalleAnotacionInstance.show();
    }
  }

  // Cerrar el modal individual de la anotación y restaurar el modal principal de detalle
  cerrarModalDetalleAnotacion() {
    if (this.modalDetalleAnotacionInstance) {
        this.modalDetalleAnotacionInstance.hide();
    }
    this.anotacionSeleccionadaVer = null;

    // Volver a abrir el modal de la historia clínica
    if (this.modalVerInstance) {
        this.modalVerInstance.show();
    }
  }

  // Cerrar ambos modales de manera simultánea y regresar directamente al DataTable principal
  cerrarTodoYVolverPrincipal() {
    if (this.modalDetalleAnotacionInstance) {
        this.modalDetalleAnotacionInstance.hide();
    }
    if (this.modalVerInstance) {
        this.modalVerInstance.hide();
    }
    this.anotacionSeleccionadaVer = null;
    this.historiaSeleccionadaVer = null;
    this.listAnotacionesHistoria = [];
  }

  // Eliminar tildes y pasar el texto a minúsculas para una correcta busqueda
  private normalizarTexto(texto: string): string {
    return texto.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}