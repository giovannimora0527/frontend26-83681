import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { UsuarioComponent } from './demo/pages/usuario/usuario.component';
import { MascotaComponent } from './demo/pages/mascota/mascota.component'
import { ClienteComponent } from './demo/pages/cliente/cliente.component';
import { MedicosComponent } from './demo/pages/medicos/medicos.component';
import { VeterinariaComponent } from './demo/pages/veterinaria/veterinaria.component';
import { RazaComponent } from './demo/pages/raza/raza.component';
import { EspecializacionComponent } from './demo/pages/especializacion/especializacion.component';
import { MedicamentoComponent } from './demo/pages/medicamento/medicamento.component';
import { CitaComponent } from './demo/pages/cita/cita.component';
import { HistoriaMedicaComponent } from './demo/pages/historia-medica/historia-medica.component';
import { FormulaMedicaComponent } from './demo/pages/formula-medica/formula-medica.component';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'veterinaria',
    pathMatch: 'full'
  },
  // Pagina publica de la veterinaria (fuera del panel administrativo).
  { path: 'veterinaria', component: VeterinariaComponent, data: { title: 'Veterinaria' } },
  {
    path: 'inicio',
    component: AdminComponent,
    data: { title: 'Inicio' },
    children: [
      { path: 'usuarios', component: UsuarioComponent, data: { title: 'Usuarios' }},
      { path: 'mascotas', component: MascotaComponent, data: { title: 'Mascotas' }},
      { path: 'clientes', component: ClienteComponent, data: { title: 'Clientes' }},
      { path: 'razas', component: RazaComponent, data: { title: 'Razas' }},
      { path: 'citas', component: CitaComponent, data: { title: 'Citas' }},
      { path: 'historias', component: HistoriaMedicaComponent, data: { title: 'Historias médicas' }},
      { path: 'formulas', component: FormulaMedicaComponent, data: { title: 'Fórmulas médicas' }},
      { path: 'medicos', component: MedicosComponent, data: { title: 'Médicos' }},
      { path: 'especializaciones', component: EspecializacionComponent, data: { title: 'Especializaciones' }},
      { path: 'medicamentos', component: MedicamentoComponent, data: { title: 'Medicamentos' }}

    ]
  },
  { path: '**', redirectTo: 'veterinaria' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
