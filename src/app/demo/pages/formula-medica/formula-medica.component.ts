import {
  CommonModule,
  formatDate,
  registerLocaleData
} from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
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
import { FormulaMedica } from 'src/app/models/formula-medica';
import { Medicamento } from 'src/app/models/medicamento';
import { CitaService } from '../cita/service/cita.service';
import { MedicamentoService } from '../medicamento/service/medicamento.service';
import { FormulaMedicaService } from './service/formula-medica.service';

registerLocaleData(localeEsCo);

type ColumnaOrden =| 'fechaEmision'| 'medicamento'| 'dosis'| 'frecuencia' | 'duracion';

@Component({
  selector: 'app-formula-medica',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formula-medica.component.html',
  styleUrl: './formula-medica.component.scss'
})
export class FormulaMedicaComponent {
  formulas: FormulaMedica[] = [];
  citas: Cita[] = [];
  medicamentos: Medicamento[] = [];

  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 5;

  // Orden por defecto: fecha de emisión más reciente primero
  columnaOrden: ColumnaOrden = 'fechaEmision';
  direccionOrden: 'asc' | 'desc' = 'desc';

  cargando = false;
  errorLista = '';
  formulario!: FormGroup;
  formulaSeleccionada: FormulaMedica | null = null;
  detalle: FormulaMedica | null = null;
  modoFormulario: 'C' | 'E' = 'C';
  enviando = false;
  cargandoDetalle = false;
  errorFormulario = '';
  modalFormulario: Modal | null = null;
  modalDetalle: Modal | null = null;

  constructor(
    private readonly formulaMedicaService: FormulaMedicaService,
    private readonly citaService: CitaService,
    private readonly medicamentoService: MedicamentoService,
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormulario();
    this.listarFormulas();
    this.listarCitas();
    this.listarMedicamentos();
  }

  inicializarFormulario(): void {
    this.formulario = this.formBuilder.group({
      citaId: [null, Validators.required],
      medicamentoId: [null, Validators.required],
      fechaEmision: ['', Validators.required],
      dosis: ['', [Validators.required, Validators.maxLength(500)]],
      frecuencia: ['', [Validators.required, Validators.maxLength(100)]],
      duracionTratamiento: [
        '',
        [Validators.required, Validators.maxLength(100)]
      ],
      indicaciones: ['', Validators.maxLength(2000)]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.formulario.controls;
  }

  get formulasFiltradas(): FormulaMedica[] {
    const termino = this.normalizar(this.terminoBusqueda.trim());

    const resultado = this.formulas.filter((formula) => {
      if (!termino) return true;

      const valores = [
        this.formatearFecha(formula.fechaEmision),
        this.formatearFecha(formula.fechaCreacionRegistro),
        formula.cita?.mascota?.nombreMascota,
        formula.cita?.medico?.nombres,
        formula.cita?.medico?.apellidos,
        formula.medicamento?.nombre,
        formula.dosis,
        formula.frecuencia,
        formula.duracionTratamiento,
        formula.indicaciones
      ];

      return valores.some((valor) =>
        this.normalizar(String(valor ?? '')).includes(termino)
      );
    });

    return [...resultado].sort((a, b) => {
      const valorA = this.valorOrden(a, this.columnaOrden);
      const valorB = this.valorOrden(b, this.columnaOrden);

      const comparacion =
        typeof valorA === 'number' && typeof valorB === 'number'
          ? valorA - valorB
          : String(valorA).localeCompare(String(valorB), 'es', {
              numeric: true,
              sensitivity: 'base'
            });

      return this.direccionOrden === 'asc' ? comparacion : -comparacion;
    });
  }

  private valorOrden(
    formula: FormulaMedica,
    columna: ColumnaOrden
  ): string | number {
    switch (columna) {
      case 'fechaEmision':
        return this.aTiempo(formula.fechaEmision);
      case 'medicamento':
        return formula.medicamento?.nombre ?? '';
      case 'dosis':
        return formula.dosis ?? '';
      case 'frecuencia':
        return formula.frecuencia ?? '';
      case 'duracion':
        return formula.duracionTratamiento ?? '';
      default:
        return '';
    }
  }

  ordenarPor(columna: ColumnaOrden): void {
    if (this.columnaOrden === columna) {
      this.direccionOrden =
        this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.columnaOrden = columna;
      this.direccionOrden =
        columna === 'fechaEmision' ? 'desc' : 'asc';
    }

    this.paginaActual = 1;
  }

  get formulasPaginadas(): FormulaMedica[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.formulasFiltradas.slice(
      inicio,
      inicio + this.registrosPorPagina
    );
  }

  get totalPaginas(): number {
    return Math.ceil(
      this.formulasFiltradas.length / this.registrosPorPagina
    );
  }

  get paginas(): number[] {
    return Array.from(
      { length: this.totalPaginas },
      (_, indice) => indice + 1
    );
  }

  actualizarBusqueda(event: Event): void {
    this.terminoBusqueda = (event.target as HTMLInputElement).value;
    this.paginaActual = 1;
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  listarFormulas(): void {
    this.cargando = true;
    this.errorLista = '';

    this.formulaMedicaService.getFormulaMedica().subscribe({
      next: (data: FormulaMedica[]) => {
        this.formulas = data ?? [];
        this.paginaActual = 1;
        this.cargando = false;
      },
      error: (error: unknown) => {
        this.cargando = false;
        this.errorLista = this.mensajeError(
          error,
          'No fue posible cargar las fórmulas médicas.'
        );
      }
    });
  }

  private listarCitas(): void {
    this.citaService.listarCitas().subscribe({
      next: (data: Cita[]) => {
        this.citas = data ?? [];
      },
      error: () => {
        this.errorFormulario =
          'No fue posible cargar las citas para el formulario.';
      }
    });
  }

  private listarMedicamentos(): void {
    this.medicamentoService.listarMedicamentos().subscribe({
      next: (data: Medicamento[]) => {
        this.medicamentos = data ?? [];
      },
      error: () => {
        this.errorFormulario =
          'No fue posible cargar los medicamentos.';
      }
    });
  }

  nuevaFormula(): void {
    this.modoFormulario = 'C';
    this.formulaSeleccionada = null;
    this.errorFormulario = '';

    this.formulario.reset({
      citaId: null,
      medicamentoId: null,
      fechaEmision: '',
      dosis: '',
      frecuencia: '',
      duracionTratamiento: '',
      indicaciones: ''
    });

    this.abrirModal('modalFormulaMedica', 'formulario');
  }

  editarFormula(formula: FormulaMedica): void {
    this.modoFormulario = 'E';
    this.formulaSeleccionada = formula;
    this.errorFormulario = '';

    this.formulario.reset({
      citaId: formula.cita?.id ?? null,
      medicamentoId: formula.medicamento?.id ?? null,
      fechaEmision: this.fechaParaInput(formula.fechaEmision),
      dosis: formula.dosis ?? '',
      frecuencia: formula.frecuencia ?? '',
      duracionTratamiento: formula.duracionTratamiento ?? '',
      indicaciones: formula.indicaciones ?? ''
    });

    this.abrirModal('modalFormulaMedica', 'formulario');
  }

  guardarFormula(): void {
    if (this.formulario.invalid || this.enviando) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valor = this.formulario.getRawValue();
    const cita = this.citas.find(
      (item) => item.id === Number(valor.citaId)
    );

    if (!cita) {
      this.errorFormulario = 'Selecciona una cita válida.';
      return;
    }

    const fechaEmision = String(valor.fechaEmision);
    const tiempoEmision = this.aTiempo(fechaEmision);
    const tiempoCita = this.aTiempo(cita.fechaHora);

    if (tiempoEmision < tiempoCita) {
      this.errorFormulario =
        'La fecha de emisión no puede ser anterior a la fecha de la cita.';
      return;
    }

    const solicitud: FormulaMedica = {
      id: this.formulaSeleccionada?.id,
      citaId: Number(valor.citaId),
      medicamentoId: Number(valor.medicamentoId),
      fechaEmision,
      dosis: String(valor.dosis).trim(),
      frecuencia: String(valor.frecuencia).trim(),
      duracionTratamiento: String(valor.duracionTratamiento).trim(),
      indicaciones: String(valor.indicaciones ?? '').trim()
    };

    this.enviando = true;
    this.errorFormulario = '';

    const operacion =
      this.modoFormulario === 'C'
        ? this.formulaMedicaService.crearFormulaMedica(solicitud)
        : this.formulaMedicaService.actualizarFormulaMedica(solicitud);

    operacion.subscribe({
      next: (respuesta: unknown) => {
        this.enviando = false;

        const mensaje = this.obtenerMensaje(
          respuesta,
          this.modoFormulario === 'C'
            ? 'La fórmula médica fue creada correctamente.'
            : 'La fórmula médica fue actualizada correctamente.'
        );

        this.cerrarModal('formulario');
        this.listarFormulas();
        Swal.fire('Operación exitosa', mensaje, 'success');
      },
      error: (error: unknown) => {
        this.enviando = false;
        this.errorFormulario = this.mensajeError(
          error,
          'No fue posible guardar la fórmula médica.'
        );
      }
    });
  }

  verDetalle(formula: FormulaMedica): void {
    this.detalle = formula;
    this.cargandoDetalle = false;
    this.abrirModal('modalDetalleFormula', 'detalle');
  }

  get fechaMinimaEmision(): string | null {
    const cita = this.citas.find(
      (item) => item.id === Number(this.formulario?.get('citaId')?.value)
    );

    return cita?.fechaHora
      ? this.fechaParaInput(cita.fechaHora)
      : null;
  }

  get citaSeleccionada(): Cita | undefined {
    return this.citas.find(
      (item) => item.id === Number(this.formulario?.get('citaId')?.value)
    );
  }

  get tituloFormulario(): string {
    return this.modoFormulario === 'C'
      ? 'Nueva fórmula médica'
      : 'Actualizar fórmula médica';
  }

  textoCita(cita: Cita): string {
    const mascota = cita.mascota?.nombreMascota ?? 'Mascota';
    const veterinario =
      `${cita.medico?.nombres ?? ''} ${cita.medico?.apellidos ?? ''}`.trim() ||
      'Veterinario';

    return `${mascota} · ${veterinario} · ${this.formatearFecha(cita.fechaHora)}`;
  }

  nombreVeterinario(formula: FormulaMedica): string {
    return (
      `${formula.cita?.medico?.nombres ?? ''} ${
        formula.cita?.medico?.apellidos ?? ''
      }`.trim() || '—'
    );
  }

  nombreCliente(formula: FormulaMedica): string {
    return (
      `${formula.cita?.cliente?.nombres ?? ''} ${
        formula.cita?.cliente?.apellidos ?? ''
      }`.trim() || '—'
    );
  }

  formatearFecha(fecha: Date | string | undefined): string {
    if (!fecha) return '';

    const tiempo = this.aTiempo(fecha);
    if (!tiempo) return String(fecha);

    return formatDate(tiempo, 'dd/MM/yyyy', 'es-CO');
  }

  private fechaParaInput(fecha: Date | string | undefined): string {
    if (!fecha) return '';

    const valor = this.fechaComoDate(fecha);
    if (Number.isNaN(valor.getTime())) return '';

    const pad = (numero: number) => String(numero).padStart(2, '0');

    return `${valor.getFullYear()}-${pad(valor.getMonth() + 1)}-${pad(
      valor.getDate()
    )}T${pad(valor.getHours())}:${pad(valor.getMinutes())}`;
  }

  private aTiempo(fecha: Date | string | undefined): number {
    if (!fecha) return 0;

    const valor = this.fechaComoDate(fecha).getTime();
    return Number.isNaN(valor) ? 0 : valor;
  }

  private fechaComoDate(fecha: Date | string): Date {
    if (fecha instanceof Date) return fecha;

    return new Date(fecha.replace(' ', 'T'));
  }

  private normalizar(texto: string): string {
    return texto
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private abrirModal(
    id: string,
    tipo: 'formulario' | 'detalle'
  ): void {
    const elemento = document.getElementById(id);
    if (!elemento) return;

    const modal = Modal.getOrCreateInstance(elemento);

    if (tipo === 'formulario') {
      this.modalFormulario = modal;
    } else {
      this.modalDetalle = modal;
    }

    modal.show();
  }

  cerrarModal(tipo: 'formulario' | 'detalle'): void {
    if (tipo === 'formulario') {
      this.modalFormulario?.hide();
      this.formulario?.markAsPristine();
      this.formulario?.markAsUntouched();
      this.errorFormulario = '';
    } else {
      this.modalDetalle?.hide();
    }
  }

  private obtenerMensaje(
    respuesta: unknown,
    predeterminado: string
  ): string {
    if (respuesta && typeof respuesta === 'object') {
      const cuerpo = respuesta as {
        message?: unknown;
        mensaje?: unknown;
      };

      const mensaje = cuerpo.message ?? cuerpo.mensaje;
      if (typeof mensaje === 'string') return mensaje;
    }

    return predeterminado;
  }

  private mensajeError(
    error: unknown,
    predeterminado: string
  ): string {
    if (error && typeof error === 'object') {
      const respuesta = error as {
        error?: { message?: unknown; mensaje?: unknown };
        message?: unknown;
      };

      const mensaje =
        respuesta.error?.message ??
        respuesta.error?.mensaje ??
        respuesta.message;

      if (typeof mensaje === 'string' && mensaje.trim()) {
        return mensaje;
      }
    }

    return predeterminado;
  }
}