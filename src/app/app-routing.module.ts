import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { UsuarioComponent } from './demo/pages/usuario/usuario.component';
import { MascotaComponent } from './demo/pages/mascota/mascota.component'
import { ClienteComponent } from './demo/pages/cliente/cliente.component';
import { MedicosComponent } from './demo/pages/medicos/medicos.component';
import { CitaComponent } from './demo/pages/cita/cita.component';
import { HistoriaMedicaComponent } from './demo/pages/historia-medica/historia-medica.component';
import { AnotacionHistoriaComponent } from './demo/pages/anotacion-historia/anotacion-historia.component';
import { FormulaMedicaComponent } from './demo/pages/formula-medica/formula-medica.component';
import { RazaComponent } from './demo/pages/raza/raza.component';
import { EspecializacionComponent } from './demo/pages/especializacion/especializacion.component';


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
      { path: 'clientes', component: ClienteComponent, data: { title: 'Clientes' }},
      { path: 'medicos', component: MedicosComponent, data: { title: 'Médicos' }},
      { path: 'citas', component: CitaComponent, data: { title: 'Citas Médicas' }},
      { path: 'historias', component: HistoriaMedicaComponent, data: { title: 'Historia Clínica' }},
      { path: 'anotaciones', component: AnotacionHistoriaComponent, data: { title: 'Anotaciones de Historia' }},
      { path: 'formulas', component: FormulaMedicaComponent, data: { title: 'Fórmulas Médicas' }},
      { path: 'razas', component: RazaComponent, data: { title: 'Razas' }},
      { path: 'especializaciones', component: EspecializacionComponent, data: { title: 'Especializaciones' }}

    ]
  },
  { path: '**', redirectTo: 'inicio' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
