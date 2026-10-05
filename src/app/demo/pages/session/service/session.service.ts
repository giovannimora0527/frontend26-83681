import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Session } from 'src/app/models/session';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  // Backend: GET {apiUrlAuth}/tablas/session  ->  SELECT * FROM clinica.session
  private api = `tablas`;
  private tabla = `session`;

  constructor(private readonly backendService: BackendService) {
  }

  getSesiones(): Observable<Session[]> {
    return this.backendService.get<Session[]>(environment.apiUrlAuth, this.api, this.tabla);
  }

}
