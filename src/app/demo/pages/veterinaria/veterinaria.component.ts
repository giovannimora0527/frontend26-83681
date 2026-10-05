import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MascotaServiceService } from '../mascota/service/mascota-service.service';
import { ClienteService } from '../cliente/service/cliente.service';
import { MedicosServiceService } from '../medicos/service/medicos-service.service';
import { Mascota } from 'src/app/models/mascota';
import { Medico } from 'src/app/models/medico';

import Swal from 'sweetalert2';

interface Servicio {
  icono: string;
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-veterinaria',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './veterinaria.component.html',
  styleUrl: './veterinaria.component.scss'
})
export class VeterinariaComponent {
  readonly anioActual = new Date().getFullYear();
  readonly hoy = new Date().toISOString().substring(0, 10);
  menuAbierto = false;

  readonly servicios: Servicio[] = [
    { icono: 'icon-heart', titulo: 'Consulta general', descripcion: 'Valoración completa, diagnóstico y plan de tratamiento para tu mascota.' },
    { icono: 'icon-shield', titulo: 'Vacunación', descripcion: 'Esquemas de vacunación y desparasitación según la edad y especie.' },
    { icono: 'icon-scissors', titulo: 'Cirugía', descripcion: 'Procedimientos programados y esterilización con seguimiento posoperatorio.' },
    { icono: 'icon-activity', titulo: 'Laboratorio', descripcion: 'Exámenes de sangre, coprológicos y pruebas rápidas con resultados oportunos.' },
    { icono: 'icon-droplet', titulo: 'Baño y estética', descripcion: 'Baño medicado, corte de uñas y limpieza de oídos con productos seguros.' },
    { icono: 'icon-alert-circle', titulo: 'Urgencias', descripcion: 'Atención prioritaria para situaciones que no pueden esperar.' }
  ];

  readonly horarios = [
    { dias: 'Lunes a viernes', horas: '7:00 a.m. – 7:00 p.m.' },
    { dias: 'Sábados', horas: '8:00 a.m. – 2:00 p.m.' },
    { dias: 'Domingos y festivos', horas: 'Solo urgencias' }
  ];

  // Datos que vienen del backend.
  totalMascotas: number | null = null;
  totalClientes: number | null = null;
  especies: { nombre: string; cantidad: number }[] = [];
  medicos: Medico[] = [];

  // Formulario de solicitud de cita.
  form!: FormGroup;

  constructor(private readonly mascotaService: MascotaServiceService,
    private readonly clienteService: ClienteService,
    private readonly medicosService: MedicosServiceService,
    private readonly formBuilder: FormBuilder) {
    this.inicializarFormulario();
    this.cargarDatos();
  }

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.maxLength(80)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9+\s-]{7,15}$/)]],
      mascota: ['', Validators.required],
      servicio: ['', Validators.required],
      fecha: ['', Validators.required],
      mensaje: ['', Validators.maxLength(400)]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  // Carga las cifras de la clinica. Si el backend no responde, la pagina se muestra sin ellas.
  cargarDatos() {
    this.mascotaService.getMascotas().subscribe({
      next: (data) => {
        this.totalMascotas = data.length;
        this.especies = this.agruparEspecies(data);
      },
      error: (error) => console.error('Error al obtener las mascotas:', error)
    });
    this.clienteService.getClientes().subscribe({
      next: (data) => this.totalClientes = data.filter((cliente) => cliente.activo !== false).length,
      error: (error) => console.error('Error al obtener los clientes:', error)
    });
    this.medicosService.getMedicos().subscribe({
      next: (data) => this.medicos = data,
      error: (error) => console.error('Error al obtener los médicos:', error)
    });
  }

  // Cuenta cuantas mascotas hay de cada especie, de mayor a menor.
  private agruparEspecies(mascotas: Mascota[]) {
    const conteo = new Map<string, number>();
    for (const mascota of mascotas) {
      const especie = mascota.raza?.especie?.trim();
      if (especie) {
        conteo.set(especie, (conteo.get(especie) ?? 0) + 1);
      }
    }
    return [...conteo.entries()]
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  iniciales(medico: Medico): string {
    return `${medico.nombres?.charAt(0) ?? ''}${medico.apellidos?.charAt(0) ?? ''}`.toUpperCase();
  }

  // Con HashLocation los enlaces #seccion chocan con el router, por eso se hace scroll manual.
  irA(seccion: string, servicio?: string) {
    this.menuAbierto = false;
    if (servicio) {
      this.form.patchValue({ servicio });
    }
    document.getElementById(seccion)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  solicitarCita() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // TODO: conectar con el endpoint de citas cuando exista en el backend.
    const { nombre, mascota, fecha } = this.form.value;
    Swal.fire({
      icon: 'success',
      title: '¡Solicitud enviada!',
      text: `Gracias ${nombre}. Te contactaremos para confirmar la cita de ${mascota} el ${fecha}.`,
      confirmButtonColor: '#087e8b'
    });
    this.form.reset({ servicio: '' });
  }
}
