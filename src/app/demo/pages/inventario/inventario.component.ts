import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { InventarioLote, MedicamentoInventario, MovimientoInventario } from 'src/app/models/inventario.model';
import { InventarioService } from './service/inventario.service';
import { getJwtPayload } from 'src/app/utils/jwt.util';

/** Módulo de catálogo de inventario, lotes, movimientos, importación e informes. */
@Component({
  selector: 'app-inventario',
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss'
})
export class InventarioComponent implements OnInit {
  /** Página máxima de ocho registros para todos los listados de este módulo. */
  readonly tamanoPagina = 8;
  /** Perfil autenticado: el servidor sigue siendo la autoridad final de permisos. */
  readonly rol = this.normalizarRol(getJwtPayload()?.rol ?? '');
  readonly esAdmin = ['ADMIN', 'ADMINISTRADOR'].includes(this.rol);
  readonly puedeConsultar = this.esAdmin || this.rol === 'DESPACHO_MEDICO';
  productos: MedicamentoInventario[] = [];
  lotes: InventarioLote[] = [];
  movimientos: MovimientoInventario[] = [];
  busqueda = '';
  seccion: 'productos' | 'lotes' | 'movimientos' | 'carga' | 'informe' = 'productos';
  paginaProductos = 1;
  paginaLotes = 1;
  paginaMovimientos = 1;
  cargando = false;
  error = '';
  modalAbierto: 'producto' | 'lote' | null = null;
  productoSeleccionado: MedicamentoInventario | null = null;
  loteSeleccionado: InventarioLote | null = null;
  detalleProducto: MedicamentoInventario | null = null;
  guardando = false;
  formulario = this.formularioInicial();
  formularioLote = { medicamentoId: 0, numeroLote: '', cantidad: 1, precioCompraLote: 0, fechaVencimiento: '' };
  archivo: File | null = null;
  previsualizacion: Record<string, unknown> | null = null;
  cargaId: number | null = null;
  tipoInforme = 'TODOS';
  fechaDesde = '';
  fechaHasta = '';
  filtroEstado = 'TODOS';

  constructor(private readonly inventario: InventarioService) {}

  /** Carga los datos básicos cuando se abre la vista. */
  ngOnInit(): void { this.actualizar(); }

  /** Obtiene colecciones según los permisos de lectura del perfil. */
  actualizar(): void {
    this.cargando = true;
    this.error = '';
    const catalogo$ = this.esAdmin ? this.inventario.listarMedicamentos() : this.inventario.listarInventarioParaConsulta();
    catalogo$.subscribe({
      next: (data) => { this.productos = data ?? []; this.paginaProductos = 1; this.cargando = false; },
      error: (err: HttpErrorResponse) => { this.error = this.mensajeError(err); this.cargando = false; }
    });
    if (this.puedeConsultar) {
      this.inventario.listarLotes().subscribe({ next: (data) => { this.lotes = data ?? []; }, error: () => { this.lotes = []; } });
      this.inventario.listarMovimientos().subscribe({ next: (data) => { this.movimientos = data ?? []; }, error: () => { this.movimientos = []; } });
    }
  }

  /** Filtra productos por nombre, código, categoría o registro sanitario. */
  get productosFiltrados(): MedicamentoInventario[] {
    const term = this.normalizar(this.busqueda);
    return this.productos.filter((item) => {
      const coincideTexto = !term || [item.nombre, item.codigo, item.tipoProducto, item.registroInvima, item.presentacion].some((value) => this.normalizar(String(value ?? '')).includes(term));
      return coincideTexto && (this.filtroEstado === 'TODOS' || this.estado(item) === this.filtroEstado);
    });
  }

  /** Muestra solo los productos correspondientes a la página actual. */
  get productosPagina(): MedicamentoInventario[] { return this.paginar(this.productosFiltrados, this.paginaProductos); }
  /** Muestra solo los lotes correspondientes a la página actual. */
  get lotesPagina(): InventarioLote[] { return this.paginar(this.lotes, this.paginaLotes); }
  /** Muestra solo los movimientos correspondientes a la página actual. */
  get movimientosPagina(): MovimientoInventario[] { return this.paginar(this.movimientos, this.paginaMovimientos); }
  get stockBajo(): number { return this.productos.filter((item) => this.estado(item) === 'BAJO').length; }
  get agotados(): number { return this.productos.filter((item) => this.estado(item) === 'AGOTADO').length; }
  get proximosVencer(): number {
    const limite = new Date(); limite.setDate(limite.getDate() + 30);
    return this.lotes.filter((lote) => lote.activo && lote.cantidad > 0 && new Date(lote.fechaVencimiento) >= new Date() && new Date(lote.fechaVencimiento) <= limite).length;
  }

  /** Clasifica el saldo contra el mínimo de reposición del producto. */
  estado(producto: MedicamentoInventario): 'AGOTADO' | 'BAJO' | 'DISPONIBLE' {
    if (producto.cantidadActual <= 0) return 'AGOTADO';
    return producto.cantidadActual <= producto.stockMinimo ? 'BAJO' : 'DISPONIBLE';
  }

  /** Abre un formulario limpio para crear un medicamento y su saldo inicial. */
  nuevoProducto(): void {
    if (!this.esAdmin) return;
    this.productoSeleccionado = null;
    this.formulario = this.formularioInicial();
    this.modalAbierto = 'producto';
  }

  /** Carga los datos editables sin permitir cambiar el saldo de forma directa. */
  editarProducto(producto: MedicamentoInventario): void {
    if (!this.esAdmin) return;
    this.productoSeleccionado = producto;
    this.formulario = { ...producto, fechaCompra: this.fechaHoy(), fechaVence: '', cantidadActual: producto.cantidadActual };
    this.modalAbierto = 'producto';
  }

  /** Valida campos de negocio y envía el formulario al endpoint correspondiente. */
  guardarProducto(): void {
    const f = this.formulario;
    const invimaNecesario = f['tipoProducto'] === 'MEDICAMENTO';
    if (!this.esAdmin || !f['codigo'] || !/^[a-zA-Z0-9]{8}$/.test(f['codigo']) || !f['nombre']?.trim() || !f['tipoProducto'] ||
      (invimaNecesario && !f['registroInvima']?.trim()) || (invimaNecesario && !f['fechaVence']) || !f['fechaCompra'] ||
      Number(f['precioCompra']) < 0 || Number(f['precioVenta']) < 0 || Number(f['stockMinimo']) < 0 || Number(f['cantidadActual']) < 0 ||
      (f['fechaVence'] && f['fechaVence'] < f['fechaCompra']) || this.guardando) {
      Swal.fire('Revisa los datos', 'El código debe tener 8 caracteres, Invima y vencimiento son obligatorios para medicamentos, y las fechas y cantidades deben ser válidas.', 'warning');
      return;
    }
    const payload = { ...f, id: this.productoSeleccionado?.id, codigo: f['codigo'].toUpperCase(), nombre: f['nombre'].trim(), cantidadActual: Number(f['cantidadActual']), stockMinimo: Number(f['stockMinimo']), precioCompra: Number(f['precioCompra']), precioVenta: Number(f['precioVenta']), fechaVence: f['fechaVence'] || null, registroInvima: f['registroInvima'] || null };
    this.guardando = true;
    const request = this.productoSeleccionado ? this.inventario.actualizarMedicamento(payload) : this.inventario.crearMedicamento(payload);
    request.subscribe({ next: () => { this.guardando = false; this.modalAbierto = null; this.actualizar(); }, error: (err: HttpErrorResponse) => { this.guardando = false; Swal.fire('No se pudo guardar', this.mensajeError(err), 'error'); } });
  }

  /** Abre un formulario para registrar una nueva entrada de lote. */
  nuevoLote(producto?: MedicamentoInventario): void {
    if (!this.esAdmin) return;
    this.loteSeleccionado = null;
    this.formularioLote = { medicamentoId: producto?.id ?? 0, numeroLote: '', cantidad: 1, precioCompraLote: producto?.precioCompra ?? 0, fechaVencimiento: '' };
    this.modalAbierto = 'lote';
  }

  /** Abre la edición de metadatos permitidos de un lote existente. */
  editarLote(lote: InventarioLote): void {
    if (!this.esAdmin) return;
    this.loteSeleccionado = lote;
    this.formularioLote = { medicamentoId: lote.medicamentoId, numeroLote: lote.numeroLote, cantidad: lote.cantidad, precioCompraLote: lote.precioCompraLote, fechaVencimiento: lote.fechaVencimiento };
    this.modalAbierto = 'lote';
  }

  /** Guarda una entrada de inventario o los metadatos de un lote seleccionado. */
  guardarLote(): void {
    const f = this.formularioLote;
    if (!this.esAdmin || !f.medicamentoId || !f.numeroLote.trim() || !f.fechaVencimiento || Number(f.precioCompraLote) < 0 || (!this.loteSeleccionado && Number(f.cantidad) <= 0)) return;
    this.guardando = true;
    const request = this.loteSeleccionado
      ? this.inventario.actualizarLote(this.loteSeleccionado.id, { medicamentoId: f.medicamentoId, numeroLote: f.numeroLote.trim(), precioCompraLote: Number(f.precioCompraLote), fechaVencimiento: f.fechaVencimiento, activo: this.loteSeleccionado.activo })
      : this.inventario.crearLote({ medicamentoId: f.medicamentoId, numeroLote: f.numeroLote.trim(), cantidad: Number(f.cantidad), precioCompraLote: Number(f.precioCompraLote), fechaVencimiento: f.fechaVencimiento });
    request.subscribe({ next: () => { this.guardando = false; this.modalAbierto = null; this.actualizar(); }, error: (err: HttpErrorResponse) => { this.guardando = false; Swal.fire('No se pudo guardar', this.mensajeError(err), 'error'); } });
  }

  /** Selecciona un producto para abrir su detalle de lotes y movimientos. */
  verDetalle(producto: MedicamentoInventario): void { this.detalleProducto = producto; }

  /** Valida el tipo de archivo antes de solicitar la previsualización del backend. */
  seleccionarArchivo(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.archivo = file && /\.(csv|xlsx)$/i.test(file.name) ? file : null;
  }

  /** Solicita la prevalidación de registros y conserva sus errores para revisarlos. */
  previsualizarCarga(): void {
    if (!this.esAdmin || !this.archivo) return;
    this.inventario.previsualizarCarga(this.archivo).subscribe({ next: (data) => { this.previsualizacion = data; this.cargaId = Number(data['cargaId']) || null; }, error: (err: HttpErrorResponse) => Swal.fire('Archivo inválido', this.mensajeError(err), 'error') });
  }

  /** Confirma la importación de las filas válidas después de la revisión. */
  confirmarCarga(): void {
    if (!this.esAdmin || !this.cargaId) return;
    this.inventario.confirmarCarga(this.cargaId).subscribe({ next: () => { this.previsualizacion = null; this.cargaId = null; this.archivo = null; this.actualizar(); }, error: (err: HttpErrorResponse) => Swal.fire('No se pudo importar', this.mensajeError(err), 'error') });
  }

  /** Descarga el informe Excel con los filtros de tipo y fecha seleccionados. */
  exportarInforme(): void {
    if (!this.esAdmin || (this.fechaDesde && this.fechaHasta && this.fechaDesde > this.fechaHasta)) return;
    this.inventario.exportarInforme(this.tipoInforme, this.fechaDesde || undefined, this.fechaHasta || undefined).subscribe({ next: (blob) => {
      const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `informe-inventario-${this.fechaHoy()}.xlsx`; link.click(); URL.revokeObjectURL(url);
    }, error: (err: HttpErrorResponse) => Swal.fire('No se pudo generar', this.mensajeError(err), 'error') });
  }

  /** Busca el nombre de un producto para presentar una fila de lote o movimiento. */
  nombreProducto(id: number): string { return this.productos.find((producto) => producto.id === id)?.nombre ?? `Producto ${id}`; }
  /** Devuelve un arreglo de páginas para el control visual de cada tabla. */
  paginas(total: number): number[] { return Array.from({ length: Math.max(1, Math.ceil(total / this.tamanoPagina)) }, (_, i) => i + 1); }
  /** Cambia la pestaña interna del módulo y limpia el criterio de búsqueda. */
  cambiarSeccion(seccion: typeof this.seccion): void { this.seccion = seccion; this.busqueda = ''; }

  /** Construye los valores iniciales del formulario de producto. */
  private formularioInicial(): Record<string, any> { return { codigo: '', nombre: '', tipoProducto: 'MEDICAMENTO', registroInvima: '', descripcion: '', presentacion: '', fechaCompra: this.fechaHoy(), fechaVence: '', precioCompra: 0, precioVenta: 0, cantidadActual: 0, stockMinimo: 0, fechaProximoPedido: '' }; }
  /** Recorta una lista a una página con tamaño constante. */
  private paginar<T>(lista: T[], pagina: number): T[] { return lista.slice((pagina - 1) * this.tamanoPagina, pagina * this.tamanoPagina); }
  /** Normaliza el texto de búsqueda para que no distinga mayúsculas ni acentos. */
  private normalizar(value: string): string { return value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  /** Normaliza el perfil contenido en el token JWT. */
  private normalizarRol(rol: string): string { return this.normalizar(rol).replace(/[\s-]+/g, '_').toUpperCase(); }
  /** Devuelve la fecha actual local como valor para un control de tipo date. */
  private fechaHoy(): string { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  /** Presenta el mensaje devuelto por el backend o un texto general. */
  private mensajeError(err: HttpErrorResponse): string { return err.error?.message || err.error?.mensaje || 'Verifica la información e inténtalo de nuevo.'; }
}
