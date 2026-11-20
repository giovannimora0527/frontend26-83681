import { confirmarAccion } from 'src/app/utils/confirmar-accion';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin, Observable, Subscription } from 'rxjs';
import { Cita } from 'src/app/models/cita';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';
import { ClinicaApi, Filtros, perfilClinica, perfilesClinica } from './clinica-api.service';

/** Contiene los datos de una factura y su estado de pago. */
interface Factura { id: number; numero: string; fecha: string; estado: string; total: number; pagado: number }
/** Contiene los datos de un pago aplicado a una factura. */
interface Pago { id: number; monto: number; metodo: string; fecha: string; observacion: string; referenciaDevolucion: string | null }
/** Indica si una cita está lista para facturar y qué la bloquea cuando corresponde. */
interface EstadoEmision { disponible: boolean; motivo: string | null }

const etiquetasEstado: Record<string, string> = {
  PENDIENTE: 'Pendiente de pago',
  PAGO_PARCIAL: 'Pago parcial',
  PAGADA: 'Pagada',
  ANULADA: 'Anulada',
  NO_REQUIERE_PAGO: 'No requiere pago'
};

/** Gestiona la emisión, consulta y anulación de facturas, junto con sus pagos. */
@Component({ imports: [CommonModule, FormsModule], templateUrl: './facturacion.component.html' })
export class FacturacionComponent implements OnInit {
  private readonly api = inject(ClinicaApi);
  private readonly destroyRef = inject(DestroyRef);
  private consulta?: Subscription;
  private consultaPagos?: Subscription;
  private consultaEmision?: Subscription;
  readonly admin = perfilesClinica.admin.includes(perfilClinica());
  readonly metodos = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'NEQUI', 'DAVIPLATA'];
  clientes: Cliente[] = [];
  mascotas: Mascota[] = [];
  citas: Cita[] = [];
  clienteId: number | null = null;
  mascotaId: number | null = null;
  citaId: number | null = null;
  estadoEmision: EstadoEmision | null = null;
  cargandoEmision = false;
  errorEmision = '';
  descuento = { monto: null as number | null, motivo: '' };
  facturas: Factura[] | null = null;
  seleccion: Factura | null = null;
  pagos: Pago[] = [];
  cargandoPagos = false;
  pagosConsultados = false;
  errorPagos = '';
  pago = this.nuevoPago();
  motivoAnulacion = '';
  devolucionId: number | null = null;
  referencia = '';
  ocupado = false;
  error = '';
  private readonly fallo = this.api.error((mensaje) => this.error = mensaje);

  /** Muestra las mascotas del propietario elegido en el historial. */
  get mascotasVisibles() {
    return this.mascotas.filter((mascota) =>
      this.clienteId === null || this.idPropietario(mascota) === this.clienteId || mascota.mascotaId === this.mascotaId);
  }

  /** Ofrece para emisión las mascotas que tienen al menos una cita atendida. */
  get mascotasParaEmitir() {
    const atendidas = new Set(this.citas.map((cita) => this.idMascotaCita(cita)));
    return this.mascotas.filter((mascota) => atendidas.has(mascota.mascotaId ?? null));
  }

  /** Filtra citas atendidas por mascota o, si no se eligió una, por propietario. */
  get citasVisibles() {
    return this.citas.filter((cita) => this.mascotaId !== null
      ? this.idMascotaCita(cita) === this.mascotaId
      : this.clienteId === null || this.propietarioCita(cita)?.id === this.clienteId);
  }

  /** Muestra el propietario registrado en la cita elegida o en la ficha de la mascota. */
  get propietarioEmision(): Cliente | undefined {
    const cita = this.citas.find((item) => item.id === this.citaId);
    return (cita && this.propietarioCita(cita))
      ?? this.propietarioMascota(this.mascotas.find((item) => item.mascotaId === this.mascotaId));
  }

  /** Devuelve el nombre que acompaña a la mascota en los selectores. */
  nombrePropietario(mascota: Mascota): string {
    const cliente = this.propietarioMascota(mascota);
    return [cliente?.nombres, cliente?.apellidos].filter(Boolean).join(' ');
  }

  private idPropietario(mascota: Mascota | undefined): number | null {
    return mascota?.cliente?.id ?? mascota?.clienteId ?? null;
  }

  private propietarioMascota(mascota: Mascota | undefined): Cliente | undefined {
    return mascota?.cliente ?? this.clientes.find((cliente) => cliente.id === this.idPropietario(mascota));
  }

  private idMascotaCita(cita: Cita): number | null {
    return cita.mascota?.mascotaId ?? cita.mascotaId ?? null;
  }

  private propietarioCita(cita: Cita): Cliente | undefined {
    return cita.cliente ?? this.propietarioMascota(cita.mascota)
      ?? this.propietarioMascota(this.mascotas.find((item) => item.mascotaId === this.idMascotaCita(cita)));
  }


  /** Calcula el valor pendiente de pago de la factura seleccionada. */
  get saldo(): number {
    if (!this.seleccion || this.seleccion.estado === 'ANULADA') return 0;
    return Math.round((this.seleccion.total - this.seleccion.pagado) * 100) / 100;
  }

  /** Determina si la factura seleccionada admite un nuevo registro de pago. */
  get admitePagos(): boolean {
    return this.pagosConsultados && !this.cargandoPagos && this.saldo > 0
      && ['PENDIENTE', 'PAGO_PARCIAL'].includes(this.seleccion?.estado ?? '')
      && this.pagos.every((pago) => !pago.referenciaDevolucion);
  }

  /** Prepara la pantalla al abrirse y carga los datos que necesita. */
  ngOnInit() {
    forkJoin({
      clientes: this.api.leer<Cliente[]>('cliente/listar'),
      mascotas: this.api.leer<Mascota[]>('mascota/listar'),
      citas: this.api.leer<Cita[]>('cita/listar')
    }).subscribe({ next: ({ clientes, mascotas, citas }) => {
      this.clientes = clientes;
      this.mascotas = mascotas;
      this.citas = citas.filter((cita) => cita.estado === 'ATENDIDA');
    }, error: this.fallo });
  }

  /** Restablece el formulario para registrar otro pago. */
  nuevoPago() {
    return { monto: null as number | null, metodo: 'EFECTIVO', observacion: '' };
  }

  /** Convierte el estado interno en el texto que se muestra en pantalla. */
  etiquetaEstado(estado: string): string {
    return etiquetasEstado[estado] ?? estado.replace(/_/g, ' ');
  }

  /** Reinicia la selección de mascota cuando el usuario elige otro propietario. */
  cambiarPropietario(clienteId: number | null) {
    this.clienteId = clienteId;
    this.mascotaId = null;
    this.cambiarFiltros();
  }

  /** Asocia automáticamente el propietario de la mascota y reinicia la cita anterior. */
  cambiarMascota(mascotaId: number | null, desdeEmision = false) {
    this.mascotaId = mascotaId;
    if (mascotaId !== null || desdeEmision) {
      this.clienteId = this.idPropietario(this.mascotas.find((item) => item.mascotaId === mascotaId));
    }
    this.cambiarFiltros();
  }

  /** Selecciona la cita y conserva el propietario que se usará para emitir la factura. */
  cambiarCita(citaId: number | null) {
    if (citaId !== this.citaId) this.descuento = { monto: null, motivo: '' };
    const cita = this.citasVisibles.find((item) => item.id === citaId);
    if (cita) {
      const mascotaId = this.idMascotaCita(cita);
      const clienteId = this.propietarioCita(cita)?.id ?? null;
      if (mascotaId !== this.mascotaId || clienteId !== this.clienteId) {
        this.mascotaId = mascotaId;
        this.clienteId = clienteId;
        this.cambiarFiltros();
      }
    }
    this.consultarEmision(cita?.id ?? null);
  }

  /** Limpia el historial y la disponibilidad cuando cambian sus filtros. */
  private cambiarFiltros() {
    this.descuento = { monto: null, motivo: '' };
    this.consulta?.unsubscribe();
    this.facturas = null;
    this.seleccion = null;
    this.consultaPagos?.unsubscribe();
    this.consultarEmision(null);
  }

  /** Consulta el historial de facturación de acuerdo con el propietario y la mascota elegidos. */
  historial(seleccionarId?: number) {
    const filtros: Filtros = {};
    if (this.clienteId) filtros['clienteId'] = this.clienteId;
    if (this.mascotaId) filtros['mascotaId'] = this.mascotaId;
    if (!Object.keys(filtros).length) return;
    this.consulta?.unsubscribe();
    this.seleccion = null;
    this.consultaPagos?.unsubscribe();
    this.consulta = this.api.leer<Factura[]>('factura/historial', filtros).subscribe({
      next: (facturas) => {
        this.facturas = facturas;
        const factura = facturas.find((item) => item.id === seleccionarId);
        if (factura) this.abrir(factura);
      }, error: this.fallo
    });
  }

  /** Comprueba si la cita seleccionada reúne las condiciones para emitir una factura. */
  consultarEmision(citaId: number | null) {
    this.consultaEmision?.unsubscribe();
    this.citaId = citaId;
    this.estadoEmision = null;
    this.errorEmision = '';
    if (citaId === null) return;
    this.cargandoEmision = true;
    this.consultaEmision = this.api.leer<EstadoEmision>(`factura/cita/${citaId}/estado`)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.cargandoEmision = false))
      .subscribe({
        next: (estado) => this.estadoEmision = estado,
        error: this.api.error((mensaje) => {
          if (this.citaId === citaId) this.errorEmision = mensaje;
        })
      });
  }

  /** Solicita la generación de una factura para la cita seleccionada. */
  emitir() {
    if (!this.citaId || !this.estadoEmision?.disponible || this.ocupado) return;
    const { monto, motivo } = this.descuento;
    const data = this.admin && monto ? { monto, motivo: motivo.trim() } : null;
    if (data && !data.motivo) { this.error = 'Indica el motivo del descuento.'; return; }
    const cita = this.citas.find((item) => item.id === this.citaId);
    this.operar(this.api.enviar<{ facturaId: number }>('POST', `factura/cita/${this.citaId}`, data), 'Factura generada.', ({ facturaId }) => {
      this.consultarEmision(null);
      this.descuento = { monto: null, motivo: '' };
      if (cita) {
        this.mascotaId = this.idMascotaCita(cita);
        this.clienteId = this.propietarioCita(cita)?.id ?? null;
      }
      this.historial(facturaId);
    });
  }

  /** Abre el detalle de la factura y carga sus pagos. */
  abrir(factura: Factura) {
    this.seleccion = factura;
    this.pago = this.nuevoPago();
    this.motivoAnulacion = '';
    this.devolucionId = null;
    this.referencia = '';
    this.cargarPagos();
  }

  /** Carga los pagos. */
  cargarPagos() {
    const facturaId = this.seleccion?.id;
    if (!facturaId) return;
    this.consultaPagos?.unsubscribe();
    this.pagos = [];
    this.pagosConsultados = false;
    this.errorPagos = '';
    this.cargandoPagos = true;
    this.consultaPagos = this.api.leer<Pago[]>(`factura/${facturaId}/pagos`)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.cargandoPagos = false))
      .subscribe({
        next: (pagos) => {
          this.pagos = pagos;
          this.pagosConsultados = true;
        },
        error: this.api.error((mensaje) => {
          if (this.seleccion?.id === facturaId) this.errorPagos = mensaje;
        })
      });
  }

  /** Registra un pago contra la factura abierta. */
  pagar() {
    const id = this.seleccion?.id;
    if (!id || !this.admitePagos || !this.pago.monto || this.pago.monto <= 0 || this.pago.monto > this.saldo) return;
    this.operar(this.api.enviar('POST', `factura/${id}/pagos`, this.pago), 'Pago registrado.', () => this.historial(id));
  }

  /** Solicita la devolución del pago seleccionado. */
  devolver() {
    const id = this.seleccion?.id;
    const referencia = this.referencia.trim();
    if (!this.admin || !id || !this.devolucionId || !referencia) return;
    this.operar(this.api.enviar('POST', `factura/${id}/pagos/${this.devolucionId}/devolucion`, { referencia }),
      'Devolución registrada.', () => this.historial(id));
  }

  /** Solicita anular la factura abierta con la justificación indicada. */
  anular() {
    const id = this.seleccion?.id;
    const motivo = this.motivoAnulacion.trim();
    if (!this.admin || !id || !motivo) return;
    this.operar(this.api.enviar('POST', `factura/${id}/anular`, { motivo }), 'Factura anulada.', () => this.historial(id));
  }

  /** Descarga el PDF de la factura solicitada. */
  pdf(id: number) {
    this.api.descargar(`factura/${id}/pdf`, `factura-${id}.pdf`, (mensaje) => this.error = mensaje);
  }

  /** Envía la acción seleccionada y actualiza la información cuando termina la petición. */
  private operar<T>(peticion: Observable<T>, aviso: string, completar: (respuesta: T) => void) {
    if (this.ocupado) return;
    this.error = '';
    this.ocupado = true;
    peticion.pipe(finalize(() => this.ocupado = false)).subscribe({
      next: (respuesta) => { completar(respuesta); confirmarAccion(aviso); }, error: this.fallo
    });
  }
}
