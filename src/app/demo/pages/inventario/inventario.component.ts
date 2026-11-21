import { confirmarAccion } from 'src/app/utils/confirmar-accion';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { finalize, Subscription } from 'rxjs';
import { FiltrosInformeInventario, InformeInventario, InventarioLote, MedicamentoInventario, MovimientoInventario } from 'src/app/models/inventario.model';
import { InventarioService, RegistroLote, ResultadoCarga } from './service/inventario.service';
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
  medicamentoMovimientosId: number | null = null;
  cargandoMovimientos = false;
  errorMovimientos = '';
  private consultaMovimientos?: Subscription;
  private readonly destroyRef = inject(DestroyRef);
  private readonly fechaInventario = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' });
  lotesCargados = false;
  busqueda = '';
  seccion: 'productos' | 'lotes' | 'movimientos' | 'carga' | 'informe' = 'productos';
  paginaProductos = 1;
  paginaLotes = 1;
  paginaMovimientos = 1;
  cargando = false;
  errorLotes = '';
  error = '';
  modalAbierto: 'producto' | null = null;
  productoSeleccionado: MedicamentoInventario | null = null;
  detalleProducto: MedicamentoInventario | null = null;
  guardando = false;
  formulario = this.formularioInicial();
  archivo: File | null = null;
  previsualizacion: ResultadoCarga | null = null;
  cargaId: number | null = null;
  procesandoCarga = false;
  resultadoCarga: ResultadoCarga | null = null;
  formularioLote: RegistroLote | null = null;
  tipoInforme = 'TODOS';
  fechaDesde = '';
  fechaHasta = '';
  informe: InformeInventario | null = null;
  cargandoInforme = false;
  descargandoInforme = false;
  errorInforme = '';
  private filtrosConsultados: FiltrosInformeInventario | null = null;
  filtroEstado = 'TODOS';

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private readonly inventario: InventarioService) {}

  /** Carga los datos básicos cuando se abre la vista. */
  ngOnInit(): void { this.actualizar(); }

  /** Obtiene colecciones según los permisos de lectura del perfil. */
  actualizar(mostrarConfirmacion = false): void {
    this.errorLotes = '';
    this.cargando = true;
    this.error = '';
    const catalogo$ = this.esAdmin ? this.inventario.listarMedicamentos() : this.inventario.listarInventarioParaConsulta();
    catalogo$.subscribe({
      next: (data) => {
        this.productos = data ?? [];
        this.paginaProductos = 1;
        this.cargando = false;
        if (mostrarConfirmacion) confirmarAccion('Catálogo de productos actualizado.', true);
      },
      error: (err: HttpErrorResponse) => { this.error = 'No se pudo cargar el catálogo. ' + this.mensajeError(err); this.cargando = false; }
    });
    if (this.puedeConsultar) {
      this.lotesCargados = false;
      this.inventario.listarLotes().subscribe({
        next: (data) => { this.lotes = data ?? []; this.lotesCargados = true; },
        error: (err: HttpErrorResponse) => {
          this.lotes = [];
          this.errorLotes = 'No se pudieron cargar los lotes. ' + this.mensajeError(err);
        }
      });
      this.consultarMovimientos(this.medicamentoMovimientosId);
    }
  }

  /** Consulta los movimientos y reinicia la página del historial de inventario. */
  consultarMovimientos(medicamentoId: number | null): void {
    if (!this.puedeConsultar) return;
    this.consultaMovimientos?.unsubscribe();
    this.medicamentoMovimientosId = medicamentoId;
    this.paginaMovimientos = 1;
    this.movimientos = [];
    this.errorMovimientos = '';
    this.cargandoMovimientos = true;
    this.consultaMovimientos = this.inventario.listarMovimientos(medicamentoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.movimientos = data ?? [];
          this.cargandoMovimientos = false;
        },
        error: (err: HttpErrorResponse) => {
          this.errorMovimientos = 'No se pudieron cargar los movimientos. ' + this.mensajeError(err);
          this.cargandoMovimientos = false;
        }
      });
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
  /** Cuenta los productos con unidades disponibles en el nivel mínimo o por debajo. */
  get stockBajo(): number { return this.productos.filter((item) => this.estado(item) === 'BAJO').length; }
  /** Cuenta los productos que no tienen unidades para dispensar. */
  get agotados(): number { return this.productos.filter((item) => this.estado(item) === 'AGOTADO').length; }
  /** Cuenta los lotes vigentes que vencen dentro del período mostrado. */
  get proximosVencer(): number {
    return this.lotesCargados ? this.lotes.filter((lote) => this.estadoLote(lote) === 'Próximo a vencer').length : 0;
  }

  /** Calcula las unidades dispensables según el saldo del producto y los lotes vigentes. */
  disponible(producto: MedicamentoInventario): number | null {
    if (!this.lotesCargados) return null;
    const hoy = this.fechaInventario.format();
    const unidades = this.lotes
      .filter((lote) => lote.medicamentoId === producto.id && lote.activo && lote.cantidad > 0 &&
        (!lote.fechaVencimiento || lote.fechaVencimiento >= hoy))
      .reduce((total, lote) => total + lote.cantidad, 0);
    return Math.min(Math.max(0, producto.cantidadActual ?? 0), unidades);
  }

  /** Clasifica el producto como disponible, con stock bajo o agotado. */
  estado(producto: MedicamentoInventario): 'AGOTADO' | 'BAJO' | 'DISPONIBLE' | null {
    const disponible = this.disponible(producto);
    if (disponible === null) return null;
    if (disponible === 0) return 'AGOTADO';
    return disponible <= producto.stockMinimo ? 'BAJO' : 'DISPONIBLE';
  }

  /** Clasifica un lote según su saldo, vigencia y fecha de vencimiento. */
  estadoLote(lote: InventarioLote): string {
    const hoy = this.fechaInventario.format();
    if (lote.cantidad <= 0) return 'Agotado';
    if (lote.fechaVencimiento && lote.fechaVencimiento < hoy) return 'Vencido';
    if (!lote.activo) return 'Inactivo';
    const limite = new Date(hoy + 'T00:00:00Z');
    limite.setUTCDate(limite.getUTCDate() + 30);
    if (lote.fechaVencimiento && lote.fechaVencimiento <= limite.toISOString().slice(0, 10)) return 'Próximo a vencer';
    return 'Vigente';
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
    this.formulario = { ...producto, fechaCompra: producto.fechaCompra ?? '', fechaVence: producto.fechaVence ?? '', cantidadActual: producto.cantidadActual };
    this.modalAbierto = 'producto';
  }

  /** Devuelve el día actual de Bogotá para programar el próximo pedido. */
  get fechaMinimaPedido(): string {
    return this.fechaInventario.format();
  }

  /** Detecta un próximo pedido retroactivo nuevo o modificado. */
  get pedidoAnterior(): boolean {
    const fecha = this.formulario['fechaProximoPedido'];
    return !!fecha && fecha < this.fechaMinimaPedido && fecha !== this.productoSeleccionado?.fechaProximoPedido;
  }

  /** Valida campos de negocio y envía el formulario al endpoint correspondiente. */
  guardarProducto(): void {
    const f = this.formulario;
    if (this.pedidoAnterior) {
      Swal.fire('Revisa la fecha', 'El próximo pedido debe ser de hoy o posterior.', 'warning');
      return;
    }
    const invimaNecesario = f['tipoProducto'] === 'MEDICAMENTO';
    if (!this.esAdmin || !f['codigo'] || !/^[a-zA-Z0-9]{8}$/.test(f['codigo']) || !f['nombre']?.trim() || !f['tipoProducto'] ||
      (invimaNecesario && !f['registroInvima']?.trim()) || (invimaNecesario && !f['fechaVence']) || !f['fechaCompra'] ||
      Number(f['precioCompra']) < 0 || Number(f['precioVenta']) < 0 || Number(f['stockMinimo']) < 0 || Number(f['cantidadActual']) < 0 ||
      (f['fechaVence'] && f['fechaVence'] < f['fechaCompra']) || this.guardando) {
      Swal.fire('Revisa los datos', 'El código debe tener 8 caracteres, Invima y vencimiento son obligatorios para medicamentos, y las fechas y cantidades deben ser válidas.', 'warning');
      return;
    }
    const payload = {
      ...f, id: this.productoSeleccionado?.id, codigo: f['codigo'].toUpperCase(), nombre: f['nombre'].trim(),
      cantidadActual: Number(f['cantidadActual']), stockMinimo: Number(f['stockMinimo']),
      precioCompra: Number(f['precioCompra']), precioVenta: Number(f['precioVenta']),
      fechaVence: f['fechaVence'] || null, fechaProximoPedido: f['fechaProximoPedido'] || null,
      registroInvima: f['registroInvima'] || null
    };
    this.guardando = true;
    const editando = !!this.productoSeleccionado;
    const request = editando ? this.inventario.actualizarMedicamento(payload) : this.inventario.crearMedicamento(payload);
    request.subscribe({ next: () => {
      this.guardando = false;
      this.modalAbierto = null;
      this.actualizar();
      confirmarAccion(editando ? 'El producto se actualizó correctamente.' : 'El producto se creó correctamente.');
    }, error: (err: HttpErrorResponse) => { this.guardando = false; Swal.fire('No se pudo guardar', this.mensajeError(err), 'error'); } });
  }

  /** Selecciona un producto para abrir su detalle de lotes y movimientos. */
  verDetalle(producto: MedicamentoInventario): void { this.detalleProducto = producto; }

  /** Valida el tipo de archivo antes de solicitar la previsualización del backend. */
  seleccionarArchivo(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.previsualizacion = null;
    this.resultadoCarga = null;
    this.cargaId = null;
    this.archivo = file && /\.(csv|xlsx)$/i.test(file.name) ? file : null;
  }

  /** Solicita la prevalidación de registros y conserva sus errores para revisarlos. */
  previsualizarCarga(): void {
    if (!this.esAdmin || !this.archivo || this.procesandoCarga) return;
    this.previsualizacion = null;
    this.cargaId = null;
    this.procesandoCarga = true;
    this.inventario.previsualizarCarga(this.archivo).pipe(finalize(() => this.procesandoCarga = false)).subscribe({ next: (data) => { this.previsualizacion = data; this.cargaId = Number(data['cargaId']) || null; }, error: (err: HttpErrorResponse) => Swal.fire('Archivo inválido', this.mensajeError(err), 'error') });
  }

  /** Confirma la importación de las filas válidas después de la revisión. */
  confirmarCarga(): void {
    if (!this.esAdmin || !this.cargaId || !this.previsualizacion?.registrosValidos || this.procesandoCarga) return;
    this.procesandoCarga = true;
    this.inventario.confirmarCarga(this.cargaId).pipe(finalize(() => this.procesandoCarga = false)).subscribe({ next: (resultado) => { this.resultadoCarga = resultado; this.previsualizacion = null; this.cargaId = null; this.archivo = null; this.actualizar(); confirmarAccion('La importación finalizó. Consulta el resumen de registros importados.'); }, error: (err: HttpErrorResponse) => Swal.fire('No se pudo importar', this.mensajeError(err), 'error') });
  }

  /** Prepara el formulario para registrar un lote de inventario. */
  nuevoLote(): void {
    if (!this.esAdmin) return;
    this.formularioLote = { medicamentoId: 0, numeroLote: '', cantidad: 1, precioCompraLote: 0, fechaVencimiento: null };
  }

  /** Indica si el producto seleccionado exige una fecha de vencimiento para el lote. */
  requiereVencimientoLote(medicamentoId: number): boolean {
    return this.productos.some((producto) => producto.id === medicamentoId && producto.tipoProducto === 'MEDICAMENTO');
  }

  /** Guarda el lote. */
  guardarLote(lote: RegistroLote): void {
    if (!this.esAdmin || this.guardando || !lote.medicamentoId || !lote.numeroLote.trim() ||
      !Number.isInteger(lote.cantidad) || lote.cantidad <= 0 || lote.precioCompraLote == null || lote.precioCompraLote < 0 ||
      (this.requiereVencimientoLote(lote.medicamentoId) && !lote.fechaVencimiento)) return;
    this.guardando = true;
    this.inventario.guardarLote({ ...lote, numeroLote: lote.numeroLote.trim(), fechaVencimiento: lote.fechaVencimiento || null })
      .pipe(finalize(() => this.guardando = false)).subscribe({
        next: () => { this.formularioLote = null; this.actualizar(); confirmarAccion('El lote se registró correctamente.'); },
        error: (err: HttpErrorResponse) => Swal.fire('No se pudo registrar el lote', this.mensajeError(err), 'error')
      });
  }

  /** Indica si se ingresó una fecha inicial posterior a la final. */
  get rangoInformeInvalido(): boolean {
    return !!this.fechaDesde && !!this.fechaHasta && this.fechaDesde > this.fechaHasta;
  }

  /** Detecta diferencias entre los filtros actuales y los del informe visible. */
  get informeDesactualizado(): boolean {
    const filtros = this.filtrosConsultados;
    return !!filtros && (filtros.tipo !== this.tipoInforme ||
      filtros.desde !== this.fechaDesde || filtros.hasta !== this.fechaHasta);
  }

  /** Genera la vista previa del informe de inventario con el tipo y las fechas indicados. */
  consultarInforme(): void {
    if (!this.puedeConsultar || this.rangoInformeInvalido || this.cargandoInforme || this.descargandoInforme) return;
    const filtros = { tipo: this.tipoInforme, desde: this.fechaDesde, hasta: this.fechaHasta };
    this.informe = null;
    this.filtrosConsultados = null;
    this.errorInforme = '';
    this.cargandoInforme = true;
    this.inventario.consultarInforme(filtros).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.cargandoInforme = false)
    ).subscribe({
      next: (informe) => {
        this.informe = informe;
        this.filtrosConsultados = filtros;
      },
      error: (err: HttpErrorResponse) => this.errorInforme = 'No se pudo consultar el informe. ' + this.mensajeError(err)
    });
  }

  /** Descarga el informe de inventario en el formato y con los filtros solicitados. */
  exportarInforme(formato: 'pdf' | 'excel'): void {
    const filtros = this.filtrosConsultados;
    if (!this.puedeConsultar || !filtros || this.informeDesactualizado || this.descargandoInforme) return;
    this.errorInforme = '';
    this.descargandoInforme = true;
    this.inventario.exportarInforme(formato, filtros).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.descargandoInforme = false)
    ).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `informe-inventario-${this.fechaHoy()}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
        enlace.click();
        setTimeout(() => URL.revokeObjectURL(url), 0);
        confirmarAccion(formato === 'pdf' ? 'Descarga del informe PDF iniciada.' : 'Descarga del informe Excel iniciada.', true);
      },
      error: (err: HttpErrorResponse) => this.errorInforme = 'No se pudo descargar el informe. ' + this.mensajeError(err)
    });
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
  private mensajeError(err: HttpErrorResponse): string { if (err.status === 401) return 'Inicia sesión de nuevo para continuar.'; return err.error?.message || err.error?.mensaje || 'Verifica la información e inténtalo de nuevo.'; }
}
