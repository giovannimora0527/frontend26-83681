import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface EspecializacionItem {
  id: number;
  nombre: string;
  codigoEspecializacion: string;
  descripcion?: string;
}

@Component({
  selector: 'app-especializacion',
  imports: [CommonModule, FormsModule],
  templateUrl: './especializacion.component.html',
  styleUrl: './especializacion.component.scss'
})
export class EspecializacionComponent {
  especializaciones: EspecializacionItem[] = [];
  nueva = { nombre: '', codigoEspecializacion: '', descripcion: '' };
  error = '';
  exito = '';
  cargando = false;
  guardando = false;

  constructor(private http: HttpClient) {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.http.get<EspecializacionItem[]>(`${environment.apiUrlAuth}/gestion/especializaciones`).subscribe({
      next: (datos) => {
        this.especializaciones = datos || [];
        this.cargando = false;
      },
      error: (error) => {
        this.error = error?.error?.message || 'No fue posible cargar las especializaciones.';
        this.cargando = false;
      }
    });
  }

  guardar(): void {
    this.error = '';
    this.exito = '';
    if (!this.nueva.nombre.trim() || !this.nueva.codigoEspecializacion.trim()) {
      this.error = 'El nombre y el código son obligatorios.';
      return;
    }

    this.guardando = true;
    this.http.post(`${environment.apiUrlAuth}/gestion/especializaciones`, {
      nombre: this.nueva.nombre.trim(),
      codigoEspecializacion: this.nueva.codigoEspecializacion.trim(),
      descripcion: this.nueva.descripcion.trim()
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.nueva = { nombre: '', codigoEspecializacion: '', descripcion: '' };
        this.exito = 'Especialización registrada correctamente.';
        this.cargar();
      },
      error: (error) => {
        this.guardando = false;
        this.error = error?.error?.message || 'No fue posible registrar la especialización.';
      }
    });
  }
}
