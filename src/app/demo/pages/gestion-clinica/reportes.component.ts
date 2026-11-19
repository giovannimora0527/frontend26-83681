import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Medico } from 'src/app/models/medico';
import { ClinicaApi, Filtros, hoyBogota, Opcion, perfilClinica, perfilesClinica } from './clinica-api.service';

/** Contiene el título, los encabezados y las filas de un reporte. */
interface Reporte { titulo: string; generado: string; columnas: string[]; filas: (string | number | null)[][] }

/** Consulta los reportes de gestión médica y financieros y descarga los resultados. */
@Component({
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html'
})
export class ReportesComponent implements OnInit {
  private readonly api = inject(ClinicaApi);
  readonly admin = perfilesClinica.admin.includes(perfilClinica());
  tipo = 'financieros';
  inicio = hoyBogota().slice(0, 8) + '01';
  fin = hoyBogota();
  periodo = 'mes';
  medicoId: number | null = null;
  especializacionId: number | null = null;
  medicos: Medico[] = [];
  especialidades: Opcion[] = [];
  resultado: Reporte | null = null;
  consulta: { ruta: string; filtros: Filtros } | null = null;
  cargando = false;
  error = '';
  private readonly fallo = this.api.error((mensaje) => this.error = mensaje);

  /** Detecta si los filtros cambiaron desde que se generó la vista previa. */
  get vistaDesactualizada(): boolean {
    if (!this.consulta) return false;
    const { ruta, filtros } = this.consulta;
    return ruta !== 'reportes/' + this.tipo ||
      filtros['inicio'] !== this.inicio || filtros['fin'] !== this.fin ||
      (filtros['medicoId'] ?? null) !== this.medicoId ||
      (filtros['especializacionId'] ?? null) !== this.especializacionId ||
      (this.tipo === 'financieros' && filtros['periodo'] !== this.periodo);
  }

  /** Prepara la pantalla al abrirse y carga los datos que necesita. */
  ngOnInit() {
    this.api.leer<Medico[]>('medico/listar').subscribe({
      next: (datos) => {
        this.medicos = datos;
        if (!this.admin) {
          const opciones = new Map<number, Opcion>();
          for (const { especializacion } of datos) {
            if (especializacion?.id && especializacion.nombre) {
              opciones.set(especializacion.id, { id: especializacion.id, nombre: especializacion.nombre });
            }
          }
          this.especialidades = Array.from(opciones.values());
        }
      }, error: this.fallo
    });
    if (this.admin) {
      this.api.leer<Opcion[]>('especializacion/listar').subscribe({ next: (datos) => this.especialidades = datos, error: this.fallo });
    }
  }

  /** Solicita la vista previa del reporte con los filtros del formulario. */
  consultar() {
    if (!this.inicio || !this.fin || this.inicio > this.fin || this.cargando) return;
    const ruta = 'reportes/' + this.tipo;
    const filtros: Filtros = { inicio: this.inicio, fin: this.fin };
    if (this.medicoId) filtros['medicoId'] = this.medicoId;
    if (this.especializacionId) filtros['especializacionId'] = this.especializacionId;
    if (this.tipo === 'financieros') filtros['periodo'] = this.periodo;
    this.error = '';
    this.resultado = null;
    this.consulta = null;
    this.cargando = true;
    this.api.leer<Reporte>(ruta, filtros).pipe(finalize(() => this.cargando = false)).subscribe({
      next: (resultado) => { this.resultado = resultado; this.consulta = { ruta, filtros }; },
      error: this.fallo
    });
  }

  /** Descarga el reporte visible con los filtros de la última consulta válida. */
  exportar(formato: 'pdf' | 'excel') {
    if (!this.consulta || this.vistaDesactualizada) return;
    const { ruta, filtros } = this.consulta;
    this.api.descargar(ruta + '/' + formato, ruta.replace('/', '-') + (formato === 'pdf' ? '.pdf' : '.xlsx'),
      (mensaje) => this.error = mensaje, filtros);
  }
}
