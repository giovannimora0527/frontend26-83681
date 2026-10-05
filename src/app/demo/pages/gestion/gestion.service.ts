import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GestionService {
  constructor(private readonly backendService: BackendService) {}

  listar<T>(endpoint: string, listPath: string): Observable<T[]> {
    return this.backendService.get<T[]>(environment.apiUrlAuth, endpoint, listPath);
  }

  guardar<T>(endpoint: string, action: 'guardar' | 'actualizar', payload: unknown): Observable<T> {
    return this.backendService.post<T>(environment.apiUrlAuth, endpoint, action, payload);
  }
}
