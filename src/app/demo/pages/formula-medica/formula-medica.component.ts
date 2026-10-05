import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormulaMedica } from 'src/app/models/formula-medica';
import { Cita } from 'src/app/models/cita';
import { Medicamento } from 'src/app/models/medicamento';
import { FormulaMedicaService } from './service/formula-medica.service';
import { CitaService } from '../cita/service/cita.service';
import { MedicamentoService } from '../medicamento/service/medicamento.service';
import { TablaPaginada } from 'src/app/theme/shared/helpers/tabla-paginada';
import { PaginacionComponent } from 'src/app/theme/shared/components/paginacion/paginacion.component';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-formula-medica',
  imports: [CommonModule, ReactiveFormsModule, PaginacionComponent],
  templateUrl: './formula-medica.component.html'
})
export class FormulaMedicaComponent {
  modalInstance: Modal | null = null;
  titleModal = '';
  titleBoton = '';
  modoFormulario = '';

  ordenAsc = false;
  // La formula solo guarda ids; estos mapas permiten mostrar la cita y el medicamento.
  citasPorId = new Map<number, Cita>();
  medicamentosPorId = new Map<number, Medicamento>();
  listCitas: Cita[] = [];
  listMedicamentos: Medicamento[] = [];

  readonly tabla = new TablaPaginada<FormulaMedica>((formula) => {
    const cita = this.citasPorId.get(formula.citaId ?? 0);
    return [
      cita?.mascota?.nombreMascota,
      `${cita?.medico?.nombres ?? ''} ${cita?.medico?.apellidos ?? ''}`,
      this.medicamentosPorId.get(formula.medicamentoId ?? 0)?.nombre,
      formula.dosis,
      formula.indicaciones
    ];
  });

  form!: FormGroup;
  formulaSelected: FormulaMedica | null = null;
  guardando = false;

  constructor(private readonly formulaService: FormulaMedicaService,
    private readonly citaService: CitaService,
    private readonly medicamentoService: MedicamentoService,
    private readonly formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      citaId: [null, Validators.required],
      medicamentoId: [null, Validators.required],
      dosis: ['', [Validators.required, Validators.maxLength(100)]],
      indicaciones: ['', Validators.maxLength(500)]
    });
    this.listar();
    this.cargarCatalogos();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  cargarCatalogos() {
    // El backend solo filtra citas por fechas: se piden las del ultimo año y el proximo mes.
    const desde = new Date();
    desde.setFullYear(desde.getFullYear() - 1);
    const hasta = new Date();
    hasta.setMonth(hasta.getMonth() + 1);
    this.citaService.filtrarPorFechas(`${this.fechaIso(desde)}T00:00:00`, `${this.fechaIso(hasta)}T23:59:59`).subscribe({
      next: (data) => {
        this.listCitas = data
          .filter((cita) => cita.estado !== 'Cancelada')
          .sort((a, b) => (b.fechaHora ?? '').localeCompare(a.fechaHora ?? ''));
        this.citasPorId = new Map(data.map((cita) => [cita.id ?? 0, cita]));
      },
      error: (error) => console.error('Error al obtener las citas:', error)
    });
    this.medicamentoService.getMedicamentos().subscribe({
      next: (data) => {
        this.listMedicamentos = data;
        this.medicamentosPorId = new Map(data.map((medicamento) => [medicamento.id ?? 0, medicamento]));
      },
      error: (error) => console.error('Error al obtener los medicamentos:', error)
    });
  }

  listar() {
    this.formulaService.getFormulasOrdenadas(this.ordenAsc).subscribe({
      next: (data) => this.tabla.cargar(data),
      error: (error) => console.error('Error al obtener las fórmulas:', error)
    });
  }

  cambiarOrden() {
    this.ordenAsc = !this.ordenAsc;
    this.listar();
  }

  cita(formula: FormulaMedica): Cita | undefined {
    return this.citasPorId.get(formula.citaId ?? 0);
  }

  medicamento(formula: FormulaMedica): Medicamento | undefined {
    return this.medicamentosPorId.get(formula.medicamentoId ?? 0);
  }

  nuevaFormula() {
    this.formulaSelected = null;
    this.form.reset({ citaId: null, medicamentoId: null, dosis: '', indicaciones: '' });
    this.openModal('C');
  }

  abrirEdicion(formula: FormulaMedica) {
    this.formulaSelected = formula;
    this.form.reset({
      citaId: formula.citaId,
      medicamentoId: formula.medicamentoId,
      dosis: formula.dosis,
      indicaciones: formula.indicaciones ?? ''
    });
    this.openModal('E');
  }

  openModal(modo: string) {
    this.modoFormulario = modo;
    this.titleModal = modo === 'C' ? 'Nueva Fórmula Médica' : 'Editar Fórmula Médica';
    this.titleBoton = modo === 'C' ? 'Guardar Fórmula' : 'Actualizar Fórmula';
    const modalElement = document.getElementById('modalFormula');
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
    const formula: FormulaMedica = {
      ...this.formulaSelected,
      citaId: Number(valores.citaId),
      medicamentoId: Number(valores.medicamentoId),
      dosis: valores.dosis.trim(),
      indicaciones: valores.indicaciones?.trim()
    };
    const peticion = this.modoFormulario === 'C'
      ? this.formulaService.guardarFormula(formula)
      : this.formulaService.actualizarFormula(formula);

    this.guardando = true;
    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.closeModal();
        this.listar();
        Swal.fire({ icon: 'success', title: this.modoFormulario === 'C' ? 'Fórmula registrada' : 'Fórmula actualizada', timer: 1800, showConfirmButton: false });
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al guardar la fórmula:', error);
        Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: 'Intenta de nuevo más tarde.' });
      }
    });
  }

  private fechaIso(fecha: Date): string {
    const local = new Date(fecha);
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
    return local.toISOString().substring(0, 10);
  }
}
