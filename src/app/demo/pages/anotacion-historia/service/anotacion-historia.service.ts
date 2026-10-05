import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnotacionHistoriaService {
  private api = `anotacion-historia`;

  constructor(private readonly backendService: BackendService) {
  }

  getAnotacionHistorias(): Observable<AnotacionHistoria[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

}
