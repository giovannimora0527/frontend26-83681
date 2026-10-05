import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoriaMedicaService {
  private api = `historia-medica`;

  constructor(private readonly backendService: BackendService) {
  }

  getHistoriaMedicas(): Observable<HistoriaMedica[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

}
