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
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertaComponent, ModalComponent, PaginadorComponent],
  templateUrl: './formula-medica.component.html',
  styleUrl: './formula-medica.component.scss'
})
export class FormulaMedicaComponent {
  private readonly formulaService = inject(FormulaMedicaService);
  private readonly citaService = inject(CitaService);
  private readonly medicamentoService = inject(MedicamentoService);
  /** Catálogo de medicamentos para el combo del formulario. */
  medicamentos: Medicamento[] = [];
  private readonly catalogo = inject(CatalogoService);

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
