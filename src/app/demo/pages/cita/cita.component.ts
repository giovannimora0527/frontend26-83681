import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cita } from 'src/app/models/cita';
import { Mascota } from 'src/app/models/mascota';
import { Medico } from 'src/app/models/medico';
import { CitaService } from './service/cita.service';
import { MascotaServiceService } from '../mascota/service/mascota-service.service';
import { MedicosServiceService } from '../medicos/service/medicos-service.service';
import { TablaPaginada } from 'src/app/theme/shared/helpers/tabla-paginada';
import { PaginacionComponent } from 'src/app/theme/shared/components/paginacion/paginacion.component';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-cita',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PaginacionComponent],
  templateUrl: './cita.component.html'
})
export class CitaComponent {
  modalInstance: Modal | null = null;
  titleModal = '';
  titleBoton = '';
  modoFormulario = '';

  readonly estados = ['Solicitada', 'Programada', 'Confirmada', 'Atendida', 'Cancelada'];
  readonly coloresEstado: Record<string, string> = {
    Solicitada: 'bg-warning text-dark',
    Programada: 'bg-info',
    Confirmada: 'bg-primary',
    Atendida: 'bg-success',
    Cancelada: 'bg-secondary'
  };

  // Filtros: rango de fechas (va al backend) y estado (se filtra en pantalla).
  fechaInicio = this.sumarDias(-30);
  fechaFinal = this.sumarDias(60);
  estadoFiltro = '';
  citas: Cita[] = [];
  readonly tabla = new TablaPaginada<Cita>((cita) => [
    cita.mascota?.nombreMascota,
    `${cita.mascota?.cliente?.nombres ?? ''} ${cita.mascota?.cliente?.apellidos ?? ''}`,
    `${cita.medico?.nombres ?? ''} ${cita.medico?.apellidos ?? ''}`,
    cita.motivo
  ]);

  listMascotas: Mascota[] = [];
  listMedicos: Medico[] = [];

  form!: FormGroup;
  citaSelected: Cita | null = null;
  guardando = false;

  constructor(private readonly citaService: CitaService,
    private readonly mascotaService: MascotaServiceService,
    private readonly medicosService: MedicosServiceService,
    private readonly formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      mascota: [null, Validators.required],
      medico: [null, Validators.required],
      fechaHora: ['', Validators.required],
      motivo: ['', [Validators.required, Validators.maxLength(200)]],
      estado: ['Programada', Validators.required]
    });
    this.listar();
    this.mascotaService.getMascotas().subscribe({
      next: (data) => this.listMascotas = data,
      error: (error) => console.error('Error al obtener las mascotas:', error)
    });
    this.medicosService.getMedicos().subscribe({
      next: (data) => this.listMedicos = data,
      error: (error) => console.error('Error al obtener los médicos:', error)
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  // Las mascotas de solicitudes web no tienen id: se comparan por referencia.
  compararMascota = (a: Mascota | null, b: Mascota | null) => a === b || (!!a?.mascotaId && a.mascotaId === b?.mascotaId);
  compararMedico = (a: Medico | null, b: Medico | null) => a?.id === b?.id;

  listar() {
    if (!this.fechaInicio || !this.fechaFinal) {
      return;
    }
    this.citaService.filtrarPorFechas(`${this.fechaInicio}T00:00:00`, `${this.fechaFinal}T23:59:59`).subscribe({
      next: (data) => {
        this.citas = data.sort((a, b) => (a.fechaHora ?? '').localeCompare(b.fechaHora ?? ''));
        this.aplicarEstado();
      },
      error: (error) => console.error('Error al obtener las citas:', error)
    });
  }

  aplicarEstado() {
    this.tabla.cargar(this.estadoFiltro ? this.citas.filter((cita) => cita.estado === this.estadoFiltro) : this.citas);
  }

  contarEstado(estado: string): number {
    return this.citas.filter((cita) => cita.estado === estado).length;
  }

  nuevaCita() {
    this.citaSelected = null;
    this.form.reset({ mascota: null, medico: null, fechaHora: '', motivo: '', estado: 'Programada' });
    this.openModal('C');
  }

  abrirEdicion(cita: Cita) {
    this.citaSelected = cita;
    this.form.reset({
      mascota: cita.mascota,
      medico: cita.medico,
      fechaHora: cita.fechaHora?.substring(0, 16),
      motivo: cita.motivo,
      estado: cita.estado
    });
    this.openModal('E');
  }

  openModal(modo: string) {
    this.modoFormulario = modo;
    this.titleModal = modo === 'C' ? 'Agendar Cita' : 'Editar Cita';
    this.titleBoton = modo === 'C' ? 'Agendar' : 'Actualizar Cita';
    const modalElement = document.getElementById('modalCita');
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
    const cita: Cita = {
      ...this.citaSelected,
      mascota: valores.mascota,
      clienteId: valores.mascota?.cliente?.clienteId,
      medico: valores.medico,
      fechaHora: `${valores.fechaHora}:00`,
      motivo: valores.motivo.trim(),
      estado: valores.estado
    };
    const peticion = this.modoFormulario === 'C'
      ? this.citaService.guardarCita(cita)
      : this.citaService.actualizarCita(cita);

    this.guardando = true;
    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.closeModal();
        this.listar();
        Swal.fire({ icon: 'success', title: this.modoFormulario === 'C' ? 'Cita agendada' : 'Cita actualizada', timer: 1800, showConfirmButton: false });
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al guardar la cita:', error);
        Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: 'Intenta de nuevo más tarde.' });
      }
    });
  }

  // Devuelve la fecha de hoy + dias en formato yyyy-MM-dd.
  private sumarDias(dias: number): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
    return fecha.toISOString().substring(0, 10);
  }
}
