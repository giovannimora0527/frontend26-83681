import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cita } from 'src/app/models/cita';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private api = `citas`;

  constructor(private backendService: BackendService) { 
    this.testService();
  }

  testService() {
    this.backendService.get(environment.apiUrlAuth, this.api, "test");
  }

  getCitas(): Observable<Cita[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }
}
