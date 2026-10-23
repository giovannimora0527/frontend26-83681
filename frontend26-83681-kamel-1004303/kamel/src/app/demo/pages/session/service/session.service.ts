import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Session } from 'src/app/models/session';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private api = `session`;

  constructor(private backendService: BackendService) { 
    this.testService();
  }

  testService() {
    this.backendService.get(environment.apiUrlAuth, this.api, "test");
  }

  getSessions(): Observable<Session[]> {
    return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
  }
}
