import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio-panel',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="card"><div class="card-body">
      <h2>Bienvenido a la clínica veterinaria</h2>
      <p>Selecciona un módulo para continuar.</p>
      <div class="d-flex flex-wrap gap-2">
        <a class="btn btn-outline-primary" routerLink="/inicio/citas">Gestión de Citas</a>
        <a class="btn btn-outline-primary" routerLink="/inicio/clientes">Gestión de Clientes</a>
        <a class="btn btn-outline-primary" routerLink="/inicio/medicamentos">Medicamentos</a>
        <a class="btn btn-outline-primary" routerLink="/inicio/usuarios">Usuarios</a>
        <a class="btn btn-outline-primary" routerLink="/inicio/despacho">Despacho</a>
      </div>
    </div></div>
  `
})
export class InicioPanelComponent {}
