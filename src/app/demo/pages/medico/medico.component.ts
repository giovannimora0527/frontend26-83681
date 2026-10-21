
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicoService } from './service/medico.service';

@Component({
  selector: 'app-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medico.component.html',
  styleUrl: './medico.component.scss'
})
export class MedicoComponent implements OnInit {
  medicos: any[] = [];
  medicosFiltrados: any[] = [];

  filtro = '';
  cargando = false;
  mensajeError = '';
  pagina = 1;
  tamanoPagina = 8;

  constructor(private medicoService: MedicoService) {}

  ngOnInit(): void {
    this.listarMedicos();
  }

  listarMedicos(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.medicoService.getMedicos().subscribe({
      next: (respuesta: any[]) => {
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

  get medicosPagina(): any[] {
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
