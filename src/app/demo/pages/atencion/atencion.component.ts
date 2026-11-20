import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Cita } from 'src/app/models/cita';
import { Medicamento } from 'src/app/models/medicamento';
import { CitaService } from '../cita/service/cita.service';
import { MedicamentoService } from '../medicamento/service/medicamento.service';
import { AtencionRq, AtencionService, ContextoAtencion, FormulaAtencionRq } from './atencion.service';

interface FormulaDraft extends FormulaAtencionRq { disponible: number; }
@Component({ selector: 'app-atencion', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './atencion.component.html', styleUrl: './atencion.component.scss' })
export class AtencionComponent implements OnInit {
  citas: Cita[] = [];
  productos: Medicamento[] = [];
  contexto?: ContextoAtencion;
  citaId = '';
  cargando = false;
  guardando = false;
  error = '';
  atencionId?: number;
  motivo = ''; sintomas = ''; diagnostico = ''; observaciones = ''; recomendaciones = '';
  formulas: FormulaDraft[] = [];
  nuevaFormula: FormulaDraft = this.formulaVacia();
  constructor(private readonly api: AtencionService, private readonly citasApi: CitaService, private readonly medicamentosApi: MedicamentoService,
    private readonly route: ActivatedRoute, private readonly router: Router) {}
  ngOnInit(): void {
    const ahora = new Date(); const desde = new Date(ahora); desde.setDate(desde.getDate() - 30); const hasta = new Date(ahora); hasta.setDate(hasta.getDate() + 60);
    const inicio = this.fechaHora(desde); const fin = this.fechaHora(hasta);
    const rol = this.rol();
    this.cargando = true;
    const citas = rol === 'MEDICO' ? this.api.citas(inicio, fin) : this.citasApi.listarCitas();
    forkJoin({ citas, productos: this.medicamentosApi.listarMedicamentos() }).pipe(finalize(() => this.cargando = false)).subscribe({
      next: data => {
        this.citas = data.citas.filter(cita => !['CANCELADA', 'ATENDIDA'].includes((cita.estado ?? '').toUpperCase()));
        this.productos = data.productos.filter(producto => producto.activo !== false);
        const requested = this.route.snapshot.queryParamMap.get('citaId');
        if (requested && this.citas.some(cita => String(cita.id) === requested)) this.seleccionarCita(requested);
      },
      error: err => this.error = err?.error?.message ?? err?.error?.mensaje ?? 'No se pudieron cargar las citas y el catálogo de medicamentos.'
    });
  }
  seleccionarCita(id: string): void {
    this.citaId = id; this.contexto = undefined; this.atencionId = undefined; this.error = '';
    const cita = this.citas.find(item => String(item.id) === id);
    const mascotaId = cita?.mascota?.mascotaId;
    if (!mascotaId) { this.error = 'La cita no tiene una mascota asociada.'; return; }
    this.cargando = true;
    this.api.contexto(mascotaId).pipe(finalize(() => this.cargando = false)).subscribe({ next: data => this.contexto = data, error: err => this.error = err?.error?.message ?? err?.error?.mensaje ?? 'No fue posible cargar los antecedentes de la mascota.' });
  }
  actualizarDisponibilidad(): void {
    const medicamentoId = Number(this.nuevaFormula.medicamentoId);
    if (!medicamentoId) { this.nuevaFormula.disponible = 0; return; }
    this.medicamentosApi.lotes(medicamentoId).subscribe({ next: lotes => this.nuevaFormula.disponible = lotes.filter(lote => lote.fechaVencimiento >= new Date().toISOString().slice(0,10)).reduce((sum,lote) => sum + Number(lote.cantidadDisponible), 0), error: () => this.nuevaFormula.disponible = 0 });
  }
  agregarFormula(): void {
    const item = this.nuevaFormula;
    if (!item.medicamentoId || !item.dosis.trim() || item.cantidad <= 0 || item.cantidad > item.disponible) { this.error = 'Completa producto, dosis y cantidad dentro de la disponibilidad consultada.'; return; }
    this.formulas = [...this.formulas, { ...item, medicamentoId: Number(item.medicamentoId), cantidad: Number(item.cantidad) }];
    this.nuevaFormula = this.formulaVacia(); this.error = '';
  }
  retirarFormula(index: number): void { this.formulas = this.formulas.filter((_, i) => i !== index); }
  finalizar(): void {
    const cita = this.citas.find(item => String(item.id) === this.citaId);
    if (!cita?.id || !cita.medico?.id || !this.motivo.trim() || this.guardando) { this.error = 'Selecciona una cita y registra el motivo de consulta.'; return; }
    const request: AtencionRq = { citaId: cita.id, medicoId: cita.medico.id, motivo: this.motivo.trim(), sintomas: this.sintomas.trim(), diagnostico: this.diagnostico.trim(), observaciones: this.observaciones.trim(), recomendaciones: this.recomendaciones.trim(), formulas: this.formulas.map(({ disponible: _disponible, ...formula }) => formula) };
    this.guardando = true; this.error = '';
    this.api.finalizar(request).pipe(finalize(() => this.guardando = false)).subscribe({ next: response => { this.atencionId = response.id; this.contexto = undefined; }, error: err => this.error = err?.error?.message ?? err?.error?.mensaje ?? 'El backend rechazó la atención. Revisa que la cita siga disponible y el stock vigente.' });
  }
  descargarPdf(): void {
    if (!this.atencionId) return;
    this.api.pdf(this.atencionId).subscribe({ next: blob => { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `atencion-${this.atencionId}.pdf`; link.click(); URL.revokeObjectURL(url); }, error: err => this.error = err?.error?.message ?? 'No se pudo descargar el documento.' });
  }
  volverCitas(): void { void this.router.navigate(['/inicio/citas']); }
  pacienteNombre(cita: Cita): string { return cita.mascota?.nombreMascota ?? cita.mascota?.nombre ?? 'Mascota'; }
  nombreMedicamento(id: number): string { return this.productos.find(item => item.id === id)?.nombre ?? 'Producto'; }
  private formulaVacia(): FormulaDraft { return { medicamentoId: 0, cantidad: 1, dosis: '', frecuencia: '', duracion: '', viaAdministracion: '', indicaciones: '', disponible: 0 }; }
  private fechaHora(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}T${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}:00`; }
  private rol(): string { try { const token = sessionStorage.getItem('token'); return token ? String(JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).rol).toUpperCase() : ''; } catch { return ''; } }
}
