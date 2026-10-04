import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';

import { MedicosServiceService } from './service/medicos-service.service';
import { EspecializacionService } from '../especializacion/service/especializacion.service';
import { Medico } from 'src/app/models/medico';
import { Especializacion } from 'src/app/models/especializacion';
import { MedicoRq } from 'src/app/models/requests';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-medicos',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medicos.component.html',
  styleUrl: './medicos.component.scss'
})
export class MedicosComponent {
  // Variables para el modal.
  modalInstance: Modal | null = null;
  titleModal = '';
  modoFormulario = '';
  titleBoton = '';

  // Variables para la paginación y búsqueda en la datatable.
  listMedicos: Medico[] = [];
  terminoBusqueda = '';
  paginaActual = 1;
  readonly registrosPorPagina = 10;

  // Lista para el select de especializaciones.
  listEspecializaciones: Especializacion[] = [];

  // Formulario para crear o editar médico.
  form!: FormGroup;
  medicoSelected: Medico | null = null;

  readonly tiposDocumento = ['CC', 'CE', 'PA'];

  constructor(private readonly medicoService: MedicosServiceService,
    private readonly especializacionService: EspecializacionService,
    private readonly formBuilder: FormBuilder) {
    this.listar();
    this.cargarEspecializaciones();
    this.inicializarFormulario();
  }

  // Metodo que permite inicializar el formulario con sus controles y validaciones.
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', [Validators.required, Validators.pattern(/^[0-9A-Za-z]+$/)]],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      telefono: ['', Validators.pattern(/^[0-9+\s-]{7,15}$/)],
      registroProfesional: ['', Validators.required],
      especializacion: [null, Validators.required]
    });
  }

  // Obtiene los controles del formulario para facilitar el acceso a sus propiedades y métodos.
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  // Filtra la lista de médicos según el término de búsqueda ingresado por el usuario.
  get medicosFiltrados(): Medico[] {
    const termino = this.normalizarTexto(this.terminoBusqueda.trim());
    if (!termino) {
      return this.listMedicos;
    }

    return this.listMedicos.filter((medico) => {
      const valores = [
        medico.tipoDocumento,
        medico.numeroDocumento,
        `${medico.nombres ?? ''} ${medico.apellidos ?? ''}`,
        medico.registroProfesional,
        medico.especializacion?.nombre,
        medico.telefono
      ];

      return valores.some((valor) =>
        this.normalizarTexto(String(valor ?? '')).includes(termino)
      );
    });
  }

  get medicosPaginados(): Medico[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.medicosFiltrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.medicosFiltrados.length / this.registrosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, indice) => indice + 1);
  }

  // Metodo que permite listar los médicos registrados en la base de datos.
  listar() {
    this.medicoService.getMedicos().subscribe({
      next: (data) => {
        this.listMedicos = data;
        this.paginaActual = 1;
      },
      error: (error) => {
        console.error('Error al obtener los médicos:', error);
      }
    });
  }

  // Carga las especializaciones para el select del formulario.
  cargarEspecializaciones() {
    this.especializacionService.getEspecializaciones().subscribe({
      next: (data) => this.listEspecializaciones = data,
      error: (error) => console.error('Error al obtener las especializaciones:', error)
    });
  }

  // Funcion de comparacion para que el select marque la especializacion correcta al editar.
  compararEspecializacion = (a: Especializacion | null, b: Especializacion | null) => a?.id === b?.id;

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

  // Busca otro médico con el mismo documento o registro profesional.
  private buscarDuplicado(tipoDocumento: string, numeroDocumento: string, registroProfesional: string): string | null {
    const otros = this.listMedicos.filter((medico) => medico.id !== this.medicoSelected?.id);
    if (otros.some((medico) => medico.tipoDocumento === tipoDocumento &&
      this.normalizarTexto(medico.numeroDocumento ?? '') === this.normalizarTexto(numeroDocumento))) {
      return `Ya existe un médico con el documento ${tipoDocumento} ${numeroDocumento}.`;
    }
    if (otros.some((medico) =>
      this.normalizarTexto(medico.registroProfesional ?? '') === this.normalizarTexto(registroProfesional))) {
      return `Ya existe un médico con el registro profesional ${registroProfesional}.`;
    }
    return null;
  }

  // Crea o actualiza el médico dependiendo del modo del formulario.
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.value;
    const numeroDocumento = valores.numeroDocumento.trim();
    const registroProfesional = valores.registroProfesional.trim();

    const duplicado = this.buscarDuplicado(valores.tipoDocumento, numeroDocumento, registroProfesional);
    if (duplicado) {
      Swal.fire('Registro duplicado', duplicado, 'warning');
      return;
    }

    const medico: MedicoRq = {
      id: this.medicoSelected?.id,
      tipoDocumento: valores.tipoDocumento,
      numeroDocumento,
      nombres: valores.nombres.trim(),
      apellidos: valores.apellidos.trim(),
      telefono: valores.telefono?.trim() || null,
      registroProfesional,
      especializacionId: valores.especializacion.id
    };
    const peticion = this.modoFormulario === 'C'
      ? this.medicoService.crearMedico(medico)
      : this.medicoService.actualizarMedico(medico);

    peticion.subscribe({
      next: () => {
        Swal.fire('Éxito', this.modoFormulario === 'C' ? 'Médico creado correctamente.' : 'Médico actualizado correctamente.', 'success');
        this.closeModal();
        this.listar();
      },
      error: (error) => {
        console.error('Error al guardar el médico:', error);
        Swal.fire('Error', error?.error?.message ?? 'No fue posible guardar el médico.', 'error');
      }
    });
  }

  // Solicita confirmación y elimina el médico seleccionado.
  eliminar(medico: Medico) {
    Swal.fire({
      title: '¿Eliminar médico?',
      text: `Se eliminará el médico "${medico.nombres} ${medico.apellidos}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }
      this.medicoService.eliminarMedico(medico.id!).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'El médico fue eliminado correctamente.', 'success');
          this.listar();
        },
        error: (error) => {
          console.error('Error al eliminar el médico:', error);
          Swal.fire('Error', error?.error?.message ?? 'No fue posible eliminar el médico.', 'error');
        }
      });
    });
  }

  // Evento para abrir el modal de crear médico.
  nuevoMedico() {
    this.medicoSelected = null;
    this.resetFormulario();
    this.openModal('C');
  }

  abrirEdicion(medico: Medico) {
    this.medicoSelected = medico;
    this.resetFormulario();
    this.form.patchValue(medico);
    this.openModal('E');
  }

  resetFormulario() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.resetFormulario();
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Médico' : 'Editar Médico';
    this.titleBoton = modo === 'C' ? 'Guardar Médico' : 'Actualizar Médico';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalMedico');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  // Metodo privado para normalizar el texto, eliminando acentos y convirtiendo a minúsculas.
  private normalizarTexto(texto: string): string {
    return texto
      .trim()
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }
}
