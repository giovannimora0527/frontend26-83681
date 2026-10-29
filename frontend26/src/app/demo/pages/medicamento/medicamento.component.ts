import { Component } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';

import { Medicamento } from 'src/app/models/medicamento';
import { MedicamentoService } from './service/medicamento.service';

type ColumnaOrden = 'nombre' | 'presentacion' | 'descripcion' | 'fechaCompra' | 'fechaVence';

/**
 * Componente de gestión de medicamentos: listado paginado con búsqueda y ordenamiento,
 * creación y edición mediante un modal con formulario reactivo.
 */
@Component({
  selector: 'app-medicamento',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbTooltipModule],
  templateUrl: './medicamento.component.html',
  styleUrl: './medicamento.component.scss'
})
export class MedicamentoComponent {
  // Variables para el modal.
  modalInstance: Modal | null = null;
  titleModal: string = '';
  modoFormulario: string = '';
  titleBoton: string = '';

  // Variables para la paginación, ordenamiento y búsqueda en la datatable.
  listMedicamentos: Medicamento[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;
  columnaOrden: ColumnaOrden = 'nombre';
  direccionOrden: 'asc' | 'desc' = 'asc';
  cargando = false;
  errorLista = '';

  // Formulario para crear o editar medicamento.
  form!: FormGroup;
  medicamentoSelected: Medicamento | null = null;
  enviando = false;
  respuestaError = '';

  constructor(
    private readonly medicamentoService: MedicamentoService,
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormulario();
    this.listar();
  }

  /** Inicializa el formulario con sus controles y validaciones. */
  inicializarFormulario(): void {
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      presentacion: ['', Validators.maxLength(100)],
      descripcion: [''],
      fechaCompra: ['', Validators.required],
      fechaVence: ['', Validators.required]
    }, { validators: this.validarFechas });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /** Filtra y ordena según el término de búsqueda y la columna activa. */
  get medicamentosFiltrados(): Medicamento[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    const filtradas = this.listMedicamentos.filter((medicamento) => {
      if (!termino) {
        return true;
      }
      const valores = [
        medicamento.nombre,
        medicamento.presentacion,
        medicamento.descripcion,
        medicamento.fechaCompra ? formatDate(medicamento.fechaCompra, 'yyyy-MM-dd', 'en-US') : '',
        medicamento.fechaVence ? formatDate(medicamento.fechaVence, 'yyyy-MM-dd', 'en-US') : ''
      ];
      return valores.some((valor) => this.normalizarTexto(String(valor ?? '')).includes(termino));
    });

    return [...filtradas].sort((a, b) => {
      const valorA = this.obtenerValorOrden(a, this.columnaOrden);
      const valorB = this.obtenerValorOrden(b, this.columnaOrden);
      const comparacion = typeof valorA === 'number' && typeof valorB === 'number'
        ? valorA - valorB
        : String(valorA).localeCompare(String(valorB), 'es', { numeric: true, sensitivity: 'base' });
      return this.direccionOrden === 'asc' ? comparacion : -comparacion;
    });
  }

  private obtenerValorOrden(medicamento: Medicamento, columna: ColumnaOrden): string | number {
    switch (columna) {
      case 'nombre':
        return medicamento.nombre ?? '';
      case 'presentacion':
        return medicamento.presentacion ?? '';
      case 'descripcion':
        return medicamento.descripcion ?? '';
      case 'fechaCompra':
        return medicamento.fechaCompra ? new Date(medicamento.fechaCompra).getTime() : 0;
      case 'fechaVence':
        return medicamento.fechaVence ? new Date(medicamento.fechaVence).getTime() : 0;
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

  get medicamentosPaginados(): Medicamento[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.medicamentosFiltrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.medicamentosFiltrados.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  /** Lista los registros de la base de datos y los muestra en la tabla. */
  listar(): void {
    this.cargando = true;
    this.errorLista = '';
    this.medicamentoService.listarMedicamentos().subscribe({
      next: (data) => {
        this.listMedicamentos = data ?? [];
        this.paginaActual = 1;
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.errorLista = this.mensajeError(error, 'No fue posible cargar los medicamentos.');
      }
    });
  }

  // Actualiza el término de búsqueda y reinicia la página actual a 1.
  actualizarBusqueda(event: Event): void {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Normaliza el texto eliminando acentos y convirtiendo a minúsculas.
  private normalizarTexto(texto: string): string {
    return texto
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /** Abre el modal en modo creación ('C'). */
  nuevoMedicamento(modo: string): void {
    this.modoFormulario = modo;
    this.medicamentoSelected = null;
    this.resetFormulario();
    this.openModal(modo);
  }

  resetFormulario(): void {
    this.form.reset({ nombre: '', presentacion: '', descripcion: '', fechaCompra: '', fechaVence: '' });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.respuestaError = '';
  }

  /** Abre el modal en modo edición con los datos del registro seleccionado. */
  abrirEdicion(medicamento: Medicamento): void {
    this.medicamentoSelected = medicamento;
    this.modoFormulario = 'E';
    this.respuestaError = '';
    this.form.reset({
      nombre: medicamento.nombre ?? '',
      presentacion: medicamento.presentacion ?? '',
      descripcion: medicamento.descripcion ?? '',
      fechaCompra: medicamento.fechaCompra ? String(medicamento.fechaCompra).substring(0, 10) : '',
      fechaVence: medicamento.fechaVence ? String(medicamento.fechaVence).substring(0, 10) : ''
    });
    this.openModal(this.modoFormulario);
  }

  /** Crea o actualiza el registro según el modo del formulario. */
  guardarMedicamento(): void {
    if (this.form.invalid || this.enviando) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const medicamento: Medicamento = {
      id: this.medicamentoSelected?.id,
      nombre: String(valores.nombre).trim(),
      presentacion: String(valores.presentacion ?? '').trim(),
      descripcion: String(valores.descripcion ?? '').trim(),
      fechaCompra: valores.fechaCompra,
      fechaVence: valores.fechaVence
    };

    this.enviando = true;
    this.respuestaError = '';
    const solicitud = this.modoFormulario === 'C'
      ? this.medicamentoService.crearMedicamento(medicamento)
      : this.medicamentoService.actualizarMedicamento(medicamento);

    solicitud.subscribe({
      next: (respuesta) => {
        this.enviando = false;
        const mensaje = this.obtenerMensajeRespuesta(
          respuesta,
          this.modoFormulario === 'C' ? 'El medicamento fue creado correctamente.' : 'El medicamento fue actualizado correctamente.'
        );
        this.closeModal();
        this.listar();
        Swal.fire('Operación exitosa', mensaje, 'success');
      },
      error: (error) => {
        this.enviando = false;
        this.respuestaError = this.mensajeError(error, 'No fue posible guardar el medicamento.');
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

  /** Extrae un mensaje comprensible del error devuelto por el backend. */
  private mensajeError(error: unknown, predeterminado: string): string {
    if (error && typeof error === 'object') {
      const respuesta = error as { status?: number; error?: { message?: unknown } };
      if (respuesta.status === 0) {
        return 'No fue posible comunicarse con el servidor. Intenta de nuevo más tarde.';
      }
      const mensaje = respuesta.error?.message;
      if (typeof mensaje === 'string' && mensaje.trim()) {
        return mensaje;
      }
    }
    return predeterminado;
  }

  closeModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.resetFormulario();
  }

  openModal(modo: string): void {
    this.titleModal = modo === 'C' ? 'Crear Medicamento' : 'Editar Medicamento';
    this.titleBoton = modo === 'C' ? 'Guardar Medicamento' : 'Actualizar Medicamento';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearMedicamento');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  /** Validador de grupo: la fecha de vencimiento no puede ser anterior a la fecha de compra. */
  private readonly validarFechas: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
    const compra = grupo.get('fechaCompra')?.value;
    const vence = grupo.get('fechaVence')?.value;
    return compra && vence && vence < compra ? { fechasInvalidas: true } : null;
  };
}
