import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Especializacion } from 'src/app/models/especializacion';
import { EspecializacionService } from './service/especializacion.service';
import { TablaPaginada } from 'src/app/theme/shared/helpers/tabla-paginada';
import { PaginacionComponent } from 'src/app/theme/shared/components/paginacion/paginacion.component';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-especializacion',
  imports: [CommonModule, ReactiveFormsModule, PaginacionComponent],
  templateUrl: './especializacion.component.html'
})
export class EspecializacionComponent {
  modalInstance: Modal | null = null;
  titleModal = '';
  titleBoton = '';
  modoFormulario = '';

  readonly tabla = new TablaPaginada<Especializacion>((e) => [e.codigoEspecializacion, e.nombre, e.descripcion]);

  form!: FormGroup;
  especializacionSelected: Especializacion | null = null;
  guardando = false;

  constructor(private readonly especializacionService: EspecializacionService,
    private readonly formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      codigoEspecializacion: ['', [Validators.required, Validators.maxLength(10)]],
      nombre: ['', [Validators.required, Validators.maxLength(60)]],
      descripcion: ['', Validators.maxLength(250)]
    });
    this.listar();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  listar() {
    this.especializacionService.getEspecializaciones().subscribe({
      next: (data) => this.tabla.cargar(data),
      error: (error) => console.error('Error al obtener las especializaciones:', error)
    });
  }

  nuevaEspecializacion() {
    this.especializacionSelected = null;
    this.form.reset({ codigoEspecializacion: '', nombre: '', descripcion: '' });
    this.openModal('C');
  }

  abrirEdicion(especializacion: Especializacion) {
    this.especializacionSelected = especializacion;
    this.form.reset({
      codigoEspecializacion: especializacion.codigoEspecializacion,
      nombre: especializacion.nombre,
      descripcion: especializacion.descripcion ?? ''
    });
    this.openModal('E');
  }

  openModal(modo: string) {
    this.modoFormulario = modo;
    this.titleModal = modo === 'C' ? 'Crear Especialización' : 'Editar Especialización';
    this.titleBoton = modo === 'C' ? 'Guardar' : 'Actualizar';
    const modalElement = document.getElementById('modalEspecializacion');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  closeModal() {
    this.modalInstance?.hide();
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.value;
    const especializacion: Especializacion = {
      ...this.especializacionSelected,
      codigoEspecializacion: valores.codigoEspecializacion.trim().toUpperCase(),
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion?.trim()
    };
    const peticion = this.modoFormulario === 'C'
      ? this.especializacionService.guardarEspecializacion(especializacion)
      : this.especializacionService.actualizarEspecializacion(especializacion);

    this.guardando = true;
    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.closeModal();
        this.listar();
        Swal.fire({ icon: 'success', title: this.modoFormulario === 'C' ? 'Especialización creada' : 'Especialización actualizada', timer: 1800, showConfirmButton: false });
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al guardar la especialización:', error);
        Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: 'Intenta de nuevo más tarde.' });
      }
    });
  }
}
