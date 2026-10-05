import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Medicamento } from 'src/app/models/medicamento';
import { MedicamentoService } from './service/medicamento.service';
import { TablaPaginada } from 'src/app/theme/shared/helpers/tabla-paginada';
import { PaginacionComponent } from 'src/app/theme/shared/components/paginacion/paginacion.component';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-medicamento',
  imports: [CommonModule, ReactiveFormsModule, PaginacionComponent],
  templateUrl: './medicamento.component.html'
})
export class MedicamentoComponent {
  modalInstance: Modal | null = null;
  titleModal = '';
  titleBoton = '';
  modoFormulario = '';

  readonly tabla = new TablaPaginada<Medicamento>((m) => [m.nombre, m.presentacion, m.descripcion]);
  readonly presentaciones = ['Tableta', 'Cápsula', 'Jarabe', 'Suspensión oral', 'Inyectable', 'Gotas', 'Crema / ungüento', 'Champú'];

  form!: FormGroup;
  medicamentoSelected: Medicamento | null = null;
  guardando = false;

  constructor(private readonly medicamentoService: MedicamentoService,
    private readonly formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.maxLength(80)]],
      presentacion: ['', Validators.required],
      descripcion: ['', Validators.maxLength(250)]
    });
    this.listar();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  listar() {
    this.medicamentoService.getMedicamentos().subscribe({
      next: (data) => this.tabla.cargar(data),
      error: (error) => console.error('Error al obtener los medicamentos:', error)
    });
  }

  nuevoMedicamento() {
    this.medicamentoSelected = null;
    this.form.reset({ nombre: '', presentacion: '', descripcion: '' });
    this.openModal('C');
  }

  abrirEdicion(medicamento: Medicamento) {
    this.medicamentoSelected = medicamento;
    this.form.reset({
      nombre: medicamento.nombre,
      presentacion: medicamento.presentacion,
      descripcion: medicamento.descripcion ?? ''
    });
    this.openModal('E');
  }

  openModal(modo: string) {
    this.modoFormulario = modo;
    this.titleModal = modo === 'C' ? 'Crear Medicamento' : 'Editar Medicamento';
    this.titleBoton = modo === 'C' ? 'Guardar Medicamento' : 'Actualizar Medicamento';
    const modalElement = document.getElementById('modalMedicamento');
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
    const medicamento: Medicamento = {
      ...this.medicamentoSelected,
      nombre: valores.nombre.trim(),
      presentacion: valores.presentacion,
      descripcion: valores.descripcion?.trim()
    };
    const peticion = this.modoFormulario === 'C'
      ? this.medicamentoService.guardarMedicamento(medicamento)
      : this.medicamentoService.actualizarMedicamento(medicamento);

    this.guardando = true;
    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.closeModal();
        this.listar();
        Swal.fire({ icon: 'success', title: this.modoFormulario === 'C' ? 'Medicamento creado' : 'Medicamento actualizado', timer: 1800, showConfirmButton: false });
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al guardar el medicamento:', error);
        Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: 'Intenta de nuevo más tarde.' });
      }
    });
  }
}
