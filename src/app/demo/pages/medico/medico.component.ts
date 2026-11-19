import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import { Medico } from 'src/app/models/medico';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicoService } from './service/medico.service';
import { MedicoRq } from 'src/app/models/medico-rq';
import { Especializacion } from 'src/app/models/especializacion';
import { EspecializacionService } from '../especializacion/service/especializacion.service';

/** Presenta la pantalla de veterinarios y gestiona sus acciones. */
@Component({
  selector: 'app-medico',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medico.component.html',
  styleUrl: './medico.component.scss'
})
export class MedicoComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.nonNullable.group({
    nombres: ['', [Validators.required, Validators.pattern(/\S/)]],
    apellidos: ['', [Validators.required, Validators.pattern(/\S/)]],
    tipoDocumento: ['', [Validators.required, Validators.pattern(/^(CC|PA)$/)]],
    numeroDocumento: ['', [Validators.required, Validators.pattern(/\S/)]],
    telefono: ['', [Validators.required, Validators.pattern(/\S/)]],
    registroProfesional: ['', [Validators.required, Validators.pattern(/\S/)]],
    especializacionId: this.formBuilder.control<number | null>(null, Validators.required)
  });

  readonly campos = [
    { clave: 'nombres', etiqueta: 'Nombres' },
    { clave: 'apellidos', etiqueta: 'Apellidos' },
    { clave: 'numeroDocumento', etiqueta: 'Número de documento' },
    { clave: 'telefono', etiqueta: 'Teléfono' },
    { clave: 'registroProfesional', etiqueta: 'Registro profesional' }
  ] as const;

  readonly tiposDocumento = [
    { valor: 'CC', etiqueta: 'CC - Cédula de Ciudadanía' },
    { valor: 'PA', etiqueta: 'PA - Pasaporte' }
  ] as const;

  listEspecializaciones: Especializacion[] = [];
  medicoSelected: Medico | null = null;
  enviando = false;
  cargandoEspecializaciones = false;
  errorEspecializaciones = '';
  errorMedicos = '';
  respuestaError = '';
  
  // Variables para el modal.
  modalInstance: Modal | null = null;
  titleModal: string = "";
  modoFormulario: string = "";
  titleBoton: string = "";

  // Variables para la paginación y búsqueda en la datatable.
  listMedicos: Medico[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 5;

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private readonly medicoService: MedicoService,
    private readonly especializacionService: EspecializacionService) {
    this.destroyRef.onDestroy(() => this.modalInstance?.dispose());
    this.listar();
    this.listarEspecializaciones();
  }

  /** Consulta el catálogo de especialidades veterinarias. */
  listarEspecializaciones(): void {
    this.cargandoEspecializaciones = true;
    this.errorEspecializaciones = '';
    this.especializacionService.listar().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.cargandoEspecializaciones = false)
    ).subscribe({
      next: especializaciones => this.listEspecializaciones = especializaciones,
      error: error => {
        this.errorEspecializaciones = 'No fue posible cargar las especializaciones.';
        console.error('Error al listar especializaciones:', error);
      }
    });
  }

  /**
     * Filtra la lista de médicos según el término de búsqueda ingresado por el usuario.
     * @returns Un arreglo de médicos filtrados.
     */
  get medicoFiltrados(): Medico[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    if (!termino) {
      return this.listMedicos;
    }

    return this.listMedicos.filter((medico) => {
      if (termino === 'activo' || termino === 'true') {
        return medico.estado === true;
      }
      if (termino === 'inactivo' || termino === 'false') {
        return medico.estado === false;
      }

      const valores = [
        this.obtenerEstado(medico),
        medico.nombres,
        medico.apellidos,
        medico.tipoDocumento,
        medico.numeroDocumento,
        medico.especializacion?.nombre,
        medico.registroProfesional,
        medico.telefono
      ];

      return valores.some((valor) =>
        this.normalizarTexto(String(valor ?? '')).includes(termino)
      );
    });
  }

  /** Devuelve el estado que se usa para presentar el registro. */
  obtenerEstado(medico: Medico): string {
    return medico.estado == null ? 'No informado' : medico.estado ? 'Activo' : 'Inactivo';
  }

  /** Devuelve los veterinarios que se muestran en la página actual. */
  get medicoPaginados(): Medico[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.medicoFiltrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  /** Calcula cuántas páginas se necesitan para mostrar el listado. */
  get totalPaginas(): number {
    return Math.ceil(this.medicoFiltrados.length / this.registrosPorPagina);
  }

  /** Devuelve los números de página disponibles para el listado. */
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  /**
   * Metodo que permite listar los medicos registradas en la base de datos y mostrarlas en la tabla.
   */
  listar() {
    this.errorMedicos = '';
    this.medicoService.listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (data) => {
            this.listMedicos = Array.isArray(data) ? data : [];
            this.paginaActual = 1;
          },
          error: (error) => {
            // Se pasa la respuesta completa para conservar el estado HTTP y el mensaje del servidor.
            this.errorMedicos = this.mensajeErrorCarga(error);
            console.error('Error al obtener los médicos:', error);
          }
        }
      );
  }

  /** Traduce los fallos de la consulta de médicos en mensajes que permitan identificar su causa. */
  private mensajeErrorCarga(error: { status?: number; error?: { mensaje?: string; message?: string } }): string {
    if (error.status === 0) return 'No se pudo conectar con el servidor. Verifica que el backend esté activo.';
    if (error.status === 401) return 'La sesión venció o no es válida. Inicia sesión nuevamente.';
    if (error.status === 403) return 'Tu rol no tiene permiso para consultar los médicos.';
    if (error.status === 500) return 'El servidor no pudo consultar los médicos por un error en la base de datos. Debe corregirse el mapeo del estado del médico en el backend.';
    const detalle = error.error?.mensaje ?? error.error?.message;
    return detalle
      ? `No fue posible cargar los médicos: ${detalle}`
      : `No fue posible cargar los médicos (HTTP ${error.status ?? 'desconocido'}).`;
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

  // Evento para abrir el modal de crear o editar medicos, dependiendo del modo recibido.
  /** Prepara el formulario para registrar un veterinario. */
  nuevoMedico(modo: string) {
    if (this.enviando) {
      return;
    }
    this.medicoSelected = null;
    this.form.reset();
    this.respuestaError = '';
    this.titleModal = modo === 'C' ? 'Crear Médico' : 'Editar Médico';
    this.modoFormulario = modo;
    this.openModal(modo);
  }

  /** Abre el formulario con los datos del registro que se quiere modificar. */
  abrirEdicion(medico: Medico) {
    if (this.enviando) {
      return;
    }
    this.medicoSelected = medico;
    this.respuestaError = '';
    this.form.reset({
      nombres: medico.nombres,
      apellidos: medico.apellidos,
      tipoDocumento: this.tiposDocumento.some(tipo => tipo.valor === medico.tipoDocumento?.trim())
        ? medico.tipoDocumento.trim() : '',
      numeroDocumento: medico.numeroDocumento,
      telefono: medico.telefono,
      registroProfesional: medico.registroProfesional,
      especializacionId: medico.especializacionId ?? medico.especializacion?.id ?? null
    });
    this.modoFormulario = 'E';
    this.openModal(this.modoFormulario);
  }

  /** Cierra la ventana indicada. */
  closeModal() {
    if (this.enviando) {
      return;
    }
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  /** Guarda el veterinario. */
  guardarMedico(): void {
    if (this.enviando) {
      return;
    }
    this.form.markAllAsTouched();
    const valores = this.form.getRawValue();
    if (this.form.invalid || valores.especializacionId == null) {
      this.respuestaError = 'Completa los campos obligatorios.';
      return;
    }
    if (this.errorEspecializaciones || this.cargandoEspecializaciones ||
        !this.listEspecializaciones.some(item => item.id === valores.especializacionId)) {
      this.respuestaError = 'Selecciona una especialización disponible.';
      return;
    }
    const datos: MedicoRq = {
      nombres: valores.nombres.trim(),
      apellidos: valores.apellidos.trim(),
      tipoDocumento: valores.tipoDocumento,
      numeroDocumento: valores.numeroDocumento.trim(),
      telefono: valores.telefono.trim(),
      registroProfesional: valores.registroProfesional.trim(),
      especializacionId: valores.especializacionId
    };
    const id = this.medicoSelected?.id;
    if (this.modoFormulario === 'E' && id == null) {
      this.respuestaError = 'No se puede actualizar un médico sin identificador.';
      return;
    }
    const solicitud = id != null
      ? this.medicoService.actualizarMedico({ ...datos, id })
      : this.medicoService.crearMedico(datos);
    this.enviando = true;
    this.respuestaError = '';
    solicitud.pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.enviando = false)
    ).subscribe({
      next: () => {
        this.enviando = false;
        this.closeModal();
        this.listar();
        void Swal.fire('Operación exitosa', id == null
          ? 'El médico fue creado correctamente.' : 'El médico fue actualizado correctamente.', 'success');
      },
      error: error => {
        this.respuestaError = 'No fue posible guardar el médico. Revisa los datos e inténtalo de nuevo.';
        console.error('Error al guardar el médico:', error);
      }
    });
  }

  /** Abre la ventana indicada. */
  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Médico' : 'Editar Médico';
    this.titleBoton = modo === 'C' ? 'Guardar Médico' : 'Actualizar Médico';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearMedico');
    if (modalElement) {
      // Verificar si ya existe una instancia del modal
      this.modalInstance ??= new Modal(modalElement, { backdrop: 'static', keyboard: false });
      this.modalInstance.show();
    }
  }

}
