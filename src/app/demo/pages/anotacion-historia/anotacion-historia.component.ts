import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';

import { AnotacionHistoriaService } from './service/anotacion-historia.service';
import { MascotaServiceService } from '../mascota/service/mascota-service.service';
import { MedicosServiceService } from '../medicos/service/medicos-service.service';
import { Mascota } from 'src/app/models/mascota';
import { Medico } from 'src/app/models/medico';
import { AnotacionRq } from 'src/app/models/requests';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-anotacion-historia',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './anotacion-historia.component.html',
  styleUrl: './anotacion-historia.component.scss'
})
export class AnotacionHistoriaComponent {
  // Listas para los selects del formulario.
  listMascotas: Mascota[] = [];
  listMedicos: Medico[] = [];

  // Formulario para registrar la anotacion.
  form!: FormGroup;

  constructor(private readonly anotacionService: AnotacionHistoriaService,
    private readonly mascotaService: MascotaServiceService,
    private readonly medicoService: MedicosServiceService,
    private readonly formBuilder: FormBuilder) {
    this.cargarListas();
    this.inicializarFormulario();
  }

  // Metodo que permite inicializar el formulario con sus controles y validaciones.
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      mascota: [null, Validators.required],
      medico: [null, Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(2000)]]
    });
  }

  // Obtiene los controles del formulario para facilitar el acceso a sus propiedades y métodos.
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  // Carga las mascotas y medicos para los selects del formulario.
  cargarListas() {
    this.mascotaService.getMascotas().subscribe({
      next: (data) => this.listMascotas = data,
      error: (error) => console.error('Error al obtener las mascotas:', error)
    });
    this.medicoService.getMedicos().subscribe({
      next: (data) => this.listMedicos = data,
      error: (error) => console.error('Error al obtener los médicos:', error)
    });
  }

  // Registra la anotacion en la historia medica de la mascota seleccionada.
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.value;
    const anotacion: AnotacionRq = {
      mascotaId: valores.mascota.mascotaId,
      medicoId: valores.medico.id,
      descripcion: valores.descripcion.trim()
    };

    this.anotacionService.crearAnotacion(anotacion).subscribe({
      next: (respuesta) => {
        Swal.fire('Éxito', respuesta?.message ?? 'Anotación registrada correctamente.', 'success');
        this.limpiar();
      },
      error: (error) => {
        console.error('Error al guardar la anotación:', error);
        Swal.fire('Error', error?.error?.message ?? 'No fue posible guardar la anotación.', 'error');
      }
    });
  }

  limpiar() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
}
