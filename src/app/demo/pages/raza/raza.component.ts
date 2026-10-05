import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Raza } from 'src/app/models/raza';
import { RazaService } from './service/raza.service';
import { TablaPaginada } from 'src/app/theme/shared/helpers/tabla-paginada';
import { PaginacionComponent } from 'src/app/theme/shared/components/paginacion/paginacion.component';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-raza',
  imports: [CommonModule, ReactiveFormsModule, PaginacionComponent],
  templateUrl: './raza.component.html'
})
export class RazaComponent {
  modalInstance: Modal | null = null;
  titleModal = '';
  titleBoton = '';
  modoFormulario = '';

  readonly tabla = new TablaPaginada<Raza>((raza) => [raza.especie, raza.nombre]);
  readonly especies = ['Perro', 'Gato', 'Conejo', 'Ave', 'Hámster', 'Reptil'];

  form!: FormGroup;
  razaSelected: Raza | null = null;
  guardando = false;

  constructor(private readonly razaService: RazaService,
    private readonly formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      especie: ['', [Validators.required, Validators.maxLength(40)]],
      nombre: ['', [Validators.required, Validators.maxLength(60)]]
    });
    this.listar();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  listar() {
    this.razaService.getRazas().subscribe({
      next: (data) => this.tabla.cargar(data),
      error: (error) => console.error('Error al obtener las razas:', error)
    });
  }

  nuevaRaza() {
    this.razaSelected = null;
    this.form.reset({ especie: '', nombre: '' });
    this.openModal('C');
  }

  abrirEdicion(raza: Raza) {
    this.razaSelected = raza;
    this.form.reset({ especie: raza.especie, nombre: raza.nombre });
    this.openModal('E');
  }

  openModal(modo: string) {
    this.modoFormulario = modo;
    this.titleModal = modo === 'C' ? 'Crear Raza' : 'Editar Raza';
    this.titleBoton = modo === 'C' ? 'Guardar Raza' : 'Actualizar Raza';
    const modalElement = document.getElementById('modalRaza');
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
    const raza: Raza = {
      ...this.razaSelected,
      especie: this.form.value.especie.trim(),
      nombre: this.form.value.nombre.trim()
    };
    const peticion = this.modoFormulario === 'C'
      ? this.razaService.guardarRaza(raza)
      : this.razaService.actualizarRaza(raza);

    this.guardando = true;
    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.closeModal();
        this.listar();
        Swal.fire({ icon: 'success', title: this.modoFormulario === 'C' ? 'Raza creada' : 'Raza actualizada', timer: 1800, showConfirmButton: false });
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al guardar la raza:', error);
        Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: 'Intenta de nuevo más tarde.' });
      }
    });
  }
}
