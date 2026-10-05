import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { Mascota } from 'src/app/models/mascota';
import { Medico } from 'src/app/models/medico';
import { HistoriaMedicaService } from './service/historia-medica.service';
import { MascotaServiceService } from '../mascota/service/mascota-service.service';
import { MedicosServiceService } from '../medicos/service/medicos-service.service';
import { normalizarTexto } from 'src/app/theme/shared/helpers/tabla-paginada';

import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-historia-medica',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './historia-medica.component.html',
  styleUrl: './historia-medica.component.scss'
})
export class HistoriaMedicaComponent {
  modalInstance: Modal | null = null;

  historias: HistoriaMedica[] = [];
  terminoBusqueda = '';
  historiaSelected: HistoriaMedica | null = null;
  anotaciones: AnotacionHistoria[] = [];
  cargandoAnotaciones = false;

  listMascotas: Mascota[] = [];
  listMedicos: Medico[] = [];

  // Formulario para agregar una anotacion a la historia seleccionada.
  formAnotacion!: FormGroup;
  // Formulario del modal para abrir la historia de una mascota que aun no tiene.
  formHistoria!: FormGroup;
  guardando = false;

  constructor(private readonly historiaService: HistoriaMedicaService,
    private readonly mascotaService: MascotaServiceService,
    private readonly medicosService: MedicosServiceService,
    private readonly formBuilder: FormBuilder) {
    this.formAnotacion = this.formBuilder.group({
      medico: [null, Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(1000)]]
    });
    this.formHistoria = this.formBuilder.group({
      mascota: [null, Validators.required],
      medico: [null, Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(1000)]]
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

  get fa(): { [key: string]: AbstractControl } {
    return this.formAnotacion.controls;
  }

  get fh(): { [key: string]: AbstractControl } {
    return this.formHistoria.controls;
  }

  get historiasFiltradas(): HistoriaMedica[] {
    const termino = normalizarTexto(this.terminoBusqueda.trim());
    if (!termino) {
      return this.historias;
    }
    return this.historias.filter((historia) =>
      [
        historia.mascota?.nombreMascota,
        historia.mascota?.raza?.especie,
        historia.mascota?.cliente?.nombres,
        historia.mascota?.cliente?.apellidos
      ].some((valor) => normalizarTexto(String(valor ?? '')).includes(termino))
    );
  }

  // Mascotas que todavia no tienen historia clinica abierta.
  get mascotasSinHistoria(): Mascota[] {
    const conHistoria = new Set(this.historias.map((historia) => historia.mascota?.mascotaId));
    return this.listMascotas.filter((mascota) => !conHistoria.has(mascota.mascotaId));
  }

  listar(seleccionarMascotaId?: number) {
    this.historiaService.getHistorias().subscribe({
      next: (data) => {
        this.historias = data;
        const idBuscado = seleccionarMascotaId ?? this.historiaSelected?.mascota?.mascotaId;
        const historia = data.find((h) => h.mascota?.mascotaId === idBuscado) ?? data[0];
        if (historia) {
          this.seleccionar(historia);
        }
      },
      error: (error) => console.error('Error al obtener las historias:', error)
    });
  }

  seleccionar(historia: HistoriaMedica) {
    this.historiaSelected = historia;
    this.formAnotacion.reset({ medico: null, descripcion: '' });
    this.cargandoAnotaciones = true;
    this.historiaService.getAnotaciones(historia.id ?? 0).subscribe({
      next: (data) => {
        // La mas reciente primero.
        this.anotaciones = data.sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''));
        this.cargandoAnotaciones = false;
      },
      error: (error) => {
        this.cargandoAnotaciones = false;
        console.error('Error al obtener las anotaciones:', error);
      }
    });
  }

  agregarAnotacion() {
    if (this.formAnotacion.invalid || !this.historiaSelected?.mascota?.mascotaId) {
      this.formAnotacion.markAllAsTouched();
      return;
    }
    this.enviar(this.historiaSelected.mascota.mascotaId, this.formAnotacion.value.medico, this.formAnotacion.value.descripcion);
  }

  abrirModalHistoria() {
    this.formHistoria.reset({ mascota: null, medico: null, descripcion: '' });
    const modalElement = document.getElementById('modalHistoria');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  closeModal() {
    this.modalInstance?.hide();
  }

  crearHistoria() {
    if (this.formHistoria.invalid) {
      this.formHistoria.markAllAsTouched();
      return;
    }
    const { mascota, medico, descripcion } = this.formHistoria.value;
    this.enviar(mascota.mascotaId, medico, descripcion, true);
  }

  // El backend crea la historia si la mascota no tiene, por eso ambos formularios usan crearAnotacion.
  private enviar(mascotaId: number, medico: Medico, descripcion: string, esNueva = false) {
    this.guardando = true;
    this.historiaService.crearAnotacion({ mascotaId, medicoId: medico.id ?? 0, descripcion: descripcion.trim() }).subscribe({
      next: () => {
        this.guardando = false;
        if (esNueva) {
          this.closeModal();
        }
        this.listar(mascotaId);
        Swal.fire({ icon: 'success', title: esNueva ? 'Historia abierta' : 'Anotación agregada', timer: 1600, showConfirmButton: false });
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al guardar la anotación:', error);
        Swal.fire({ icon: 'error', title: 'No se pudo guardar', text: 'Intenta de nuevo más tarde.' });
      }
    });
  }
}
