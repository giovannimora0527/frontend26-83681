import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { Medico } from 'src/app/models/medico';

import { AnotacionHistoriaService } from './service/anotacion-historia.service';
import { HistoriaMedicaService } from '../historia-medica/service/historia-medica.service';
import { MedicoService } from '../medico/service/medico.service';

type ColumnaOrdenAnotacion = 'historia' | 'mascota' | 'fechaHora' | 'medico' | 'descripcion' | 'observacion' | 'diagnosticoEvolucion';

@Component({
  selector: 'app-anotacion-historia',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbTooltipModule],
  templateUrl: './anotacion-historia.component.html',
  styleUrls: ['./anotacion-historia.component.scss']
})
export class AnotacionHistoriaComponent implements OnInit {
  // Listas de datos
  listAnotaciones: AnotacionHistoria[] = [];
  listHistorias: HistoriaMedica[] = [];
  listMedicos: Medico[] = [];
  
  // Variables para filtros
  historiaFiltroId: number | null = null;
  terminoBusqueda = '';
  
  // Paginación y ordenamiento
  paginaActual = 1;
  readonly registrosPorPagina = 10; 
  columnaOrden: ColumnaOrdenAnotacion = 'fechaHora';
  direccionOrden: 'desc' | 'asc' = 'desc';

  // Modales
  modalInstance: Modal | null = null;
  modalDetalleAnotacionInstance: Modal | null = null;
  anotacionSeleccionadaVer: AnotacionHistoria | null = null;

  // Formulario
  form!: FormGroup;
  enviando = false;
  respuestaError = '';

  constructor(
    private readonly anotacionService: AnotacionHistoriaService,
    private readonly historiaService: HistoriaMedicaService,
    private readonly medicoService: MedicoService,
    private readonly formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.cargarDatosGenerales();
    this.inicializarFormulario();
  }

  // Método para actualizar tanto las anotaciones como las historias clínicas y médicos
  cargarDatosGenerales() {
    this.listarAnotaciones();
    this.listarHistorias();
    this.listarMedicos();
  }

  // Carga todas las anotaciones para el DataTable
  listarAnotaciones() {
    this.anotacionService.listarAnotaciones().subscribe({
      next: (data: any) => {
        this.listAnotaciones = data;
      },
      error: (error: any) => console.error('Error al obtener anotaciones:', error)
    });
  }

  // Cargar las historias clínicas para la lista desplegable superior y el modal
  listarHistorias() {
    this.historiaService.listarHistorias().subscribe({
      next: (data: any) => {
        this.listHistorias = data;
      },
      error: (error: any) => console.error('Error al obtener historias:', error)
    });
  }

  // Cargar los médicos disponibles para el modal de creación
  listarMedicos() {
    this.medicoService.listarMedicos().subscribe({
      next: (data: any) => {
        this.listMedicos = data;
      },
      error: (error: any) => console.error('Error al obtener médicos:', error)
    });
  }

  // Inicializar formulario de creación y configurar la reactividad de los campos
  inicializarFormulario() {
    const fechaActual = formatDate(new Date(), 'yyyy-MM-dd HH:mm', 'en-US');
    this.form = this.formBuilder.group({
      historiaMedica: [null, Validators.required],
      medico: [null, Validators.required],
      fechaHora: [{ value: fechaActual, disabled: true }],
      descripcion: ['', Validators.required],
      diagnosticoEvolucion: ['', Validators.required],
      observacion: ['']
    });

    // Si la historia clínica trae un médico asociado, se preselecciona; si no, el usuario lo elige de la lista.
    this.form.get('historiaMedica')?.valueChanges.subscribe((historia: HistoriaMedica | null) => {
      if (historia && historia.medico) {
        const medicoEncontrado = this.listMedicos.find(m => m.id === historia.medico?.id);
        this.form.get('medico')?.setValue(medicoEncontrado || historia.medico, { emitEvent: false });
      }
    });
  }

  // Obtener los controles del formulario para facilitar el acceso a sus propiedades y métodos
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  // Actualizar el filtro cuando se usa la lista desplegable superior
  filtrarPorHistoria(event: Event) {
    const valor = (event.target as HTMLSelectElement).value;
    this.historiaFiltroId = valor && valor !== '' ? Number(valor) : null;
    this.paginaActual = 1;
  }

  // Actualizar el filtro cuando se usa el buscador de texto
  actualizarBusqueda(event: Event) {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  // Filtrar y ordenar la lista de anotaciones según los criterios establecidos
  get anotacionesFiltradas(): AnotacionHistoria[] {
    let filtradas = this.listAnotaciones;

    // Filtrar por la lista desplegable si hay una historia seleccionada
    if (this.historiaFiltroId) {
        filtradas = filtradas.filter(anotacion => Number(anotacion.historia?.id) === this.historiaFiltroId);
    }

    // Filtrar por el buscador de texto general
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    if (termino) {
        filtradas = filtradas.filter((anotacion) => {
            const valores = [
                anotacion.historia?.id?.toString(),
                anotacion.historia?.mascota?.nombreMascota,
                `${anotacion.medico?.nombres ?? ''} ${anotacion.medico?.apellidos ?? ''}`,
                anotacion.descripcion,
                anotacion.observacion,
                anotacion.diagnosticoEvolucion,
                anotacion.fechaHora ? formatDate(anotacion.fechaHora, 'yyyy-MM-dd', 'en-US') : ''
            ];
            return valores.some((valor) => this.normalizarTexto(String(valor ?? '')).includes(termino));
        });
    }

    // Aplicar ordenamiento
    return [...filtradas].sort((a, b) => {
      let valorA: number | string = 0;
      let valorB: number | string = 0;

      if (this.columnaOrden === 'historia') {
        valorA = a.historia?.id ? Number(a.historia.id) : 0;
        valorB = b.historia?.id ? Number(b.historia.id) : 0;
      } else if (this.columnaOrden === 'mascota') {
        valorA = a.historia?.mascota?.nombreMascota ?? '';
        valorB = b.historia?.mascota?.nombreMascota ?? '';
      } else if (this.columnaOrden === 'fechaHora') {
        valorA = a.fechaHora ? new Date(a.fechaHora).getTime() : 0;
        valorB = b.fechaHora ? new Date(b.fechaHora).getTime() : 0;
      } else if (this.columnaOrden === 'medico') {
        valorA = `${a.medico?.nombres ?? ''} ${a.medico?.apellidos ?? ''}`;
        valorB = `${b.medico?.nombres ?? ''} ${b.medico?.apellidos ?? ''}`;
      } else if (this.columnaOrden === 'descripcion') {
        valorA = a.descripcion ?? '';
        valorB = b.descripcion ?? '';
      } else if (this.columnaOrden === 'observacion') {
        valorA = a.observacion ?? '';
        valorB = b.observacion ?? '';
      } else if (this.columnaOrden === 'diagnosticoEvolucion') {
        valorA = a.diagnosticoEvolucion ?? '';
        valorB = b.diagnosticoEvolucion ?? '';
      }

      const comparacion = typeof valorA === 'number' && typeof valorB === 'number'
        ? valorA - valorB
        : String(valorA).localeCompare(String(valorB), 'es', { numeric: true, sensitivity: 'base' });

      return this.direccionOrden === 'asc' ? comparacion : -comparacion;
    });
  }

  // Cambiar la columna de ordenamiento 
  ordenarPor(columna: ColumnaOrdenAnotacion): void {
    if (this.columnaOrden === columna) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.columnaOrden = columna;
      this.direccionOrden = 'asc';
    }
    this.paginaActual = 1;
  }

  // Obtener solo las anotaciones correspondientes a la página actual
  get anotacionesPaginadas(): AnotacionHistoria[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.anotacionesFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  // Calcular el número total de páginas basadas en los registros filtrados
  get totalPaginas(): number {
    return Math.ceil(this.anotacionesFiltradas.length / this.registrosPorPagina);
  }

  // Obtener el listado numérico de páginas disponibles para la navegación.
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  // Cambiar de página actual validando los límites permitidos
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Abrir modal de nueva anotación y restablecer los valores del formulario
  nuevaAnotacion() {
    this.cargarDatosGenerales();
    this.resetFormulario();
    this.openModal();
  }

  // Borrar los datos del formulario y limpiar los errores visuales
  resetFormulario() {
    const fechaActual = formatDate(new Date(), 'yyyy-MM-dd HH:mm', 'en-US');
    this.form.reset({
      historiaMedica: this.historiaFiltroId ? this.listHistorias.find(h => Number(h.id) === this.historiaFiltroId) : null,
      medico: null,
      fechaHora: fechaActual,
      descripcion: '',
      diagnosticoEvolucion: '',
      observacion: ''
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.respuestaError = '';
  }

  // Guardar nueva anotación en el backend
  guardarAnotacion() {
    if (this.form.invalid || this.enviando) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const anotacionRq = {
      historiaId: Number(valores.historiaMedica?.id),
      medicoId: Number(valores.medico?.id),
      descripcion: valores.descripcion,
      diagnosticoEvolucion: valores.diagnosticoEvolucion,
      observacion: valores.observacion
    };

    this.enviando = true;
    this.respuestaError = '';

    this.anotacionService.crearAnotacion(anotacionRq).subscribe({
      next: (respuesta: any) => {
        const mensaje = this.obtenerMensajeRespuesta(respuesta, 'La anotación clínica fue registrada correctamente.');
        setTimeout(() => {
          this.enviando = false;
          this.closeModal();
          this.listarAnotaciones();
          Swal.fire('Operación exitosa', mensaje, 'success');
        }, 1200);
      },
      error: (error: any) => {
        setTimeout(() => {
          this.enviando = false;
          console.error('Error al guardar la anotación clínica:', error);
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

  // Abrir el modal para crear una nueva anotación clínica
  openModal() {
    const modalElement = document.getElementById('modalCrearAnotacion');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  // Cerrar el modal principal de creación de anotación y limpiar el formulario
  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.resetFormulario();
  }

  // Ver detalle individual de la anotación seleccionada
  verDetalleAnotacion(anotacion: AnotacionHistoria) {
    this.anotacionSeleccionadaVer = anotacion;
    const modalElement = document.getElementById('modalDetalleAnotacion');
    if (modalElement) {
      this.modalDetalleAnotacionInstance ??= new Modal(modalElement);
      this.modalDetalleAnotacionInstance.show();
    }
  }

  // Cerrar el modal de visualización de detalles
  cerrarModalDetalleAnotacion() {
    if (this.modalDetalleAnotacionInstance) {
      this.modalDetalleAnotacionInstance.hide();
    }
    this.anotacionSeleccionadaVer = null;
  }

  // Normalizar texto removiendo tildes y pasando a minúsculas para búsquedas precisas
  private normalizarTexto(texto: string): string {
    return texto.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}