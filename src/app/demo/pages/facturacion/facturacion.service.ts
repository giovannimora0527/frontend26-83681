import { Injectable } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Factura, FacturaDetalleRs } from 'src/app/models/factura';
@Injectable({ providedIn: 'root' })
export class FacturacionService {
  constructor(private readonly backend: BackendService) {}
  porCliente(id: number) { return this.backend.getPath<Factura[]>(environment.apiUrlAuth, `facturas/cliente/${id}`); }
  porMascota(id: number) { return this.backend.getPath<Factura[]>(environment.apiUrlAuth, `facturas/mascota/${id}`); }
  detalle(id: number) { return this.backend.getPath<FacturaDetalleRs>(environment.apiUrlAuth, `facturas/${id}`); }
  pagar(id: number, request: { monto: number; medio: string; referencia?: string }) { return this.backend.postPath<Factura>(environment.apiUrlAuth, `facturas/${id}/pagos`, request); }
  pdf(id: number) { return this.backend.getBlob(environment.apiUrlAuth, `facturas/${id}/pdf`); }
  crear(atencionId: number, request: { tarifaServicioId: number; descuento: number; motivoDescuento?: string }) {
    return this.backend.postPath<Factura>(environment.apiUrlAuth, `facturas/atencion/${atencionId}`, request);
  }
}
