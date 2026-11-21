import { confirmarAccion } from 'src/app/utils/confirmar-accion';
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { finalize, forkJoin } from 'rxjs';
import { InventarioService } from '../inventario/service/inventario.service';
import { getJwtPayload } from 'src/app/utils/jwt.util';
import { MedicamentoInventario } from 'src/app/models/inventario.model';
import { AsignacionLote, Despacho, FormulaPendiente, LoteDisponible, MedicamentoFormulado } from 'src/app/models/inventario.model';
import { DespachoService } from './service/despacho.service';

/** Guarda la cantidad propuesta para un lote y el máximo que se puede entregar. */
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
  fechaGeneracion = '';
  historialEstados: Record<string, unknown>[] = [];
  productos: MedicamentoInventario[] = [];
  historialMedicamento: Record<string, unknown>[] = [];
  medicamentoHistorialId: number | null = null;
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

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private readonly despachoService: DespachoService, private readonly inventario: InventarioService) {}

  /** Consulta la cola de dispensación al mostrar el módulo. */
  ngOnInit(): void {
    this.actualizar();
    this.inventario.listarInventarioParaConsulta().subscribe({
      next: (productos) => this.productos = productos,
      error: (err: HttpErrorResponse) => this.error = this.mensajeError(err)
    });
  }

  /** Recarga la cola usando el filtro textual opcional del endpoint. */
  actualizar(mostrarConfirmacion = false): void {
    this.cargando = true;
    this.error = '';
    this.despachoService.listarPendientes(this.filtro.trim(), this.fechaGeneracion).subscribe({
      next: (data) => {
        this.pendientes = data ?? [];
        this.paginaPendientes = 1;
        this.cargando = false;
        if (mostrarConfirmacion) confirmarAccion('Cola de dispensación actualizada.', true);
      },
      error: (err: HttpErrorResponse) => { this.error = this.mensajeError(err); this.cargando = false; }
    });
    this.despachoService.listarDespachos().subscribe({
      next: (data) => { this.despachos = data ?? []; this.paginaDespachos = 1; },
      error: (err: HttpErrorResponse) => this.error = this.mensajeError(err)
    });
    this.consultarHistorialMedicamento(this.medicamentoHistorialId);
  }

  /** Filtra localmente la cola por fórmula, propietario, mascota o profesional. */
  get pendientesFiltrados(): FormulaPendiente[] {
    const term = this.normalizar(this.filtro);
    return this.pendientes.filter((item) => !term || [item.formulaId, item.numeroFormula, item.propietarioNombre, item.mascotaNombre].some((value) => this.normalizar(String(value ?? '')).includes(term)));
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
    if (!this.formula || this.guardando) return;
    this.guardando = true;
    this.despachoService.preparar(this.formula.formulaId).subscribe({
      next: (despacho) => { this.despacho = despacho; this.guardando = false; confirmarAccion('La preparación del despacho se inició correctamente.'); },
      error: (err: HttpErrorResponse) => { this.guardando = false; Swal.fire('No fue posible iniciar', this.mensajeError(err), 'error'); }
    });
  }

  /** Indica si las cantidades sumadas por medicamento respetan la prescripción y disponibilidad. */
  get puedeConfirmar(): boolean {
    if (!this.formula) return false;
    const lineasValidas = this.formula.medicamentos.every((med) => {
      const rows = this.asignaciones[med.formulaDetalleId] ?? [];
      const total = rows.reduce((sum, row) => sum + Number(row.cantidadEntregada || 0), 0);
      return total <= Math.min(med.cantidadPendiente, med.cantidadDisponible) &&
        rows.every((row) => Number.isInteger(row.cantidadEntregada) && row.cantidadEntregada >= 0 && row.cantidadEntregada <= row.maximo);
    });
    return lineasValidas && (this.sinExistencias || Object.values(this.asignaciones).flat().some((row) => row.cantidadEntregada > 0));
  }

  /** Indica si quedan unidades por entregar y ningún producto pendiente tiene stock dispensable. */
  get sinExistencias(): boolean {
    return !!this.formula?.medicamentos.some((med) => med.cantidadPendiente > 0) &&
      this.formula.medicamentos.every((med) => med.cantidadPendiente === 0 || med.cantidadDisponible === 0);
  }

  /** Confirma la entrega seleccionada; el backend descuenta existencias y genera trazabilidad. */
  confirmar(): void {
    if (!this.despacho || !this.puedeConfirmar || this.guardando) return;
    const detalles = Object.values(this.asignaciones).flat().filter((row) => row.cantidadEntregada > 0)
      .map(({ formulaDetalleId, loteId, cantidadEntregada }) => ({ formulaDetalleId, loteId, cantidadEntregada }));
    const despachoId = this.despacho.id;
    const registro = 'entrega-pendiente-' + getJwtPayload()?.sub + '-' + despachoId;
    const anterior = sessionStorage.getItem(registro);
    this.guardando = true;
    const titulo = anterior ? '¿Reintentar la confirmación anterior?' :
      this.sinExistencias ? '¿Registrar falta de existencias?' : '¿Confirmar entrega?';
    Swal.fire({ title: titulo, icon: 'warning', showCancelButton: true, confirmButtonText: 'Confirmar', cancelButtonText: 'Volver' }).then((result) => {
      if (!result.isConfirmed) { this.guardando = false; return; }
      if (anterior) {
        const reintento = JSON.parse(anterior) as { clave: string; detalles: AsignacionLote[] };
        this.enviarConfirmacion(despachoId, registro, reintento.clave, reintento.detalles);
        return;
      }
      const clave = globalThis.crypto?.randomUUID?.() ?? Date.now() + '-' + Math.random().toString(36).slice(2);
      sessionStorage.setItem(registro, JSON.stringify({ clave, detalles }));
      this.enviarConfirmacion(despachoId, registro, clave, detalles);
    });
  }

  /** Envía la entrega y conserva el intento si la respuesta del servidor es incierta. */
  private enviarConfirmacion(id: number, registro: string, clave: string, detalles: AsignacionLote[]): void {
    this.despachoService.confirmar(id, detalles, clave).pipe(finalize(() => this.guardando = false)).subscribe({
      next: (despacho) => {
        sessionStorage.removeItem(registro);
        this.cerrarPreparacion();
        this.actualizar();
        if (despacho.numeroComprobante && detalles.length) this.descargarComprobante(despacho, false);
        if (!detalles.length) Swal.fire('Pendiente por disponibilidad', 'El despacho quedó registrado sin salidas de inventario.', 'info');
        else confirmarAccion('La entrega se confirmó correctamente.');
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 400 || err.status === 422) sessionStorage.removeItem(registro);
        Swal.fire('No se pudo confirmar', this.mensajeError(err), 'error');
      }
    });
  }

  /** Distribuye automáticamente una línea en lotes elegibles siguiendo prioridad FEFO. */
  private asignarFefo(med: MedicamentoFormulado): AsignacionUi[] {
    let pendiente = Math.min(med.cantidadPendiente, med.cantidadDisponible);
    const lotes = [...med.lotes].filter((lote) => lote.seleccionable && !lote.vencido && lote.cantidadDisponible > 0)
      .sort((a, b) => (a.fechaVencimiento ?? '9999').localeCompare(b.fechaVencimiento ?? '9999') || a.loteId - b.loteId);
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
    this.detalle = [];
    this.historialEstados = [];
    forkJoin({ detalle: this.despachoService.detalle(item.id), estados: this.despachoService.historialEstados(item.id) }).subscribe({
      next: ({ detalle, estados }) => {
        if (this.despachoSeleccionado?.id !== item.id) return;
        this.detalle = detalle;
        this.historialEstados = estados;
      },
      error: (err: HttpErrorResponse) => Swal.fire('No fue posible consultar el detalle', this.mensajeError(err), 'error')
    });
  }

  /** Consulta las dispensaciones y movimientos vinculados al medicamento seleccionado. */
  consultarHistorialMedicamento(id: number | null): void {
    this.medicamentoHistorialId = id;
    this.historialMedicamento = [];
    if (id === null) return;
    this.despachoService.historialMedicamento(id).subscribe({
      next: (historial) => { if (this.medicamentoHistorialId === id) this.historialMedicamento = historial; },
      error: (err: HttpErrorResponse) => Swal.fire('No fue posible consultar las dispensaciones', this.mensajeError(err), 'error')
    });
  }

  /** Descarga el comprobante PDF de la entrega seleccionada. */
  descargarComprobante(item: Despacho, mostrarConfirmacion = true): void {
    this.despachoService.comprobante(item.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = item.numeroDespacho + '.pdf';
        enlace.click();
        setTimeout(() => URL.revokeObjectURL(url), 0);
        if (mostrarConfirmacion) confirmarAccion('Descarga del comprobante iniciada.', true);
      },
      error: (err: HttpErrorResponse) => Swal.fire('No fue posible descargar el comprobante', this.mensajeError(err), 'error')
    });
  }

  /** Solicita una justificación y ejecuta la cancelación o reversión del despacho. */
  cancelarDespacho(item: Despacho): void {
    Swal.fire({
      title: 'Cancelar despacho', input: 'textarea', inputLabel: 'Motivo de la cancelación',
      showCancelButton: true, confirmButtonText: 'Cancelar despacho', cancelButtonText: 'Volver',
      inputValidator: (valor) => valor.trim() ? undefined : 'Escribe una justificación.'
    }).then(({ isConfirmed, value }) => {
      if (!isConfirmed || this.guardando) return;
      this.guardando = true;
      this.despachoService.cancelar(item.id, String(value).trim()).pipe(finalize(() => this.guardando = false)).subscribe({
        next: () => { this.cerrarDetalle(); this.actualizar(); confirmarAccion('El despacho se canceló correctamente.'); },
        error: (err: HttpErrorResponse) => Swal.fire('No se pudo cancelar', this.mensajeError(err), 'error')
      });
    });
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
