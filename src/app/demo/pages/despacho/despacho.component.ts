import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AsignacionLote, Despacho, FormulaPendiente, LoteDisponible, MedicamentoFormulado } from 'src/app/models/inventario.model';
import { DespachoService } from './service/despacho.service';

type AsignacionUi = AsignacionLote & { numeroLote: string; maximo: number };

/** Módulo independiente de cola, preparación FEFO y confirmación de dispensaciones. */
@Component({
  selector: 'app-despacho',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './despacho.component.html',
  styleUrl: './despacho.component.scss'
})
export class DespachoComponent implements OnInit {
  /** Tamaño común de página para cola, historial y líneas de detalle. */
  readonly tamanoPagina = 8;
  pendientes: FormulaPendiente[] = [];
  /** Historial de despachos cargado desde el endpoint del módulo. */
  despachos: Despacho[] = [];
  /** Página actual del historial. */
  paginaDespachos = 1;
  /** Filtro local del historial. */
  filtroDespachos = '';
  paginaPendientes = 1;
  filtro = '';
  cargando = false;
  guardando = false;
  error = '';
  formula: FormulaPendiente | null = null;
  despacho: Despacho | null = null;
  asignaciones: Record<number, AsignacionUi[]> = {};
  detalle: Record<string, unknown>[] = [];
  paginaDetalle = 1;
  /** Despacho seleccionado para mostrar líneas de trazabilidad. */
  despachoSeleccionado: Despacho | null = null;

  constructor(private readonly despachoService: DespachoService) {}

  /** Consulta la cola de dispensación al mostrar el módulo. */
  ngOnInit(): void {
    this.actualizar();
    this.despachoService.listarDespachos().subscribe({ next: (data) => { this.despachos = data ?? []; }, error: () => { this.despachos = []; } });
  }

  /** Recarga la cola usando el filtro textual opcional del endpoint. */
  actualizar(): void {
    this.cargando = true;
    this.error = '';
    this.despachoService.listarPendientes(this.filtro.trim()).subscribe({
      next: (data) => { this.pendientes = data ?? []; this.paginaPendientes = 1; this.cargando = false; },
      error: (err: HttpErrorResponse) => { this.error = this.mensajeError(err); this.cargando = false; }
    });
  }

  /** Filtra localmente la cola por fórmula, propietario, mascota o profesional. */
  get pendientesFiltrados(): FormulaPendiente[] {
    const term = this.normalizar(this.filtro);
    return this.pendientes.filter((item) => !term || [item.numeroFormula, item.propietarioNombre, item.mascotaNombre, item.medicoNombre].some((value) => this.normalizar(String(value ?? '')).includes(term)));
  }

  /** Presenta solo las fórmulas de la página seleccionada. */
  get pagina(): FormulaPendiente[] { return this.paginar(this.pendientesFiltrados, this.paginaPendientes); }
  /** Filtra el historial por número, fórmula, comprobante o estado. */
  get despachosFiltrados(): Despacho[] {
    const term = this.normalizar(this.filtroDespachos);
    return this.despachos.filter((item) => !term || [item.numeroDespacho, item.numeroComprobante, item.formulaId, item.estado].some((value) => this.normalizar(String(value ?? '')).includes(term)));
  }
  /** Presenta solo el bloque de historial correspondiente a la página activa. */
  get despachosPagina(): Despacho[] { return this.paginar(this.despachosFiltrados, this.paginaDespachos); }
  /** Presenta solo las líneas de detalle de la página activa. */
  get detallePagina(): Record<string, unknown>[] { return this.paginar(this.detalle, this.paginaDetalle); }
  /** Calcula las páginas disponibles en cola o detalle. */
  paginas(total: number): number[] { return Array.from({ length: Math.max(1, Math.ceil(total / this.tamanoPagina)) }, (_, index) => index + 1); }

  /** Consulta disponibilidad y asigna lotes vigentes en orden recomendado FEFO. */
  prepararFormula(item: FormulaPendiente): void {
    this.despachoService.consultarPreparacion(item.formulaId).subscribe({
      next: (formula) => {
        this.formula = formula;
        this.despacho = null;
        this.asignaciones = {};
        formula.medicamentos?.forEach((med) => { this.asignaciones[med.formulaDetalleId] = this.asignarFefo(med); });
      },
      error: (err: HttpErrorResponse) => Swal.fire('No fue posible preparar', this.mensajeError(err), 'error')
    });
  }

  /** Inicia el despacho una vez que las cantidades asignadas cumplen lo pendiente. */
  iniciarPreparacion(): void {
    if (!this.formula || !this.puedeConfirmar) return;
    this.guardando = true;
    this.despachoService.preparar(this.formula.formulaId).subscribe({
      next: (despacho) => { this.despacho = despacho; this.guardando = false; },
      error: (err: HttpErrorResponse) => { this.guardando = false; Swal.fire('No fue posible iniciar', this.mensajeError(err), 'error'); }
    });
  }

  /** Indica si las cantidades sumadas por medicamento respetan la prescripción y disponibilidad. */
  get puedeConfirmar(): boolean {
    if (!this.formula) return false;
    const lineasValidas = this.formula.medicamentos.every((med) => {
      const rows = this.asignaciones[med.formulaDetalleId] ?? [];
      const total = rows.reduce((sum, row) => sum + Number(row.cantidadEntregada || 0), 0);
      return total <= med.cantidadPendiente && rows.every((row) => row.cantidadEntregada >= 0 && row.cantidadEntregada <= row.maximo);
    });
    return lineasValidas && Object.values(this.asignaciones).flat().some((row) => row.cantidadEntregada > 0);
  }

  /** Confirma la entrega seleccionada; el backend descuenta existencias y genera trazabilidad. */
  confirmar(): void {
    if (!this.despacho || !this.puedeConfirmar || this.guardando) return;
    const detalles = Object.values(this.asignaciones).flat().filter((row) => row.cantidadEntregada > 0)
      .map(({ formulaDetalleId, loteId, cantidadEntregada }) => ({ formulaDetalleId, loteId, cantidadEntregada }));
    Swal.fire({ title: '¿Confirmar entrega?', text: 'La confirmación registra la salida de cada lote.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Confirmar', cancelButtonText: 'Volver' }).then((result) => {
      if (!result.isConfirmed || !this.despacho) return;
      this.guardando = true;
      this.despachoService.confirmar(this.despacho.id, detalles).subscribe({
        next: () => { this.guardando = false; this.formula = null; this.despacho = null; this.actualizar(); Swal.fire('Despacho confirmado', 'La salida quedó registrada.', 'success'); },
        error: (err: HttpErrorResponse) => { this.guardando = false; Swal.fire('No se pudo confirmar', this.mensajeError(err), 'error'); }
      });
    });
  }

  /** Distribuye automáticamente una línea en lotes elegibles siguiendo prioridad FEFO. */
  private asignarFefo(med: MedicamentoFormulado): AsignacionUi[] {
    let pendiente = med.cantidadPendiente;
    const lotes = [...med.lotes].filter((lote) => lote.seleccionable && !lote.vencido && lote.cantidadDisponible > 0)
      .sort((a, b) => Number(b.recomendadoFefo) - Number(a.recomendadoFefo) || a.fechaVencimiento.localeCompare(b.fechaVencimiento));
    const salida: AsignacionUi[] = [];
    for (const lote of lotes) {
      if (pendiente <= 0) break;
      const cantidad = Math.min(pendiente, lote.cantidadDisponible);
      salida.push({ formulaDetalleId: med.formulaDetalleId, loteId: lote.loteId, cantidadEntregada: cantidad, numeroLote: lote.numeroLote, maximo: lote.cantidadDisponible });
      pendiente -= cantidad;
    }
    return salida;
  }

  /** Devuelve lotes no vencidos que el servidor marcó como seleccionables. */
  lotesElegibles(med: MedicamentoFormulado): LoteDisponible[] { return med.lotes.filter((lote) => lote.seleccionable && !lote.vencido && lote.cantidadDisponible > 0); }
  /** Suma unidades asignadas a una línea para mostrarlas al usuario. */
  totalAsignado(med: MedicamentoFormulado): number { return (this.asignaciones[med.formulaDetalleId] ?? []).reduce((sum, item) => sum + Number(item.cantidadEntregada || 0), 0); }
  /** Añade un lote elegible adicional para una línea que ocupa varias existencias. */
  agregarLote(med: MedicamentoFormulado): void {
    const actual = this.asignaciones[med.formulaDetalleId] ?? [];
    const usado = new Set(actual.map((item) => item.loteId));
    const lote = this.lotesElegibles(med).find((item) => !usado.has(item.loteId));
    if (lote) this.asignaciones[med.formulaDetalleId] = [...actual, { formulaDetalleId: med.formulaDetalleId, loteId: lote.loteId, cantidadEntregada: 0, numeroLote: lote.numeroLote, maximo: lote.cantidadDisponible }];
  }
  /** Cambia un lote asignado y conserva su límite de disponibilidad. */
  cambiarLote(med: MedicamentoFormulado, row: AsignacionUi, loteId: number): void {
    const lote = med.lotes.find((item) => item.loteId === Number(loteId));
    if (!lote || this.asignaciones[med.formulaDetalleId].some((item) => item !== row && item.loteId === lote.loteId)) return;
    Object.assign(row, { loteId: lote.loteId, numeroLote: lote.numeroLote, maximo: lote.cantidadDisponible, cantidadEntregada: Math.min(row.cantidadEntregada, lote.cantidadDisponible) });
  }
  /** Quita una asignación de lote de su línea. */
  quitarLote(med: MedicamentoFormulado, row: AsignacionUi): void { this.asignaciones[med.formulaDetalleId] = this.asignaciones[med.formulaDetalleId].filter((item) => item !== row); }
  /** Cierra la preparación local sin confirmar ninguna salida. */
  cerrarPreparacion(): void { this.formula = null; this.despacho = null; }

  /** Carga el detalle trazable de un despacho seleccionado del historial. */
  verDetalle(item: Despacho): void {
    this.despachoSeleccionado = item;
    this.paginaDetalle = 1;
    this.despachoService.detalle(item.id).subscribe({ next: (data) => { this.detalle = data ?? []; }, error: (err: HttpErrorResponse) => Swal.fire('No fue posible consultar el detalle', this.mensajeError(err), 'error') });
  }

  /** Cierra el detalle y libera la selección. */
  cerrarDetalle(): void { this.despachoSeleccionado = null; this.detalle = []; }

  /** Recorta los resultados de cola o detalle a ocho registros por página. */
  private paginar<T>(lista: T[], pagina: number): T[] { return lista.slice((pagina - 1) * this.tamanoPagina, pagina * this.tamanoPagina); }
  /** Normaliza texto para búsquedas tolerantes a acentos y mayúsculas. */
  private normalizar(value: string): string { return value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  /** Expone el error del API o un mensaje útil de respaldo. */
  private mensajeError(err: HttpErrorResponse): string { return err.error?.message || err.error?.mensaje || 'Verifica la disponibilidad e inténtalo de nuevo.'; }
}
