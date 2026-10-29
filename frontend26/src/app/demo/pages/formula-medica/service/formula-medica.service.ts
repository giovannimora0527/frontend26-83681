import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { FormulaMedica } from 'src/app/models/formula-medica';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormulaMedicaService {
  private api ='formula-medica';


  constructor(private readonly backendService: BackendService) {}
    
    getFormulaMedica(): Observable<FormulaMedica[]> {
      return this.backendService.get(environment.apiUrlAuth, this.api, "listar");
      
    }

    buscarPorId(id:number):Observable<FormulaMedica>{
      return this.backendService.get(environment.apiUrlAuth, this.api, String (id));
    }

    crearFormulaMedica(solicitud:FormulaMedica):Observable<unknown>{
      return this.backendService.post(environment.apiUrlAuth, this.api, 'crear', solicitud)
    }

    actualizarFormulaMedica(solicitud: FormulaMedica): Observable<unknown> {
    return this.backendService.put(environment.apiUrlAuth, this.api, 'actualizar', solicitud);
  }
}
