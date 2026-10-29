import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { AnotacionHistoria } from 'src/app/models/anotacion-historia';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnotacionHistoriaService {
  private api = 'anotacion-historia';

  constructor(private readonly backendService: BackendService) {}

  listarAnotaciones(): Observable<AnotacionHistoria[]> {
    return this.backendService.get<AnotacionHistoria[]>(environment.apiUrlAuth, this.api, 'listar-anotaciones').pipe(
      // El backend entrega la fecha como "fecha"; la pantalla la usa como "fechaHora".
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map((anotaciones) => anotaciones.map((anotacion: any) => ({ ...anotacion, fechaHora: anotacion.fecha })))
    );
  }

  listarAnotacionesPorHistoria(historiaId: number): Observable<AnotacionHistoria[]> {
    const parametros = new HttpParams().set('historiaId', historiaId);
    return this.backendService.get<AnotacionHistoria[]>(environment.apiUrlAuth, this.api, 'listar', parametros).pipe(
      // El backend entrega la fecha como "fecha"; la pantalla la usa como "fechaHora".
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map((anotaciones) => anotaciones.map((anotacion: any) => ({ ...anotacion, fechaHora: anotacion.fecha })))
    );
  }

  crearAnotacion(solicitud: AnotacionHistoria): Observable<unknown> {
    return this.backendService.post(environment.apiUrlAuth, this.api, 'guardar', solicitud);
  }
}