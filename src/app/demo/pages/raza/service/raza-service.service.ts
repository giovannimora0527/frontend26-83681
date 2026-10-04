import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Raza } from 'src/app/models/raza';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RazaServiceService {
  private api = `raza`;

  constructor(private backendService: BackendService) {

  }

  getRazas(): Observable<Raza[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }

}
