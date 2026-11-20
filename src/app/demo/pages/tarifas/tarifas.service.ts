import { Injectable } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
export interface TarifaServicio { id?: number; especializacion?: { id: number; nombre: string }; especializacionId?: number; nombre: string; descripcion?: string; precio: number; ivaPorcentaje: number; activo: boolean; vigenteHasta?: string | null; }
export interface TarifaRq { especializacionId?: number | null; nombre: string; descripcion?: string; precio: number; ivaPorcentaje: number; activo: boolean; }
@Injectable({ providedIn: 'root' })
export class TarifasService {
  constructor(private readonly backend: BackendService) {}
  listar() { return this.backend.getPath<TarifaServicio[]>(environment.apiUrlAuth, 'tarifas/listar'); }
  historial() { return this.backend.getPath<TarifaServicio[]>(environment.apiUrlAuth, 'tarifas/historial'); }
  crear(request: TarifaRq) { return this.backend.postPath<TarifaServicio>(environment.apiUrlAuth, 'tarifas/crear', request); }
  actualizar(id: number, request: TarifaRq) { return this.backend.putPath<TarifaServicio>(environment.apiUrlAuth, `tarifas/${id}`, request); }
}
