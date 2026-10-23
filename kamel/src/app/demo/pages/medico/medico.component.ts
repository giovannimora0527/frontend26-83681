
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from 'src/environments/environment';

interface EspecializacionItem {
  id: number;
  nombre: string;
}

interface MedicoItem {
  id?: number;
  tipoDocumento?: string;
  tipo_documento?: string;
  numeroDocumento?: string;
  numero_documento?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  registroProfesional?: string;
  registro_profesional?: string;
  especializacion?: { nombre?: string; nombreEspecializacion?: string };
}

@Component({
  selector: 'app-medico',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './medico.component.html',
  styleUrl: './medico.component.scss'
})
export class MedicoComponent implements OnInit {
  medicos: MedicoItem[] = [];
  medicosFiltrados: MedicoItem[] = [];

  filtro = '';
  cargando = false;
  mensajeError = '';
  pagina = 1;
  tamanoPagina = 8;
  especializaciones: EspecializacionItem[] = [];
  guardandoMedico = false;
  mensajeExito = '';
  nuevoMedico = {
    tipoDocumento: 'CC',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    registroProfesional: '',
    especializacionId: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.listarMedicos();
    this.cargarEspecializaciones();
  }

  cargarEspecializaciones(): void {
    this.http.get<EspecializacionItem[]>(`${environment.apiUrlAuth}/gestion/especializaciones`).subscribe({
      next: (datos) => this.especializaciones = datos || [],
      error: (error) => {
        this.mensajeError = error?.error?.message || 'No fue posible cargar las especializaciones.';
      }
    });
  }

  guardarMedico(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    if (!this.nuevoMedico.numeroDocumento.trim() || !this.nuevoMedico.nombres.trim() ||
        !this.nuevoMedico.apellidos.trim() || !this.nuevoMedico.registroProfesional.trim() ||
        !this.nuevoMedico.especializacionId) {
      this.mensajeError = 'Completa los datos obligatorios del veterinario.';
      return;
    }

    this.guardandoMedico = true;
    this.http.post(`${environment.apiUrlAuth}/gestion/medicos`, {
      ...this.nuevoMedico,
      numeroDocumento: this.nuevoMedico.numeroDocumento.trim(),
      nombres: this.nuevoMedico.nombres.trim(),
      apellidos: this.nuevoMedico.apellidos.trim(),
      registroProfesional: this.nuevoMedico.registroProfesional.trim(),
      especializacionId: Number(this.nuevoMedico.especializacionId)
    }).subscribe({
      next: () => {
        this.guardandoMedico = false;
        this.mensajeExito = 'Veterinario registrado correctamente.';
        this.nuevoMedico = {
          tipoDocumento: 'CC',
          numeroDocumento: '',
          nombres: '',
          apellidos: '',
          telefono: '',
          registroProfesional: '',
          especializacionId: ''
        };
        this.listarMedicos();
      },
      error: (error) => {
        this.guardandoMedico = false;
        this.mensajeError = error?.error?.message || 'No fue posible registrar el veterinario.';
      }
    });
  }

  listarMedicos(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.http.get<MedicoItem[]>(`${environment.apiUrlAuth}/gestion/medicos`).subscribe({
      next: (respuesta) => {
        this.medicos = respuesta || [];
        this.filtrarMedicos();
        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'No fue posible cargar los veterinarios. Verifica que el backend esté activo.';
        this.cargando = false;
      }
    });
  }

  filtrarMedicos(): void {
    const texto = this.filtro.trim().toLowerCase();

    this.medicosFiltrados = this.medicos.filter(m => {
      const especializacion =
        m.especializacion?.nombre ||
        m.especializacion?.nombreEspecializacion ||
        '';

      const contenido = [
        m.nombres,
        m.apellidos,
        m.numeroDocumento ?? m.numero_documento,
        m.registroProfesional ?? m.registro_profesional,
        especializacion
      ].join(' ').toLowerCase();

      return contenido.includes(texto);
    });

    this.pagina = 1;
  }

  get medicosPagina(): MedicoItem[] {
    const inicio = (this.pagina - 1) * this.tamanoPagina;
    return this.medicosFiltrados.slice(inicio, inicio + this.tamanoPagina);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.medicosFiltrados.length / this.tamanoPagina));
  }

  cambiarPagina(valor: number): void {
    if (valor >= 1 && valor <= this.totalPaginas) {
      this.pagina = valor;
    }
  }
}
