import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { esMedico } from 'src/app/utils/rol.util';

/** Módulo 3 – Atención médica: motivo, diagnóstico, servicios, fórmula médica y cierre (prefactura). */
@Component({
  selector: 'app-atencion',
  imports: [CommonModule, FormsModule],
  template: `
<div class="container-fluid">

<!-- LISTADO -->
<div class="card" *ngIf="!a">
  <div class="card-header">
    <div class="row g-2">
      <div class="col-md-5"><input class="form-control" placeholder="Buscar por mascota o propietario" [(ngModel)]="q" (keyup.enter)="listar()" /></div>
      <div class="col-md-3"><select class="form-select" [(ngModel)]="estado" (change)="listar()"><option value="">Todas</option><option value="EN_CURSO">En curso</option><option value="FINALIZADA">Finalizadas</option></select></div>
      <div class="col-md-4 text-end"><button class="btn btn-outline-secondary" (click)="listar()"><i class="fa fa-search"></i> Buscar</button></div>
    </div>
    <small class="text-muted" *ngIf="medico">Para iniciar una atención abra la cita desde «Mi calendario» y pulse «Iniciar atención».</small>
  </div>
  <div class="card-body table-responsive">
    <table class="table table-sm table-hover">
      <thead><tr><th>#</th><th>Fecha</th><th>Mascota</th><th>Propietario</th><th>Veterinario</th><th>Diagnóstico</th><th>Estado</th><th></th></tr></thead>
      <tbody>
        <tr *ngIf="lista.length === 0"><td colspan="8" class="text-center text-muted">Sin atenciones</td></tr>
        <tr *ngFor="let x of lista">
          <td>{{ x.id }}</td><td>{{ x.fechaInicio | date:'yyyy-MM-dd HH:mm' }}</td><td>{{ x.nombreMascota }}</td><td>{{ x.propietario }}</td><td>{{ x.medicoNombre }}</td>
          <td>{{ x.diagnostico }}</td>
          <td><span class="badge" [ngClass]="x.estado === 'EN_CURSO' ? 'bg-primary' : 'bg-success'">{{ x.estado === 'EN_CURSO' ? 'En curso' : 'Finalizada' }}</span></td>
          <td><button class="btn btn-sm btn-outline-primary" (click)="abrir(x.id)">{{ x.estado === 'EN_CURSO' && medico ? 'Continuar' : 'Ver' }}</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<!-- DETALLE -->
<ng-container *ngIf="a">
  <div class="mb-2"><button class="btn btn-link p-0" (click)="volver()"><i class="fa fa-arrow-left"></i> Volver al listado</button></div>
  <div class="card">
    <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
      <div>
        <h5 class="mb-0">Atención #{{ a.id }} — {{ a.nombreMascota }} <small class="text-muted">({{ a.especie }} · {{ a.raza }})</small>
          <span class="badge ms-2" [ngClass]="a.estado === 'EN_CURSO' ? 'bg-primary' : 'bg-success'">{{ a.estado === 'EN_CURSO' ? 'En curso' : 'Finalizada' }}</span></h5>
        <small class="text-muted">Propietario: {{ a.propietario }} · Tel. {{ a.propietarioTelefono }} · Veterinario: {{ a.medicoNombre }} ({{ a.especialidad }}) · Cita: {{ a.citaInicio | date:'yyyy-MM-dd HH:mm' }}</small>
      </div>
      <div>
        <button class="btn btn-outline-secondary btn-sm me-1" (click)="pdf('prefactura')"><i class="fa fa-file-pdf"></i> Prefactura</button>
        <button class="btn btn-outline-secondary btn-sm" *ngIf="a.formula" (click)="pdf('formula')"><i class="fa fa-file-pdf"></i> Fórmula</button>
      </div>
    </div>
    <div class="card-body">
      <div class="row g-3">
        <div class="col-12"><label class="form-label">Motivo de consulta *</label><textarea class="form-control" rows="2" [(ngModel)]="a.motivoConsulta" [disabled]="!editable"></textarea></div>
        <div class="col-md-6"><label class="form-label">Síntomas</label><textarea class="form-control" rows="3" [(ngModel)]="a.sintomas" [disabled]="!editable"></textarea></div>
        <div class="col-md-6"><label class="form-label">Diagnóstico *</label><textarea class="form-control" rows="3" [(ngModel)]="a.diagnostico" [disabled]="!editable"></textarea></div>
        <div class="col-md-6"><label class="form-label">Observaciones</label><textarea class="form-control" rows="2" [(ngModel)]="a.observaciones" [disabled]="!editable"></textarea></div>
        <div class="col-md-6"><label class="form-label">Recomendaciones</label><textarea class="form-control" rows="2" [(ngModel)]="a.recomendaciones" [disabled]="!editable"></textarea></div>
      </div>
      <div class="text-end mt-2" *ngIf="editable"><button class="btn btn-primary" (click)="guardar()"><i class="fa fa-floppy-disk"></i> Guardar</button></div>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><h6 class="mb-0">Servicios y procedimientos (valores históricos de la tarifa)</h6></div>
    <div class="card-body">
      <div class="row g-2 mb-2" *ngIf="editable">
        <div class="col-md-6"><select class="form-select" [(ngModel)]="nuevoServicio.tarifaId"><option [ngValue]="null">Agregar servicio…</option><option *ngFor="let t of tarifas" [ngValue]="t.id">{{ t.nombre }} — {{ t.valor | currency:'COP':'symbol-narrow':'1.0-0' }} (IVA {{ t.ivaPorcentaje }}%)</option></select></div>
        <div class="col-md-2"><input type="number" min="1" class="form-control" [(ngModel)]="nuevoServicio.cantidad" /></div>
        <div class="col-md-2"><button class="btn btn-outline-primary" [disabled]="!nuevoServicio.tarifaId" (click)="agregarServicio()">Agregar</button></div>
      </div>
      <table class="table table-sm">
        <thead><tr><th>Servicio</th><th class="text-end">Cant.</th><th class="text-end">Valor</th><th class="text-end">IVA</th><th class="text-end">Total</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let s of a.servicios"><td>{{ s.descripcion }}</td><td class="text-end">{{ s.cantidad }}</td><td class="text-end">{{ s.valorUnitario | currency:'COP':'symbol-narrow':'1.0-0' }}</td><td class="text-end">{{ s.valorIva | currency:'COP':'symbol-narrow':'1.0-0' }}</td><td class="text-end">{{ s.total | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
            <td><button class="btn btn-sm btn-outline-danger" *ngIf="editable" (click)="quitarServicio(s)"><i class="fa fa-trash"></i></button></td></tr>
        </tbody>
        <tfoot><tr class="fw-bold"><td colspan="4" class="text-end">Total servicios</td><td class="text-end">{{ a.totales?.total | currency:'COP':'symbol-narrow':'1.0-0' }}</td><td></td></tr></tfoot>
      </table>
      <small class="text-muted">Los medicamentos se facturan solo cuando son dispensados en el despacho.</small>
    </div>
  </div>

  <div class="card">
    <div class="card-header d-flex justify-content-between">
      <h6 class="mb-0">Fórmula médica
        <span class="badge bg-info text-dark ms-2" *ngIf="a.formula">{{ a.formula.estado === 'BORRADOR' ? 'Borrador' : a.formula.estadoDespachoNombre }}</span></h6>
      <small class="text-muted">La fórmula no descuenta inventario; solo el despacho lo hace.</small>
    </div>
    <div class="card-body table-responsive">
      <table class="table table-sm align-middle">
        <thead><tr><th style="min-width:200px">Medicamento</th><th>Dosis</th><th>Frecuencia</th><th style="width:90px">Días</th><th style="width:90px">Cant.</th><th>Vía</th><th>Indicaciones</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let i of items; let n = index">
            <td><select class="form-select form-select-sm" [(ngModel)]="i.medicamentoId" [disabled]="!formulaEditable"><option [ngValue]="null">Seleccione…</option><option *ngFor="let m of medicamentos" [ngValue]="m.id">{{ m.nombre }} ({{ m.stockActual }} en stock)</option></select></td>
            <td><input class="form-control form-control-sm" [(ngModel)]="i.dosis" [disabled]="!formulaEditable" /></td>
            <td><input class="form-control form-control-sm" [(ngModel)]="i.frecuencia" [disabled]="!formulaEditable" placeholder="c/8 h" /></td>
            <td><input type="number" min="1" class="form-control form-control-sm" [(ngModel)]="i.duracionDias" [disabled]="!formulaEditable" /></td>
            <td><input type="number" min="1" class="form-control form-control-sm" [(ngModel)]="i.cantidadPrescrita" [disabled]="!formulaEditable" /></td>
            <td><input class="form-control form-control-sm" [(ngModel)]="i.viaAdministracion" [disabled]="!formulaEditable" placeholder="oral" /></td>
            <td><input class="form-control form-control-sm" [(ngModel)]="i.indicaciones" [disabled]="!formulaEditable" /></td>
            <td><button class="btn btn-sm btn-outline-danger" *ngIf="formulaEditable" (click)="items.splice(n, 1)"><i class="fa fa-trash"></i></button></td>
          </tr>
          <tr *ngIf="items.length === 0"><td colspan="8" class="text-muted text-center">Sin medicamentos formulados</td></tr>
        </tbody>
      </table>
      <div *ngIf="formulaEditable">
        <input class="form-control form-control-sm mb-2" placeholder="Observaciones de la fórmula (opcional)" [(ngModel)]="obsFormula" />
        <button class="btn btn-outline-primary btn-sm me-2" (click)="items.push({medicamentoId: null, dosis: '', cantidadPrescrita: 1})"><i class="fa fa-plus"></i> Agregar medicamento</button>
        <button class="btn btn-primary btn-sm" (click)="guardarFormula()"><i class="fa fa-floppy-disk"></i> Guardar fórmula</button>
      </div>
    </div>
  </div>

  <div class="card" *ngIf="a.antecedentes">
    <div class="card-header"><h6 class="mb-0">Antecedentes de {{ a.nombreMascota }}</h6></div>
    <div class="card-body">
      <div class="row">
        <div class="col-md-6"><strong>Atenciones previas</strong>
          <div *ngIf="a.antecedentes.atenciones.length === 0" class="text-muted small">Sin atenciones previas</div>
          <div class="border-bottom py-1 small" *ngFor="let p of a.antecedentes.atenciones"><strong>{{ p.fechaInicio | date:'yyyy-MM-dd' }}</strong> · {{ p.medico }}<br />Motivo: {{ p.motivoConsulta }}<br />Dx: {{ p.diagnostico }}</div>
        </div>
        <div class="col-md-6"><strong>Medicamentos formulados anteriormente</strong>
          <div *ngIf="a.antecedentes.formulas.length === 0" class="text-muted small">Sin fórmulas previas</div>
          <div class="border-bottom py-1 small" *ngFor="let f of a.antecedentes.formulas">{{ f.fecha | date:'yyyy-MM-dd' }} · {{ f.medicamento }} — {{ f.dosis }} {{ f.frecuencia }}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="text-end mb-4" *ngIf="editable">
    <button class="btn btn-success btn-lg" (click)="finalizar()"><i class="fa fa-flag-checkered"></i> Finalizar atención y generar prefactura</button>
  </div>
</ng-container>
</div>
`,
})
export class AtencionComponent implements OnInit {
  medico = esMedico();
  lista: any[] = [];
  q = '';
  estado = '';
  a: any = null;
  tarifas: any[] = [];
  medicamentos: any[] = [];
  items: any[] = [];
  obsFormula = '';
  nuevoServicio: any = { tarifaId: null, cantidad: 1 };

  constructor(private readonly api: ApiService, private readonly route: ActivatedRoute, private readonly router: Router) {}

  get editable(): boolean {
    return this.medico && this.a?.estado === 'EN_CURSO';
  }

  get formulaEditable(): boolean {
    return this.editable && (!this.a.formula || this.a.formula.estadoDespacho === 'PENDIENTE_DESPACHO');
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((p) => {
      const id = p.get('id');
      if (id) this.abrir(+id, false);
      else {
        this.a = null;
        this.listar();
      }
    });
  }

  listar(): void {
    this.api.get<any[]>('/atencion', { estado: this.estado, q: this.q }).subscribe({ next: (l) => (this.lista = l), error: (e) => this.api.error(e) });
  }

  abrir(id: number, navegar = true): void {
    if (navegar) {
      this.router.navigate(['/inicio/atencion', id]);
      return;
    }
    this.cargar(id);
    this.api.get<any[]>('/catalogo/tarifas', { activo: true }).subscribe({ next: (t) => (this.tarifas = t), error: () => undefined });
    this.api.get<any[]>('/inventario/medicamentos', { soloActivos: true }).subscribe({ next: (m) => (this.medicamentos = m), error: () => undefined });
  }

  volver(): void {
    this.router.navigate(['/inicio/atencion']);
  }

  private cargar(id: number): void {
    this.api.get<any>(`/atencion/${id}`).subscribe({ next: (d) => this.asignar(d), error: (e) => this.api.error(e) });
  }

  private asignar(d: any): void {
    this.a = d;
    this.items = (d.formula?.items ?? []).map((i: any) => ({ medicamentoId: i.medicamentoId, dosis: i.dosis, frecuencia: i.frecuencia, duracionDias: i.duracionDias, cantidadPrescrita: i.cantidadPrescrita, viaAdministracion: i.viaAdministracion, indicaciones: i.indicaciones }));
    this.obsFormula = d.formula?.observaciones ?? '';
  }

  guardar(after?: () => void): void {
    const b = { motivoConsulta: this.a.motivoConsulta, sintomas: this.a.sintomas, diagnostico: this.a.diagnostico, observaciones: this.a.observaciones, recomendaciones: this.a.recomendaciones };
    this.api.put<any>(`/atencion/${this.a.id}`, b).subscribe({
      next: (d) => {
        this.asignar(d);
        if (after) after();
        else this.api.ok('Atención guardada');
      },
      error: (e) => this.api.error(e),
    });
  }

  agregarServicio(): void {
    this.api.post<any>(`/atencion/${this.a.id}/servicios`, this.nuevoServicio).subscribe({
      next: (d) => {
        this.a = { ...this.a, servicios: d.servicios, totales: d.totales };
        this.nuevoServicio = { tarifaId: null, cantidad: 1 };
      },
      error: (e) => this.api.error(e),
    });
  }

  quitarServicio(s: any): void {
    this.api.delete<any>(`/atencion/${this.a.id}/servicios/${s.id}`).subscribe({
      next: (d) => (this.a = { ...this.a, servicios: d.servicios, totales: d.totales }),
      error: (e) => this.api.error(e),
    });
  }

  guardarFormula(): void {
    this.api.put<any>(`/formulas/atencion/${this.a.id}`, { observaciones: this.obsFormula, items: this.items }).subscribe({
      next: (d) => {
        this.a = { ...this.a, formula: d.formula };
        this.asignar(this.a);
        this.api.ok('Fórmula guardada');
      },
      error: (e) => this.api.error(e),
    });
  }

  async finalizar(): Promise<void> {
    if (!(await this.api.confirmar('Finalizar atención', 'Se registrará en la historia clínica, la fórmula quedará pendiente de despacho y la cita pasará a «Atendida».', 'Finalizar'))) return;
    this.guardar(() => {
      this.api.post<any>(`/atencion/${this.a.id}/finalizar`).subscribe({
        next: (d) => {
          this.asignar(d);
          this.api.ok('Atención finalizada');
          this.pdf('prefactura');
        },
        error: (e) => this.api.error(e),
      });
    });
  }

  pdf(tipo: 'prefactura' | 'formula'): void {
    const ruta = tipo === 'prefactura' ? `/atencion/${this.a.id}/prefactura/pdf` : `/formulas/atencion/${this.a.id}/pdf`;
    this.api.descargar(ruta, `${tipo}-${this.a.id}.pdf`, undefined, true);
  }
}
