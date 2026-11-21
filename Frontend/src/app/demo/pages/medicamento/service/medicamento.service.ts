import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Medicamento } from 'src/app/models/medicamento';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class MedicamentoService {
  constructor(private backendService: BackendService) {}
  listarMedicamentos(): Observable<Medicamento[]> {
    return this.backendService.get(environment.apiUrlAuth, 'medicamento', 'listar');
  }
  listarInventario(): Observable<Medicamento[]> {
    return this.backendService.get(environment.apiUrlAuth, 'inventario', 'medicamentos');
  }
  crear(m: Medicamento): Observable<Medicamento> {
    return this.backendService.post(environment.apiUrlAuth, 'inventario', 'medicamentos', m);
  }
  actualizar(id: number, m: Medicamento): Observable<Medicamento> {
    return this.backendService.put(environment.apiUrlAuth, 'inventario', `medicamentos/${id}`, m);
  }
  listarLotes(id: number): Observable<any[]> {
    return this.backendService.get(environment.apiUrlAuth, 'inventario', `lotes/medicamento/${id}`);
  }
  crearLote(lote: any): Observable<any> {
    return this.backendService.post(environment.apiUrlAuth, 'inventario', 'lotes', lote);
  }
}
