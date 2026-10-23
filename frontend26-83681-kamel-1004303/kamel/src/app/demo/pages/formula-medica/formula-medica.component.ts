import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormulaMedica } from 'src/app/models/formula-medica';
import { FormulaMedicaService } from './service/formula-medica.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-formula-medica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formula-medica.component.html',
  styleUrl: './formula-medica.component.scss'
})
export class FormulaMedicaComponent implements OnInit {

  formulas: FormulaMedica[] = [];
  citas: any[] = [];
  medicamentos: any[] = [];
  filtro = '';
  mostrarFormulario = false;
  guardando = false;
  cargando = false;
  mensajeExito = '';
  errorFormulario = '';
  errorMensaje = '';
  detalle: FormulaMedica | null = null;
  editando: number | null = null;
  columnaOrden = 'fechaCreacionRegistro';
  ordenAscendente = false;
  paginaActual = 1;
  readonly registrosPorPagina = 8;

  nuevaFormula: any = {
    citaId: '',
    medicamentoId: '',
    dosis: '',
    indicaciones: ''
  };

  constructor(
    private formulaService: FormulaMedicaService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarFormulas();

    this.http.get<any[]>(`${environment.apiUrlAuth}/gestion/citas`).subscribe({
      next: x => this.citas = x || [],
      error: () => this.errorFormulario = 'No fue posible cargar las citas disponibles.'
    });

    this.http.get<any[]>(`${environment.apiUrlAuth}/gestion/medicamentos`).subscribe({
      next: x => this.medicamentos = x || [],
      error: () => this.errorFormulario = 'No fue posible cargar los medicamentos.'
    });
  }

  cargarFormulas(): void {
    this.cargando = true;
    this.errorMensaje = '';

    this.formulaService.getFormulas().subscribe({
      next: x => {
        this.formulas = Array.isArray(x) ? x : [];
        this.cargando = false;
        this.paginaActual = 1;
      },
      error: e => {
        this.errorMensaje = e?.error?.message || 'No fue posible cargar las fórmulas médicas. Verifica el backend y la base de datos.';
        this.cargando = false;
      }
    });
  }

  alternarFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    this.errorFormulario = '';
    this.mensajeExito = '';

    if (!this.mostrarFormulario) {
      this.limpiar();
    }
  }

  limpiar(): void {
    this.editando = null;
    this.nuevaFormula = {
      citaId: '',
      medicamentoId: '',
      dosis: '',
      frecuencia: '',
      duracionTratamiento: '',
      indicaciones: ''
    };
  }

  editar(f: FormulaMedica): void {
    this.editando = f.id || null;
    this.nuevaFormula = {
      citaId: f.citaId ?? f.cita_id ?? '',
      medicamentoId: f.medicamentoId ?? f.medicamento_id ?? '',
      dosis: f.dosis || '',
      indicaciones: f.indicaciones || ''
    };
    this.mostrarFormulario = true;
    this.detalle = null;
    this.errorFormulario = '';
  }

  guardar(): void {
    this.errorFormulario = '';
    this.mensajeExito = '';

    const f = this.nuevaFormula;

    if (!f.citaId || !f.medicamentoId || !f.dosis.trim()) {
      this.errorFormulario = 'Cita, medicamento, y dosis son obligatorios.';
      return;
    }

    const body = {
      citaId: Number(f.citaId),
      medicamentoId: Number(f.medicamentoId),
      dosis: f.dosis.trim(),
      indicaciones: f.indicaciones.trim()
    };

    this.guardando = true;

    const req = this.editando
      ? this.http.put<FormulaMedica>(`${environment.apiUrlAuth}/formula-medica/${this.editando}`, body)
      : this.formulaService.crearFormula(body);

    req.subscribe({
      next: () => {
        this.guardando = false;
        this.mensajeExito = this.editando ? 'Fórmula actualizada correctamente.' : 'Fórmula médica creada correctamente.';
        this.mostrarFormulario = false;
        this.limpiar();
        this.cargarFormulas();
      },
      error: e => {
        this.guardando = false;
        this.errorFormulario =
          e?.error?.message ||
          e?.error?.detail ||
          (e.status === 0
            ? 'No fue posible conectar con el backend.'
            : 'No fue posible guardar la fórmula. Verifica que la cita y el medicamento existan y que la consulta esté atendida.');
      }
    });
  }

  ver(f: FormulaMedica): void {
    if (!f.id) {
      this.detalle = f;
      return;
    }

    this.http.get<FormulaMedica>(`${environment.apiUrlAuth}/formula-medica/${f.id}`).subscribe({
      next: x => this.detalle = x,
      error: e => this.errorMensaje = e?.error?.message || 'No fue posible consultar el detalle.'
    });
  }

  obtenerFecha(f: FormulaMedica): string {
    const d = f.fechaCreacionRegistro ?? f.fecha_creacion_registro;
    return d ? String(d) : '';
  }

  formatearFecha(f: FormulaMedica): string {
    const d = new Date(this.obtenerFecha(f));
    return this.obtenerFecha(f) && !Number.isNaN(d.getTime()) ? d.toLocaleString() : '—';
  }

  obtenerCita(f: FormulaMedica): number | string {
    return f.citaId ?? f.cita_id ?? '—';
  }

  obtenerMedicamento(f: FormulaMedica): number | string {
    return f.medicamentoId ?? f.medicamento_id ?? '—';
  }

  nombreMascota(f: FormulaMedica): string {
    const c = this.citas.find(x => x.id === this.obtenerCita(f));
    return c?.mascota?.nombreMascota || '—';
  }

  nombreMedicamento(f: FormulaMedica): string {
    const m = this.medicamentos.find(x => x.id === this.obtenerMedicamento(f));
    return m?.nombre || `Medicamento ${this.obtenerMedicamento(f)}`;
  }

  obtenerVeterinario(f: FormulaMedica): string {
    const c = this.citas.find(x => x.id === this.obtenerCita(f));
    return c?.medico ? `${c.medico.nombres} ${c.medico.apellidos}` : 'Según cita asociada';
  }

  get filtradas(): FormulaMedica[] {
    const q = this.filtro.trim().toLowerCase();

    return this.formulas
      .filter(f =>
        [
          f.id,
          this.obtenerCita(f),
          this.obtenerMedicamento(f),
          f.dosis,
          f.indicaciones,
          this.formatearFecha(f),
          this.nombreMascota(f),
          this.nombreMedicamento(f)
        ]
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
      .sort((a, b) => {
        const av = this.valorOrden(a, this.columnaOrden);
        const bv = this.valorOrden(b, this.columnaOrden);
        const n = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return this.ordenAscendente ? n : -n;
      });
  }

  private valorOrden(f: FormulaMedica, k: string): string | number {
    if (k === 'id') return f.id || 0;
    if (k === 'dosis') return f.dosis || '';
    if (k === 'medicamento') return this.nombreMedicamento(f);
    return this.obtenerFecha(f);
  }

  ordenarPor(k: string): void {
    if (this.columnaOrden === k) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.columnaOrden = k;
      this.ordenAscendente = k === 'id';
    }
    this.paginaActual = 1;
  }

  get paginaDatos(): FormulaMedica[] {
    return this.filtradas.slice(
      (this.paginaActual - 1) * this.registrosPorPagina,
      this.paginaActual * this.registrosPorPagina
    );
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.filtradas.length / this.registrosPorPagina));
  }

  get primerRegistro(): number {
    return this.filtradas.length ? (this.paginaActual - 1) * this.registrosPorPagina + 1 : 0;
  }

  get ultimoRegistro(): number {
    return Math.min(this.paginaActual * this.registrosPorPagina, this.filtradas.length);
  }

  cambiarPagina(p: number): void {
    this.paginaActual = Math.min(this.totalPaginas, Math.max(1, p));
  }
}