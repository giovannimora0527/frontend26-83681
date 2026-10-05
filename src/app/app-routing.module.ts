import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { UsuarioComponent } from './demo/pages/usuario/usuario.component';
import { MascotaComponent } from './demo/pages/mascota/mascota.component'
import { GestionComponent } from './demo/pages/gestion/gestion.component';


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
      { path: 'clientes', component: GestionComponent, data: { title: 'Clientes', managementResource: 'cliente' }},
      { path: 'citas', component: GestionComponent, data: { title: 'Citas', managementResource: 'cita' }},
      { path: 'historias-medicas', component: GestionComponent, data: { title: 'Historias médicas', managementResource: 'historia' }},
      { path: 'anotaciones-historia', component: GestionComponent, data: { title: 'Anotaciones de historia', managementResource: 'anotacion' }},
      { path: 'formulas-medicas', component: GestionComponent, data: { title: 'Fórmulas médicas', managementResource: 'formula' }},
      { path: 'medicos', component: GestionComponent, data: { title: 'Médicos', managementResource: 'medico' }},
      { path: 'especializaciones', component: GestionComponent, data: { title: 'Especializaciones', managementResource: 'especializacion' }},
      { path: 'razas', component: GestionComponent, data: { title: 'Razas', managementResource: 'raza' }},
      { path: 'medicamentos', component: GestionComponent, data: { title: 'Medicamentos', managementResource: 'medicamento' }}
     
    ]
  },
  { path: '**', redirectTo: 'inicio' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
