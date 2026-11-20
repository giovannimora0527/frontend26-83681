import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, from, of } from 'rxjs';
import { catchError, finalize, map, mergeMap, toArray } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { EntradaLoteRq, ImportacionPreview, ImportacionResultado, InventarioLote, InventarioMovimiento, Medicamento, ProductoRq } from 'src/app/models/medicamento';
import { MedicamentoService } from './service/medicamento.service';

type InventarioFila = Medicamento & { existencias: number; estadoStock: string; lotesVigentes: number; lotesVencidos: number; proximaVencimiento?: string };

@Component({
  selector: 'app-medicamento',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './medicamento.component.html',
  styleUrl: './medicamento.component.scss'
})
export class MedicamentoComponent implements OnInit {
  productos: InventarioFila[] = [];
  productosFiltrados: InventarioFila[] = [];
  lotes: InventarioLote[] = [];
  movimientos: InventarioMovimiento[] = [];
  productoActivo: InventarioFila | null = null;
  busqueda = '';
  filtro = 'TODOS';
  pagina = 1;
  readonly porPagina = 10;
  cargando = false;
  guardando = false;
  soloLectura = false;
  error = '';
  editorAbierto = false;
  entradaAbierta = false;
  importacionAbierta = false;
  importacion?: ImportacionPreview;
  resultadoImportacion?: ImportacionResultado;
  archivo?: File;
  mensajeImportacion = '';
  modoEdicion = false;

  readonly productoForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    tipoProducto: ['MEDICAMENTO', Validators.required],
    codigo: ['', [Validators.pattern(/^[A-Za-z0-9]{8}$/)]],
    registroInvima: [''],
    presentacion: [''],
    descripcion: [''],
    precioCompra: [0, [Validators.required, Validators.min(0)]],
    precioVenta: [0, [Validators.required, Validators.min(0)]],
    stockMinimo: [0, [Validators.required, Validators.min(0)]],
    fechaProximoPedido: [''],
    activo: [true]
  });

  readonly entradaForm = this.fb.group({
    numeroLote: ['', [Validators.required, Validators.maxLength(80)]],
    fechaIngreso: ['', Validators.required],
    fechaVencimiento: ['', Validators.required],
    cantidad: [1, [Validators.required, Validators.min(0.001)]],
    precioCompraUnitario: [0, [Validators.required, Validators.min(0)]],
    precioVentaUnitario: [0, [Validators.required, Validators.min(0)]],
    referenciaProveedor: ['']
  });

  constructor(private readonly service: MedicamentoService, private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.soloLectura = this.obtenerRol() === 'DESPACHO_MEDICO';
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.service.listarMedicamentos().pipe(finalize(() => this.cargando = false)).subscribe({
      next: productos => {
        from(productos).pipe(mergeMap(producto => this.service.lotes(producto.id).pipe(
          catchError(() => of([] as InventarioLote[])), map(rows => [producto.id, rows] as const)
        ), 8), toArray()).subscribe(resumen => {
          const lotesPorId = new Map(resumen);
          this.productos = productos.map(producto => {
            const hoy = this.hoy();
            const rows = lotesPorId.get(producto.id) ?? [];
            const existencias = rows.filter(lote => lote.fechaVencimiento >= hoy).reduce((total, lote) => total + Number(lote.cantidadDisponible || 0), 0);
            const lotesVencidos = rows.filter(lote => lote.fechaVencimiento < hoy && Number(lote.cantidadDisponible) > 0).length;
            const limite = new Date(`${hoy}T00:00:00`); limite.setDate(limite.getDate() + 90);
            const tope = `${limite.getFullYear()}-${String(limite.getMonth()+1).padStart(2,'0')}-${String(limite.getDate()).padStart(2,'0')}`;
            const lotesVigentes = rows.filter(lote => lote.fechaVencimiento >= hoy && lote.fechaVencimiento <= tope && Number(lote.cantidadDisponible) > 0).length;
            const proximaVencimiento = rows.filter(lote => lote.fechaVencimiento >= hoy && Number(lote.cantidadDisponible) > 0)
              .map(lote => lote.fechaVencimiento).sort()[0];
            return Object.assign(producto, { existencias, lotesVigentes, lotesVencidos, proximaVencimiento,
              estadoStock: this.estadoProducto(existencias, producto.stockMinimo ?? 0, lotesVencidos, lotesVigentes) });
          });
          this.aplicarFiltros();
        });
      },
      error: err => {
        this.error = this.mensajeError(err, 'No se pudo consultar el inventario.');
      }
    });
  }

  aplicarFiltros(): void {
    const q = this.normalizar(this.busqueda.trim());
    this.productosFiltrados = this.productos.filter(producto => {
      const coincideTexto = !q || [producto.codigo, producto.nombre, producto.tipoProducto, producto.presentacion, producto.registroInvima]
        .some(valor => this.normalizar(String(valor ?? '')).includes(q));
      const coincideEstado = this.filtro === 'TODOS' || producto.estadoStock === this.filtro ||
        (this.filtro === 'PROXIMO A VENCER' && producto.lotesVigentes > 0) || (this.filtro === 'VENCIDO' && producto.lotesVencidos > 0);
      return coincideTexto && coincideEstado;
    });
    this.pagina = 1;
  }

  get paginaProductos(): InventarioFila[] {
    return this.productosFiltrados.slice((this.pagina - 1) * this.porPagina, this.pagina * this.porPagina);
  }
  get paginas(): number[] { return Array.from({ length: Math.ceil(this.productosFiltrados.length / this.porPagina) }, (_, i) => i + 1); }
  get agotados(): number { return this.productos.filter(p => p.existencias <= 0).length; }
  get stockBajo(): number { return this.productos.filter(p => p.existencias > 0 && p.existencias <= Number(p.stockMinimo || 0)).length; }
  get proximosAVencer(): number { return this.productos.filter(p => p.lotesVigentes > 0).length; }
  get vencidos(): number { return this.productos.filter(p => p.lotesVencidos > 0).length; }

  nuevoProducto(): void {
    this.modoEdicion = false;
    this.productoActivo = null;
    this.productoForm.reset({ tipoProducto: 'MEDICAMENTO', precioCompra: 0, precioVenta: 0, stockMinimo: 0, activo: true });
    this.editorAbierto = true;
  }

  editar(producto: InventarioFila): void {
    this.modoEdicion = true;
    this.productoActivo = producto;
    this.productoForm.patchValue({
      nombre: producto.nombre, tipoProducto: producto.tipoProducto ?? 'MEDICAMENTO', codigo: producto.codigo ?? '',
      registroInvima: producto.registroInvima ?? '', presentacion: producto.presentacion ?? '', descripcion: producto.descripcion ?? '',
      precioCompra: producto.precioCompra ?? 0, precioVenta: producto.precioVenta ?? 0,
      stockMinimo: producto.stockMinimo ?? 0, fechaProximoPedido: producto.fechaProximoPedido ?? '', activo: producto.activo ?? true
    });
    this.editorAbierto = true;
  }

  guardarProducto(): void {
    this.productoForm.markAllAsTouched();
    if (this.productoForm.invalid || this.guardando) return;
    const value = this.productoForm.getRawValue();
    const medicamento = value.tipoProducto === 'MEDICAMENTO';
    if (medicamento && !value.registroInvima?.trim()) {
      this.productoForm.controls.registroInvima.setErrors({ requiredForMedicine: true });
      return;
    }
    if (medicamento && !/^[A-Za-z0-9]{8}$/.test(value.codigo ?? '')) {
      this.productoForm.controls.codigo.setErrors({ invalidMedicineCode: true });
      return;
    }
    const payload: ProductoRq = {
      nombre: value.nombre!.trim(), tipoProducto: value.tipoProducto!, codigo: value.codigo?.trim() || null,
      descripcion: value.descripcion?.trim() || null, presentacion: value.presentacion?.trim() || null,
      registroInvima: value.registroInvima?.trim() || null, precioCompra: Number(value.precioCompra),
      precioVenta: Number(value.precioVenta), stockMinimo: Number(value.stockMinimo),
      fechaProximoPedido: value.fechaProximoPedido || null, activo: !!value.activo
    };
    const request = this.modoEdicion && this.productoActivo
      ? this.service.actualizar(this.productoActivo.id, payload)
      : this.service.crear(payload);
    this.guardando = true;
    request.pipe(finalize(() => this.guardando = false)).subscribe({
      next: () => { this.editorAbierto = false; this.cargar(); void Swal.fire('Guardado', 'El producto se guardó en el inventario.', 'success'); },
      error: err => void Swal.fire('No se pudo guardar', this.mensajeError(err, 'El backend rechazó el producto.'), 'error')
    });
  }

  verInventario(producto: InventarioFila): void {
    this.productoActivo = producto;
    this.lotes = [];
    this.movimientos = [];
    forkJoin({ lotes: this.service.lotes(producto.id), movimientos: this.service.movimientos(producto.id) }).subscribe({
      next: data => { this.lotes = data.lotes; this.movimientos = data.movimientos; },
      error: err => void Swal.fire('Error', this.mensajeError(err, 'No se pudo consultar lotes y movimientos.'), 'error')
    });
  }

  abrirEntrada(producto: InventarioFila): void {
    this.productoActivo = producto;
    this.entradaForm.reset({ cantidad: 1, precioCompraUnitario: producto.precioCompra ?? 0, precioVentaUnitario: producto.precioVenta ?? 0 });
    this.entradaAbierta = true;
  }

  registrarEntrada(): void {
    this.entradaForm.markAllAsTouched();
    if (this.entradaForm.invalid || !this.productoActivo || this.guardando) return;
    const value = this.entradaForm.getRawValue();
    if (value.fechaVencimiento! < this.hoy()) {
      this.entradaForm.controls.fechaVencimiento.setErrors({ expired: true });
      return;
    }
    const payload: EntradaLoteRq = { medicamentoId: this.productoActivo.id, numeroLote: value.numeroLote!.trim(),
      fechaIngreso: value.fechaIngreso!, fechaVencimiento: value.fechaVencimiento!, cantidad: Number(value.cantidad),
      precioCompraUnitario: Number(value.precioCompraUnitario), precioVentaUnitario: Number(value.precioVentaUnitario),
      referenciaProveedor: value.referenciaProveedor?.trim() || null };
    this.guardando = true;
    this.service.registrarEntrada(payload).pipe(finalize(() => this.guardando = false)).subscribe({
      next: () => { this.entradaAbierta = false; this.cargar(); void Swal.fire('Entrada registrada', 'El lote quedó registrado en el inventario.', 'success'); },
      error: err => void Swal.fire('No se pudo registrar', this.mensajeError(err, 'El backend rechazó la entrada.'), 'error')
    });
  }

  elegirArchivo(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.archivo = undefined;
    this.importacion = undefined;
    this.resultadoImportacion = undefined;
    if (!file) return;
    if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
      this.mensajeImportacion = 'Selecciona un archivo CSV o Excel (.xlsx, .xls).';
      return;
    }
    this.archivo = file;
    this.mensajeImportacion = '';
  }

  prevalidarImportacion(): void {
    if (!this.archivo || this.guardando) return;
    this.guardando = true;
    this.service.prevalidar(this.archivo).pipe(finalize(() => this.guardando = false)).subscribe({
      next: response => { this.importacion = response; this.resultadoImportacion = undefined; },
      error: err => this.mensajeImportacion = this.mensajeError(err, 'El backend no pudo validar el archivo.')
    });
  }

  confirmarImportacion(): void {
    if (!this.importacion || this.importacion.validas === 0 || this.guardando) return;
    void Swal.fire({ title: 'Confirmar importación', text: `Se procesarán ${this.importacion.validas} filas válidas.`, icon: 'question', showCancelButton: true, confirmButtonText: 'Importar' })
      .then(result => {
        if (!result.isConfirmed || !this.importacion) return;
        this.guardando = true;
        this.service.confirmarImportacion(this.importacion.importacionId).pipe(finalize(() => this.guardando = false)).subscribe({
          next: response => { this.resultadoImportacion = response; this.cargar(); },
          error: err => this.mensajeImportacion = this.mensajeError(err, 'La importación no fue confirmada.')
        });
      });
  }

  seleccionarSeccion(seccion: string): void { this.filtro = seccion; this.aplicarFiltros(); }
  nombreTipo(tipo?: string): string { return tipo === 'MEDICAMENTO' ? 'Medicamento' : 'Producto / utensilio'; }
  hoy(): string { return new Date().toISOString().slice(0, 10); }
  private estadoProducto(stock: number, minimo: number, vencidos: number, proximos: number): string { return stock <= 0 ? (vencidos ? 'VENCIDO' : 'AGOTADO') : stock <= minimo ? 'STOCK BAJO' : proximos ? 'PROXIMO A VENCER' : 'DISPONIBLE'; }
  private normalizar(value: string): string { return value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  private obtenerRol(): string {
    try { const token = sessionStorage.getItem('token'); if (!token) return ''; const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); return String(payload.rol ?? '').toUpperCase(); }
    catch { return ''; }
  }
  private mensajeError(error: any, fallback: string): string { return error?.error?.mensaje ?? error?.error?.message ?? error?.message ?? fallback; }
}
