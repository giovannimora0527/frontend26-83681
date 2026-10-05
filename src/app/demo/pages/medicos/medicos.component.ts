import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Medico } from 'src/app/models/medico';
import { Especializacion } from 'src/app/models/especializacion';
import { MedicosServiceService } from './service/medicos-service.service';
import { EspecializacionService } from '../especializacion/service/especializacion.service';
import { TablaPaginada } from 'src/app/theme/shared/helpers/tabla-paginada';
import { PaginacionComponent } from 'src/app/theme/shared/components/paginacion/paginacion.component';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-medicos',
  imports: [CommonModule, ReactiveFormsModule, PaginacionComponent],
  templateUrl: './medicos.component.html',
  styleUrl: './medicos.component.scss'
})
export class MedicosComponent {
  // Variables para el modal.
  modalInstance: Modal | null = null;
  titleModal: string = "";
  modoFormulario: string = "";
  titleBoton: string = "";

  readonly tabla = new TablaPaginada<Medico>((medico) => [
    medico.nombres,
    medico.apellidos,
    medico.numeroDocumento,
    medico.registroProfesional,
    medico.especializacion?.nombre,
    medico.telefono
  ]);

  readonly tiposDocumento = [
    { valor: 'CC', texto: 'Cédula de ciudadanía' },
    { valor: 'CE', texto: 'Cédula de extranjería' },
    { valor: 'PA', texto: 'Pasaporte' }
  ];
  listEspecializaciones: Especializacion[] = [];

  // Formulario para crear o editar médico.
  form!: FormGroup;
  medicoSelected: Medico | null = null;
  guardando = false;

  constructor(private readonly medicosService: MedicosServiceService,
    private readonly especializacionService: EspecializacionService,
    private readonly formBuilder: FormBuilder) {
    this.inicializarFormulario();
    this.listar();
    this.especializacionService.getEspecializaciones().subscribe({
      next: (data) => this.listEspecializaciones = data,
      error: (error) => console.error('Error al obtener las especializaciones:', error)
    });
  }

  // Metodo que permite inicializar el formulario con sus controles y validaciones.
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      tipoDocumento: ['CC', Validators.required],
      numeroDocumento: ['', [Validators.required, Validators.pattern(/^[0-9A-Za-z]{5,15}$/)]],
      nombres: ['', [Validators.required, Validators.maxLength(60)]],
      apellidos: ['', [Validators.required, Validators.maxLength(60)]],
      telefono: ['', Validators.pattern(/^[0-9+\s-]{7,15}$/)],
      registroProfesional: ['', [Validators.required, Validators.maxLength(20)]],
      especializacion: [null, Validators.required]
    });
  }

  // Obtiene los controles del formulario para facilitar el acceso a sus propiedades y métodos.
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  compararEspecializacion = (a: Especializacion | null, b: Especializacion | null) => a?.id === b?.id;

  listar() {
    this.medicosService.getMedicos().subscribe({
      next: (data) => this.tabla.cargar(data),
      error: (error) => console.error('Error al obtener los médicos:', error)
    });
  }

  resetFormulario() {
    this.form.reset({ tipoDocumento: 'CC', especializacion: null });
  }

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

  closeModal() {
    this.modalInstance?.hide();
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Registrar Médico' : 'Editar Médico';
    this.titleBoton = modo === 'C' ? 'Guardar Médico' : 'Actualizar Médico';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearMedico');
    if (modalElement) {
      // Verificar si ya existe una instancia del modal
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  // Guarda o actualiza el médico segun el modo del formulario.
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.value;
    const medico: Medico = {
      ...this.medicoSelected,
      ...valores,
      numeroDocumento: valores.numeroDocumento.trim(),
      nombres: valores.nombres.trim(),
      apellidos: valores.apellidos.trim(),
      registroProfesional: valores.registroProfesional.trim().toUpperCase()
    };

    const peticion = this.modoFormulario === 'C'
      ? this.medicosService.guardarMedico(medico)
      : this.medicosService.actualizarMedico(medico);

    this.guardando = true;
    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.closeModal();
        this.listar();
        Swal.fire({
          icon: 'success',
          title: this.modoFormulario === 'C' ? 'Médico registrado' : 'Médico actualizado',
          timer: 1800,
          showConfirmButton: false
        });
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al guardar el médico:', error);
        Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: 'Intenta de nuevo más tarde.' });
      }
    });
  }

}
