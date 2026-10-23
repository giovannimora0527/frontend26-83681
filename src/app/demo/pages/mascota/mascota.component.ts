import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TablaDatosComponent, ColumnaTabla } from 'src/app/components/tabla-datos/tabla-datos.component';
import { Mascota } from 'src/app/models/mascota';
import { Cliente } from 'src/app/models/cliente';
import { NotificacionService } from 'src/app/services/notificacion.service';
import { mensajeDeError } from 'src/app/utils/api-error.util';
import { MascotaService } from './service/mascota.service';
import { ClienteService } from '../cliente/service/cliente.service';
import { RazaService, Raza } from '../raza/service/raza.service';

/**
 * Módulo de gestión de mascotas (pacientes): listado con tabla reutilizable y formulario
 * de creación/edición en un modal con combos de raza y cliente.
 */
@Component({
  selector: 'app-mascota',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TablaDatosComponent],
  templateUrl: './mascota.component.html',
  styleUrl: './mascota.component.scss'
})
export class MascotaComponent implements OnInit {

  /** Mascotas mostradas en la tabla. */
  mascotas: Mascota[] = [];
  /** Clientes disponibles para el combo de dueño. */
  clientes: Cliente[] = [];
  /** Razas disponibles para el combo de raza. */
  razas: Raza[] = [];
  /** Indica si se está consultando el backend. */
  cargando = false;
  /** True cuando el modal edita una mascota existente. */
  editando = false;
  /** Mensaje de error mostrado dentro del modal. */
  mensajeError = '';
  /** Referencia al modal abierto. */
  private modalRef?: NgbModalRef;

  /** Formulario reactivo de la mascota. */
  form: FormGroup;

  /** Columnas de la tabla. */
  columnas: ColumnaTabla[] = [
    { id: 'id', etiqueta: 'ID', ruta: 'mascotaId', tipo: 'numero' },
    { id: 'nombre', etiqueta: 'Nombre', ruta: 'nombreMascota' },
    { id: 'edad', etiqueta: 'Edad', ruta: 'edad', tipo: 'numero' },
    { id: 'raza', etiqueta: 'Raza', ruta: 'raza.nombre', filtro: 'lista' },
    { id: 'dueno', etiqueta: 'Dueño', ruta: 'cliente.nombres', formateador: (m: Mascota) => `${m.cliente?.nombres ?? ''} ${m.cliente?.apellidos ?? ''}`.trim() }
  ];

  constructor(
    private mascotaService: MascotaService,
    private clienteService: ClienteService,
    private razaService: RazaService,
    private modalService: NgbModal,
    private notificacion: NotificacionService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      mascotaId: [null],
      nombreMascota: ['', [Validators.required, Validators.maxLength(100)]],
      edad: [null, [Validators.required, Validators.min(0), Validators.max(60)]],
      razaId: [null, Validators.required],
      clienteId: [null, Validators.required]
    });
  }

  /** Carga las mascotas y los catálogos al iniciar la página. */
  ngOnInit(): void {
    this.cargar();
    this.clienteService.listar().subscribe({ next: (c) => (this.clientes = c) });
    this.razaService.listar().subscribe({ next: (r) => (this.razas = r) });
  }

  /** Consulta las mascotas en el backend. */
  cargar(): void {
    this.cargando = true;
    this.mascotaService.listar().subscribe({
      next: (data) => { this.mascotas = data; this.cargando = false; },
      error: (err) => { this.cargando = false; this.notificacion.error(mensajeDeError(err)); }
    });
  }

  /**
   * Abre el modal para registrar una mascota.
   * @param plantilla plantilla del modal.
   */
  abrirNueva(plantilla: TemplateRef<unknown>): void {
    this.editando = false;
    this.mensajeError = '';
    this.form.reset();
    this.modalRef = this.modalService.open(plantilla, { backdrop: 'static' });
  }

  /**
   * Abre el modal para editar una mascota.
   * @param plantilla plantilla del modal.
   * @param mascota mascota a editar.
   */
  abrirEdicion(plantilla: TemplateRef<unknown>, mascota: Mascota): void {
    this.editando = true;
    this.mensajeError = '';
    this.form.patchValue({
      mascotaId: mascota.mascotaId,
      nombreMascota: mascota.nombreMascota,
      edad: mascota.edad,
      razaId: mascota.raza?.razaId,
      clienteId: mascota.cliente?.id
    });
    this.modalRef = this.modalService.open(plantilla, { backdrop: 'static' });
  }

  /** Valida el formulario y envía los datos al backend. */
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const accion = this.editando
      ? this.mascotaService.actualizar(this.form.value)
      : this.mascotaService.guardar(this.form.value);

    accion.subscribe({
      next: () => {
        this.modalRef?.close();
        this.notificacion.exito(this.editando ? 'Mascota actualizada correctamente.' : 'Mascota registrada correctamente.');
        this.cargar();
      },
      error: (err) => { this.mensajeError = mensajeDeError(err); }
    });
  }

  /**
   * Indica si un control del formulario es inválido y ya fue tocado.
   * @param control nombre del control.
   */
  invalido(control: string): boolean {
    const c = this.form.get(control);
    return !!c && c.invalid && (c.touched || c.dirty);
  }
}
