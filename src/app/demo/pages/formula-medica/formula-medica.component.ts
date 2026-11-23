<<<<<<< HEAD
import { Component } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


import { FormulaService } from './service/formula.service';
import { CitaService } from '../cita/service/cita.service';

import { Modal } from 'bootstrap';
import { Formula } from 'src/app/models/formula';
import { Cita } from 'src/app/models/cita';
import { Medicamento } from 'src/app/models/medicamento';
import Swal from 'sweetalert2';
import { MedicamentoService } from '../medicamento/service/medicamento.service';
import { InventarioItem, InventarioService } from '../inventario/service/inventario.service';
import { descargarArchivo, mensajeError } from 'src/app/utils/archivo.util';

type ColumnaOrden = 'nombre' | 'medicamento' | 'dosis' | 'duracion' | 'frecuencia' | 'indicaciones' | 'cliente' | 'fechaCreacionRegistro';
=======
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertaComponent } from 'src/app/components/alerta/alerta.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { PaginadorComponent } from 'src/app/components/paginador/paginador.component';
import { ClienteResumen, MascotaResumen, VeterinarioResumen, nombreCompleto } from 'src/app/models/catalogos';
import { Cita } from 'src/app/models/cita';
import { FiltrosFormula, FormulaMedica, FormulaMedicaRq } from 'src/app/models/formula-medica';
import { DireccionOrden, Pagina } from 'src/app/models/pagina';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { mensajeDeError } from 'src/app/services/api.util';
import { CitaService } from 'src/app/demo/pages/cita/service/cita.service';
import { MedicamentoService } from 'src/app/demo/pages/medicamento/service/medicamento.service';
import { Medicamento } from 'src/app/models/medicamento';
import { FormulaMedicaService } from './service/formula-medica.service';
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3

/** Mensaje mostrado en pantalla. */
interface Aviso {
  tipo: 'success' | 'danger' | 'warning' | 'info';
  texto: string;
}

/**
 * Gestión de fórmulas médicas. El listado muestra un resumen; el detalle ("Ver") muestra todos los campos.
 * El formulario sigue la cadena Cliente → Mascota → Cita (consulta) → Veterinario.
 */
@Component({
  selector: 'app-formula-medica',
<<<<<<< HEAD
  imports: [CommonModule, ReactiveFormsModule, NgbTooltipModule],
=======
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertaComponent, ModalComponent, PaginadorComponent],
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
  templateUrl: './formula-medica.component.html',
  styleUrl: './formula-medica.component.scss'
})
export class FormulaMedicaComponent {
<<<<<<< HEAD
  // Variables para el modal.
  modalInstance: Modal | null = null;
  titleModal: string = "";
  modoFormulario: string = "";
  titleBoton: string = "";

  // Variables para la paginación, ordenamiento y búsqueda en la datatable.
  listFormulas: Formula[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 2;
  columnaOrden: ColumnaOrden = 'nombre';
  direccionOrden: 'asc' | 'desc' = 'asc';

  listCitas: Cita[] = [];
  listMedicamentos: Medicamento[] = [];
  cargandoMedicamentos = false;
  errorMedicamentos = '';

  // Formulario para crear o editar fórmula.
  form!: FormGroup;
  formulaSelected: Formula | null = null;
  enviando = false;
  respuestaError = '';


  constructor(
    private readonly formulaService: FormulaService,
    private readonly medicamentoService: MedicamentoService,
    private readonly citaService: CitaService,
    private readonly formBuilder: FormBuilder,
    private readonly inventarioService: InventarioService
  ) {
    this.inicializarFormulario();
    this.listar();
    this.listarCitas();
    this.listarMedicamentos();
    this.cargarExistencias();
  }

  inicializarFormulario(): void {
    this.form = this.formBuilder.group({
      cita: [null, Validators.required],
      medicamento: [null, Validators.required],
      dosis: ['', Validators.required],
      frecuencia: ['', Validators.required],
      duracion: ['', Validators.required],
      cantidadPrescrita: [1, [Validators.required, Validators.min(1)]],
      viaAdministracion: ['ORAL', Validators.required],
      indicaciones: ['']
    });
    this.form.get('medicamento')?.valueChanges.subscribe((medicamento: Medicamento | null) => {
      this.disponibilidad = medicamento ? this.existencias[medicamento.id] ?? null : null;
    });
  }

  readonly viasAdministracion = ['ORAL', 'TOPICA', 'SUBCUTANEA', 'INTRAMUSCULAR', 'INTRAVENOSA', 'OFTALMICA', 'OTICA', 'RECTAL'];
  existencias: Record<number, InventarioItem> = {};
  disponibilidad: InventarioItem | null = null;

  /** Consulta el inventario para mostrar la disponibilidad del medicamento al formular (Req. 1.3 / 3.3). */
  cargarExistencias(): void {
    this.inventarioService.resumen().subscribe({
      next: items => {
        this.existencias = Object.fromEntries(items.map(item => [item.medicamentoId, item]));
        const actual = this.form.get('medicamento')?.value as Medicamento | null;
        this.disponibilidad = actual ? this.existencias[actual.id] ?? null : null;
      },
      error: error => console.error('No fue posible consultar el inventario:', error)
    });
  }

  get cantidadSuperaExistencia(): boolean {
    const cantidad = Number(this.form.get('cantidadPrescrita')?.value ?? 0);
    return !!this.disponibilidad && cantidad > this.disponibilidad.existenciaDispensable;
  }

  descargarPdf(formula: Formula): void {
    if (!formula.id) return;
    this.formulaService.descargarPdf(formula.id).subscribe({
      next: blob => descargarArchivo(blob, `formula-medica-${formula.id}.pdf`),
      error: error => Swal.fire('Error', mensajeError(error, 'No fue posible generar el PDF.'), 'error')
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  listarCitas(): void {
    this.citaService.listarCitas().subscribe({
      next: (data) => this.listCitas = data,
      error: (error) => console.error('Error al obtener las citas:', error)
    });
  }

  listarMedicamentos(): void {
    this.cargandoMedicamentos = true;
    this.errorMedicamentos = '';
    this.medicamentoService.listarMedicamentos().subscribe({
      next: (data) => {
        this.cargandoMedicamentos = false;
        if (!Array.isArray(data)) {
          this.listMedicamentos = [];
          this.errorMedicamentos = 'El servicio devolvió una respuesta inesperada.';
          console.error('La respuesta de medicamentos no es una lista:', data);
          return;
        }
        this.listMedicamentos = data;
      },
      error: (error) => {
        this.cargandoMedicamentos = false;
        this.listMedicamentos = [];
        this.errorMedicamentos = 'No fue posible cargar los medicamentos.';
        console.error('Error al obtener los medicamentos:', error);
      }
    });
  }

  compararCitas(citaA: Cita | null, citaB: Cita | null): boolean {
    return citaA === citaB || citaA?.id === citaB?.id;
  }

  compararMedicamentos(medicamentoA: Medicamento | null, medicamentoB: Medicamento | null): boolean {
    return medicamentoA === medicamentoB || medicamentoA?.id === medicamentoB?.id;
  }

  /**
   * Metodo que permite listar las fórmulas médicas registradas en la base de datos y mostrarlas en la tabla.
   */
  listar() {
    this.formulaService.listar()
      .subscribe(
        {
          next: (data) => {
            console.log(data);
            this.listFormulas = data;
            this.paginaActual = 1;
          },
          error: (error) => {
            console.error('Error al obtener las fórmulas médicas:', error);
          }
        }
      );
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
    * Filtra la lista de fórmulas médicas según el término de búsqueda ingresado por el usuario.
    * @returns Un arreglo de fórmulas médicas filtradas.
    */
  get formulasFiltradas(): Formula[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    const filtradas = this.listFormulas.filter((formula) => {
      if (!termino) {
        return true;
      }

      const valores = [
        formula.medicamento.nombre,
        formula.dosis,
        formula.duracion,
        formula.frecuencia,
        `${formula.cita?.cliente?.nombres ?? ''} ${formula.cita?.cliente?.apellidos ?? ''}`,
        formula.fechaCreacionRegistro
          ? formatDate(formula.fechaCreacionRegistro, 'yyyy-MM-dd HH:mm', 'en-US')
          : ''
      ];

      return valores.some((valor) =>
        this.normalizarTexto(String(valor ?? '')).includes(termino)
      );
    });

    return [...filtradas].sort((formulaA, formulaB) => {
      const valorA = this.obtenerValorOrden(formulaA, this.columnaOrden);
      const valorB = this.obtenerValorOrden(formulaB, this.columnaOrden);
      const comparacion = typeof valorA === 'number' && typeof valorB === 'number'
        ? valorA - valorB
        : String(valorA).localeCompare(String(valorB), 'es', { numeric: true, sensitivity: 'base' });

      return this.direccionOrden === 'asc' ? comparacion : -comparacion;
    });
  }

  private obtenerValorOrden(formula: Formula, columna: ColumnaOrden): string | number {
    switch (columna) {
      case 'nombre':
        return formula.medicamento.nombre ?? '';
      case 'dosis':
        return formula.dosis ?? '';
      case 'duracion':
        return formula.duracion ?? '';
      case 'frecuencia':
        return formula.frecuencia ?? '';
      case 'medicamento':
        return formula.medicamento.nombre ?? '';
      case 'indicaciones':
        return formula.indicaciones ?? 0;
      case 'cliente':
        return `${formula.cita?.cliente?.nombres ?? ''} ${formula.cita?.cliente?.apellidos ?? ''}`;
      case 'fechaCreacionRegistro':
        return formula.fechaCreacionRegistro ? new Date(formula.fechaCreacionRegistro).getTime() : 0;
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

  get formulasPaginadas(): Formula[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.formulasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.formulasFiltradas.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }


  /**
     * Metodos para la gestion de formulas (crear, editar, guardar).
     */

  // Evento para abrir el modal de crear o editar formula, dependiendo del modo recibido.
  nuevaFormula(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear fórmula médica' : 'Editar fórmula médica';
    this.modoFormulario = modo;
    this.formulaSelected = null;
    this.resetFormulario();
    this.openModal(modo);
  }

  resetFormulario() {
    this.form.reset({ cantidadPrescrita: 1, viaAdministracion: 'ORAL' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.respuestaError = '';
  }

  abrirEdicion(formula: Formula) {
    this.formulaSelected = formula;
    this.modoFormulario = 'E';
    this.form.patchValue({
      cita: formula.cita,
      medicamento: formula.medicamento,
      dosis: formula.dosis ?? null,
      duracion: formula.duracion,
      frecuencia: formula.frecuencia,
      cantidadPrescrita: formula.cantidadPrescrita ?? 1,
      viaAdministracion: formula.viaAdministracion ?? 'ORAL',
      indicaciones: formula.indicaciones ?? ''
    });
    this.openModal(this.modoFormulario);
  }

  /**
   * 
   * @returns Acción realizada sobre la formula (crear o actualizar).
   */
  guardarFormula() {
    if (this.form.invalid || this.enviando) {
      this.form.markAllAsTouched();
      return;
    }
   
    const valores = this.form.getRawValue();
    const formula: Formula = {
      id: this.formulaSelected?.id,      
      dosis: valores.dosis,
      indicaciones: valores.indicaciones,
      frecuencia: valores.frecuencia,
      duracion: valores.duracion,
      cantidadPrescrita: Number(valores.cantidadPrescrita),
      viaAdministracion: valores.viaAdministracion,
      cita: valores.cita,
      medicamento: valores.medicamento,      
      citaId: valores.cita?.id,
      medicamentoId: valores.medicamento?.id,
    };

    this.enviando = true;
    this.respuestaError = '';
    const solicitud = this.modoFormulario === 'C'
      ? this.formulaService.crearFormula(formula)
      : this.formulaService.actualizarFormula(formula);

    solicitud.subscribe({
      next: (respuesta) => {
        this.enviando = false;
        const mensaje = this.obtenerMensajeRespuesta(
          respuesta,
          this.modoFormulario === 'C' ? 'La formula fue creada correctamente.' : 'La formula fue actualizada correctamente.'
        );
        this.closeModal();
        this.listar();
        Swal.fire('Operación exitosa', mensaje, 'success');
      },
      error: (error) => {
        this.enviando = false;
        console.error('Error al guardar la formula:', error);
        Swal.fire('Error', error.message, 'error');
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

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.resetFormulario();
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear fórmula médica' : 'Editar fórmula médica';
    this.titleBoton = modo === 'C' ? 'Guardar fórmula' : 'Actualizar fórmula';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearFormula');
    if (modalElement) {
      // Verificar si ya existe una instancia del modal
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }
=======
  private readonly formulaService = inject(FormulaMedicaService);
  private readonly citaService = inject(CitaService);
  private readonly medicamentoService = inject(MedicamentoService);
  /** Catálogo de medicamentos para el combo del formulario. */
  medicamentos: Medicamento[] = [];
  private readonly catalogo = inject(CatalogoService);
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3

  /** Función expuesta a la plantilla para mostrar nombres completos. */
  readonly nombreCompleto = nombreCompleto;

  /** Fecha de hoy (hora local), usada como referencia visual. */
  readonly hoy = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  /** Columnas del listado resumido. El detalle muestra además dosis, frecuencia e indicaciones. */
  readonly columnas: { campo: string; etiqueta: string }[] = [
    { campo: 'fechaEmision', etiqueta: 'Fecha de emisión' },
    { campo: 'mascotaId', etiqueta: 'Mascota' },
    { campo: 'medicoId', etiqueta: 'Veterinario' },
    { campo: 'medicamento', etiqueta: 'Medicamento' },
    { campo: 'duracionDias', etiqueta: 'Duración (días)' }
  ];

  readonly tamanio = 10;

  // ----- Listado -----
  formulas: FormulaMedica[] = [];
  pagina = 0;
  totalPaginas = 0;
  totalRegistros = 0;
  campo = 'fechaCreacionRegistro';
  direccion: DireccionOrden = 'desc';
  cargando = false;
  aviso: Aviso | null = null;

  // ----- Catálogos -----
  clientes: ClienteResumen[] = [];
  veterinarios: VeterinarioResumen[] = [];
  mascotasFiltro: MascotaResumen[] = [];
  mascotasFormulario: MascotaResumen[] = [];
  citasFormulario: Cita[] = [];

  // ----- Filtros -----
  readonly filtrosForm = new FormGroup({
    clienteId: new FormControl('', { nonNullable: true }),
    mascotaId: new FormControl('', { nonNullable: true }),
    medicoId: new FormControl('', { nonNullable: true }),
    medicamento: new FormControl('', { nonNullable: true }),
    fechaDesde: new FormControl('', { nonNullable: true }),
    fechaHasta: new FormControl('', { nonNullable: true })
  });

  // ----- Formulario -----
  readonly formulaForm = new FormGroup({
    clienteId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    mascotaId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    citaId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    medicoId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    idMedicamento: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dosis: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    frecuencia: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    duracionDias: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(1), Validators.max(365)] }),
    indicaciones: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fechaEmision: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  mostrarFormulario = false;
  editando: FormulaMedica | null = null;
  guardando = false;
  avisoFormulario: Aviso | null = null;

  /** Fórmula mostrada en el detalle "Ver"; null si está cerrado. */
  detalle: FormulaMedica | null = null;

  constructor() {
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

    // Cadena dependiente: cliente -> mascotas del cliente.
    this.formulaForm.controls.clienteId.valueChanges.pipe(takeUntilDestroyed()).subscribe(id => {
      this.formulaForm.controls.mascotaId.setValue('', { emitEvent: false });
      this.formulaForm.controls.citaId.setValue('', { emitEvent: false });
      this.mascotasFormulario = [];
      this.citasFormulario = [];
      if (id) {
        this.catalogo.mascotasDeCliente(Number(id)).subscribe({
          next: mascotas => (this.mascotasFormulario = mascotas),
          error: error => this.mostrarAvisoFormulario(error)
        });
      }
    });

    // Cadena dependiente: mascota -> consultas (citas no canceladas) de la mascota.
    this.formulaForm.controls.mascotaId.valueChanges.pipe(takeUntilDestroyed()).subscribe(id => {
      this.formulaForm.controls.citaId.setValue('', { emitEvent: false });
      this.citasFormulario = [];
      if (id) {
        this.cargarCitasDeMascota(Number(id));
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
    this.medicamentoService.getMedicamentos().subscribe({
      next: lista => (this.medicamentos = lista),
      error: error => this.mostrarAviso(error, 'danger')
    });

    this.cargar();
  }

  /** Carga la página actual del listado con filtros y orden del servidor. */
  cargar(): void {
    this.cargando = true;
    this.formulaService.listar(this.filtrosDesdeFormulario(), this.pagina, this.tamanio, this.campo, this.direccion)
      .subscribe({
        next: (respuesta: Pagina<FormulaMedica>) => {
          this.formulas = respuesta.contenido;
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

  /** Aplica filtros desde la primera página. */
  buscar(): void {
    this.pagina = 0;
    this.cargar();
  }

  /** Limpia filtros y recarga. */
  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.buscar();
  }

  /**
   * Ordena por columna; si ya estaba ordenada invierte la dirección.
   *
   * @param campo campo del backend.
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
    // reset() conserva el estado "disabled" de una edición anterior; se rehabilita antes.
    this.formulaForm.enable({ emitEvent: false });
    this.formulaForm.reset({
      clienteId: '', mascotaId: '', citaId: '', medicoId: '', idMedicamento: '', dosis: '',
      frecuencia: '', duracionDias: null, indicaciones: '', fechaEmision: this.hoy
    });
    this.mostrarFormulario = true;
  }

  /**
   * Abre el formulario en edición. La mascota, la consulta y el veterinario ya no se pueden cambiar
   * (la fórmula es soporte clínico), por eso sus combos quedan deshabilitados.
   *
   * @param formula fórmula seleccionada.
   */
  editar(formula: FormulaMedica): void {
    this.avisoFormulario = null;
    this.formulaService.consultar(formula.id).subscribe({
      next: respuesta => {
        // /consultar devuelve la entidad (sin mascotaId, citaId...); la fila trae esos ids planos.
        const detalle = { ...respuesta, ...formula };
        // Se necesita el cliente de la mascota para poblar el combo dependiente.
        this.catalogo.mascota(detalle.mascotaId).subscribe({
          next: mascota => {
            const clienteId = mascota.cliente?.id ?? null;
            this.editando = detalle;
            // emitEvent:false evita que los combos dependientes borren la selección actual.
            this.formulaForm.reset({
              clienteId: clienteId ? String(clienteId) : '',
              mascotaId: String(detalle.mascotaId),
              citaId: String(detalle.citaId),
              medicoId: String(detalle.medicoId),
              idMedicamento: String(detalle.idMedicamento),
              dosis: detalle.dosis,
              frecuencia: detalle.frecuencia,
              duracionDias: detalle.duracionDias,
              indicaciones: detalle.indicaciones,
              fechaEmision: detalle.fechaEmision
            }, { emitEvent: false });
            // Mascota, consulta y cliente no se reasignan en una fórmula ya emitida.
            this.formulaForm.controls.clienteId.disable({ emitEvent: false });
            this.formulaForm.controls.mascotaId.disable({ emitEvent: false });
            this.formulaForm.controls.citaId.disable({ emitEvent: false });
            this.mostrarFormulario = true;

            if (clienteId) {
              this.catalogo.mascotasDeCliente(clienteId).subscribe({
                next: mascotas => (this.mascotasFormulario = mascotas),
                error: error => this.mostrarAvisoFormulario(error)
              });
            }
            this.citaService.listar({ mascotaId: detalle.mascotaId }, 0, 100, 'fechaHora', 'desc').subscribe({
              next: respuesta => (this.citasFormulario = respuesta.contenido),
              error: error => this.mostrarAvisoFormulario(error)
            });
          },
          error: error => this.mostrarAviso(error, 'danger')
        });
      },
      error: error => this.mostrarAviso(error, 'danger')
    });
  }

  /** Cierra el formulario sin guardar. */
  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.formulaForm.enable({ emitEvent: false });
  }

  /**
   * Valida y envía la fórmula (crear con POST o actualizar con PUT).
   */
  guardar(): void {
    if (this.formulaForm.invalid) {
      this.formulaForm.markAllAsTouched();
      this.avisoFormulario = { tipo: 'warning', texto: 'Complete los campos obligatorios marcados en rojo.' };
      return;
    }
    const v = this.formulaForm.getRawValue();
    const rq: FormulaMedicaRq = {
      mascotaId: Number(v.mascotaId),
      citaId: Number(v.citaId),
      medicoId: Number(v.medicoId),
      idMedicamento: Number(v.idMedicamento),
      dosis: v.dosis.trim(),
      frecuencia: v.frecuencia.trim(),
      duracionDias: Number(v.duracionDias),
      indicaciones: v.indicaciones.trim(),
      fechaEmision: v.fechaEmision
    };

    this.guardando = true;
    const peticion = this.editando
      ? this.formulaService.actualizar(this.editando.id, rq)
      : this.formulaService.crear(rq);

    peticion.subscribe({
      next: respuesta => {
        this.guardando = false;
        this.cerrarFormulario();
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
   * Consulta el detalle completo de la fórmula desde el backend.
   *
   * @param formula fila seleccionada.
   */
  verDetalle(formula: FormulaMedica): void {
    this.formulaService.consultar(formula.id).subscribe({
      // /consultar devuelve la entidad (objetos anidados, sin nombres); la fila ya trae los nombres resueltos.
      next: detalle => (this.detalle = { ...detalle, ...formula }),
      error: error => this.mostrarAviso(error, 'danger')
    });
  }

  /**
   * Texto legible de una cita para el combo de consultas.
   *
   * @param cita cita de la consulta.
   * @returns "dd/mm/aaaa hh:mm — motivo".
   */
  textoCita(cita: Cita): string {
    const [fecha, hora] = cita.fechaHora.split('T');
    return `${fecha} ${hora.slice(0, 5)} — ${cita.motivo}`;
  }

  /**
   * Fecha mínima de emisión: no puede ser anterior a la fecha de la consulta seleccionada.
   *
   * @returns fecha yyyy-MM-dd o null si aún no hay consulta.
   */
  fechaMinimaEmision(): string | null {
    const cita = this.citasFormulario.find(c => String(c.id) === this.formulaForm.controls.citaId.value);
    return cita ? cita.fechaHora.slice(0, 10) : null;
  }

  /**
   * Carga las consultas de una mascota (sin las canceladas) para el combo.
   *
   * @param mascotaId mascota seleccionada.
   */
  private cargarCitasDeMascota(mascotaId: number): void {
    this.citaService.listar({ mascotaId }, 0, 100, 'fechaHora', 'desc').subscribe({
      next: respuesta => {
        this.citasFormulario = respuesta.contenido.filter(c => c.estado !== 'Cancelada');
      },
      error: error => this.mostrarAvisoFormulario(error)
    });
  }

  /**
   * @returns filtros en el formato del servicio.
   */
  private filtrosDesdeFormulario(): FiltrosFormula {
    const v = this.filtrosForm.getRawValue();
    return {
      mascotaId: v.mascotaId ? Number(v.mascotaId) : null,
      medicoId: v.medicoId ? Number(v.medicoId) : null,
      medicamento: v.medicamento || null,
      fechaDesde: v.fechaDesde || null,
      fechaHasta: v.fechaHasta || null
    };
  }

  /**
   * @param error error recibido.
   * @param tipo  tipo de aviso.
   */
  private mostrarAviso(error: unknown, tipo: Aviso['tipo']): void {
    this.aviso = { tipo, texto: mensajeDeError(error) };
  }

  /**
   * @param error error recibido dentro del formulario.
   */
  private mostrarAvisoFormulario(error: unknown): void {
    this.avisoFormulario = { tipo: 'danger', texto: mensajeDeError(error) };
  }
}
