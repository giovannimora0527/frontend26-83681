import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

export interface TarifaServicio {
  id: number;
  nombre: string;
  valor: number;
  impuestoPorcentaje: number;
  vigenciaDesde: string;
  vigenciaHasta: string | null;
  activo: boolean;
  especializacionId: number | null;
  especializacionNombre: string | null;
  medicoId: number | null;
  medicoNombre: string | null;
}

export interface TarifaServicioRq {
  especializacionId: number;
  medicoId?: number | null;
  nombre: string;
  valor: number;
  impuestoPorcentaje: number;
  vigenciaDesde: string;
  vigenciaHasta?: string | null;
}

export interface DetalleFactura {
  despachoId?: number | null;
  formulaId?: number | null;
  medicamentoId?: number | null;
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
  impuestoPorcentaje: number;
  descuento: number;
  totalLinea: number;
  despachadoPor?: string | null;
}

export interface ClinicaFactura {
  nombre: string;
  nit: string;
  direccion: string;
  telefono: string;
  correo: string;
  datosDemostracion: boolean;
}

export interface Factura {
  id?: number;
  citaId: number;
  vistaPrevia: boolean;
  clinica: ClinicaFactura;
  clienteNombre: string;
  clienteDocumento: string;
  clienteTelefono: string;
  mascotaNombre: string;
  mascotaEspecie: string;
  mascotaRaza: string;
  medicoId: number;
  medicoNombre: string;
  especializacion: string;
  citaFecha: string;
  motivoConsulta: string;
  fechaCreacion: string;
  estado: string;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  pagado: number;
  saldo: number;
  detalles: DetalleFactura[];
  pagos: { monto: number; metodo: string; referencia?: string; fecha: string; usuario: string }[];
}

@Injectable({ providedIn: 'root' })
export class FacturacionService {
  private readonly api = environment.apiUrlAuth;

  constructor(private readonly backend: BackendService) {}

  tarifas(): Observable<TarifaServicio[]> {
    return this.backend.get(this.api, 'facturacion', 'tarifas');
  }

  tarifasAdministracion(): Observable<TarifaServicio[]> {
    return this.backend.get(this.api, 'facturacion/tarifas', 'admin');
  }

  crearTarifa(request: TarifaServicioRq): Observable<TarifaServicio> {
    return this.backend.post(this.api, 'facturacion', 'tarifas', request);
  }

  actualizarTarifa(id: number, request: TarifaServicioRq): Observable<TarifaServicio> {
    return this.backend.put(this.api, 'facturacion/tarifas', String(id), request);
  }

  cambiarEstadoTarifa(id: number, activo: boolean): Observable<TarifaServicio> {
    const params = new HttpParams().set('activo', activo);
    return this.backend.post(this.api, 'facturacion/tarifas', `${id}/estado`, {}, params);
  }

  vistaPrevia(request: { citaId: number; descuento: number }): Observable<Factura> {
    return this.backend.post(this.api, 'facturacion/facturas', 'vista-previa', request);
  }

  facturar(request: { citaId: number; descuento: number }): Observable<Factura> {
    return this.backend.post(this.api, 'facturacion', 'facturas', request);
  }

  factura(id: number): Observable<Factura> {
    return this.backend.get(this.api, 'facturacion/facturas', String(id));
  }

  registrarPago(id: number, request: { monto: number; metodo: string; referencia?: string }): Observable<Factura> {
    return this.backend.post(this.api, `facturacion/facturas/${id}`, 'pagos', request);
  }

  anular(id: number, motivo: string): Observable<Factura> {
    const params = new HttpParams().set('motivo', motivo);
    return this.backend.post(this.api, `facturacion/facturas/${id}`, 'anular', {}, params);
  }

  descargarFactura(id: number): Observable<Blob> {
    return this.backend.download(this.api, 'facturacion/facturas', `${id}.pdf`);
  }
}
