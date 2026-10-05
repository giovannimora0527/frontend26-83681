import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Medicamento } from 'src/app/models/medicamento';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicamentoService {

  // Backend: GET {apiUrlAuth}/tablas/medicamento  ->  SELECT * FROM clinica.medicamento
  private api = `tablas`;
  private tabla = `medicamento`;

  constructor(private readonly backendService: BackendService) {
  }

  getMedicamentos(): Observable<Medicamento[]> {
    return this.backendService.get<Medicamento[]>(environment.apiUrlAuth, this.api, this.tabla);
  }

}
