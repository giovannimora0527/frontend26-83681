import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { UsuarioComponent } from './demo/pages/usuario/usuario.component';
import { MascotaComponent } from './demo/pages/mascota/mascota.component'

import { RazaComponent } from './demo/pages/raza/raza.component';
import { ClienteComponent } from './demo/pages/cliente/cliente.component';
import { EspecializacionComponent } from './demo/pages/especializacion/especializacion.component';
import { MedicosComponent } from './demo/pages/medicos/medicos.component';
import { CitaComponent } from './demo/pages/cita/cita.component';
import { MedicamentoComponent } from './demo/pages/medicamento/medicamento.component';
import { FormulaMedicaComponent } from './demo/pages/formula-medica/formula-medica.component';
import { HistoriaMedicaComponent } from './demo/pages/historia-medica/historia-medica.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },  
  {
    path: 'inicio',
    component: AdminComponent,
    data: { title: 'Inicio' },
    children: [      
      { path: 'usuarios', component: UsuarioComponent, data: { title: 'Usuarios' }},
      { path: 'mascotas', component: MascotaComponent, data: { title: 'Mascotas' }},
      { path: 'razas', component: RazaComponent, data: { title: 'Razas' } },
      { path: 'clientes', component: ClienteComponent, data: { title: 'Clientes' } },
      { path: 'especializaciones', component: EspecializacionComponent, data: { title: 'Especializaciones' } },
      { path: 'medicos', component: MedicosComponent, data: { title: 'Médicos' } },
      { path: 'citas', component: CitaComponent, data: { title: 'Citas' } },
      { path: 'medicamentos', component: MedicamentoComponent, data: { title: 'Medicamentos' } },
      { path: 'formulas-medicas', component: FormulaMedicaComponent, data: { title: 'Fórmulas médicas' } },
      { path: 'historias-medicas', component: HistoriaMedicaComponent, data: { title: 'Historias clínicas' } }
    ]
  },
  { path: '**', redirectTo: 'inicio' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
