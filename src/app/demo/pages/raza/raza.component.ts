import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface RazaItem {
  razaId: number;
  nombre: string;
  especie: string;
}

@Component({
  selector: 'app-raza',
  imports: [CommonModule, FormsModule],
  templateUrl: './raza.component.html',
  styleUrl: './raza.component.scss'
})
export class RazaComponent {
  razas: RazaItem[] = [];
  nuevaRaza = { nombre: '', especie: '' };
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
    this.http.get<RazaItem[]>(`${environment.apiUrlAuth}/gestion/razas`).subscribe({
      next: (razas) => {
        this.razas = razas || [];
        this.cargando = false;
      },
      error: (error) => {
        this.error = error?.error?.message || 'No fue posible cargar las razas.';
        this.cargando = false;
      }
    });
  }

  guardar(): void {
    this.error = '';
    this.exito = '';
    if (!this.nuevaRaza.nombre.trim() || !this.nuevaRaza.especie.trim()) {
      this.error = 'El nombre y la especie son obligatorios.';
      return;
    }

    this.guardando = true;
    this.http.post(`${environment.apiUrlAuth}/gestion/razas`, {
      nombre: this.nuevaRaza.nombre.trim(),
      especie: this.nuevaRaza.especie.trim()
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.nuevaRaza = { nombre: '', especie: '' };
        this.exito = 'Raza registrada correctamente.';
        this.cargar();
      },
      error: (error) => {
        this.guardando = false;
        this.error = error?.error?.message || 'No fue posible registrar la raza.';
      }
    });
  }
}
