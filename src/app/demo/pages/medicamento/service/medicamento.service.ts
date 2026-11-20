import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Medicamento } from 'src/app/models/medicamento';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { EntradaLoteRq, ImportacionPreview, ImportacionResultado, InventarioLote, InventarioMovimiento, ProductoRq } from 'src/app/models/medicamento';

@Injectable({
  providedIn: 'root'
})
export class MedicamentoService {

  private api = `medicamento`;

  constructor(private backendService: BackendService) {

  }

  listarMedicamentos(): Observable<Medicamento[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

  consultar(id: number): Observable<Medicamento> {
    return this.backendService.getPath(environment.apiUrlAuth, `medicamento/${id}`);
  }

  crear(producto: ProductoRq): Observable<Medicamento> {
    return this.backendService.postPath(environment.apiUrlAuth, 'medicamento/crear', producto);
  }

  actualizar(id: number, producto: ProductoRq): Observable<Medicamento> {
    return this.backendService.putPath(environment.apiUrlAuth, `medicamento/${id}`, producto);
  }

  stockBajo(): Observable<Medicamento[]> {
    return this.backendService.getPath(environment.apiUrlAuth, 'medicamento/stock-bajo');
  }

  agotados(): Observable<Medicamento[]> {
    return this.backendService.getPath(environment.apiUrlAuth, 'medicamento/agotados');
  }

  vencidos(): Observable<Medicamento[]> {
    return this.backendService.getPath(environment.apiUrlAuth, 'medicamento/vencidos');
  }

  porVencer(hasta: string): Observable<Medicamento[]> {
    return this.backendService.getPath(environment.apiUrlAuth, 'medicamento/por-vencer', new HttpParams().set('hasta', hasta));
  }

  lotes(id: number): Observable<InventarioLote[]> {
    return this.backendService.getPath(environment.apiUrlAuth, `inventario/productos/${id}/lotes`);
  }

  movimientos(id: number): Observable<InventarioMovimiento[]> {
    return this.backendService.getPath(environment.apiUrlAuth, `inventario/productos/${id}/movimientos`);
  }

  registrarEntrada(entrada: EntradaLoteRq): Observable<InventarioLote> {
    return this.backendService.postPath(environment.apiUrlAuth, 'inventario/lotes/entrada', entrada);
  }

  prevalidar(archivo: File): Observable<ImportacionPreview> {
    const data = new FormData();
    data.append('archivo', archivo, archivo.name);
    return this.backendService.postFile(environment.apiUrlAuth, 'inventario/importaciones', 'prevalidar', data);
  }

  confirmarImportacion(id: number): Observable<ImportacionResultado> {
    return this.backendService.postPath(environment.apiUrlAuth, `inventario/importaciones/${id}/confirmar`, {});
  }
}
