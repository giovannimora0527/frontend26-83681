import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  constructor(private readonly backend: BackendService) {}
  consultar(tipo: string, params?: HttpParams) { return this.backend.getPath<unknown>(environment.apiUrlAuth, `reportes/${tipo}`, params); }
  excel(tipo: string, params?: HttpParams) { return this.backend.getBlob(environment.apiUrlAuth, `reportes/${tipo}.xlsx`, params); }
  pdf(tipo: string, params?: HttpParams) { return this.backend.getBlob(environment.apiUrlAuth, `reportes/${tipo}.pdf`, params); }
}
