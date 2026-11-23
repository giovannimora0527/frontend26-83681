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

@Component({
  selector: 'app-formula-medica',
  imports: [CommonModule, ReactiveFormsModule, NgbTooltipModule],
  templateUrl: './formula-medica.component.html',
  styleUrl: './formula-medica.component.scss'
})
export class FormulaMedicaComponent {
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

}
