import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { UsuarioComponent } from './demo/pages/usuario/usuario.component';
import { MascotaComponent } from './demo/pages/mascota/mascota.component';
import { MedicoComponent } from './demo/pages/medico/medico.component';
import { FormulaMedicaComponent } from './demo/pages/formula-medica/formula-medica.component';
import { CitaComponent } from './demo/pages/cita/cita.component';
import { ClienteComponent } from './demo/pages/cliente/cliente.component';
import { MedicamentoComponent } from './demo/pages/medicamento/medicamento.component';
import { HistoriaComponent } from './demo/pages/historia/historia.component';
import { EspecializacionComponent } from './demo/pages/especializacion/especializacion.component';
import { LoginComponent } from './demo/pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { InventarioComponent } from './demo/pages/inventario/inventario.component';
import { DespachoComponent } from './demo/pages/despacho/despacho.component';
import { FacturacionComponent } from './demo/pages/facturacion/facturacion.component';
import { ReportesComponent } from './demo/pages/reportes/reportes.component';
import { AgendaComponent } from './demo/pages/agenda/agenda.component';

const GESTION_CLINICA = ['ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA'];


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  { path: 'login', component: LoginComponent, data: { title: 'Login' } },
  {
    path: 'inicio',
    component: AdminComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    data: { title: 'Inicio' },
    children: [      
      // Los roles replican las reglas de SecurityConfig del backend (el backend sigue siendo quien valida).
      { path: 'usuarios', component: UsuarioComponent, canActivate: [roleGuard], data: { title: 'Usuarios', roles: ['ADMINISTRADOR'] }},
      { path: 'mascotas', component: MascotaComponent, canActivate: [roleGuard], data: { title: 'Mascotas', roles: GESTION_CLINICA }},
      { path: 'medicos', component: MedicoComponent, canActivate: [roleGuard], data: { title: 'Medicos', roles: GESTION_CLINICA }},
      /* Inserte nuevos menus aqui */
      { path: 'agenda', component: AgendaComponent, canActivate: [roleGuard], data: { title: 'Agenda médica', roles: ['VETERINARIO'] }},
      { path: 'formulas', component: FormulaMedicaComponent, canActivate: [roleGuard], data: { title: 'Formulas', roles: ['ADMINISTRADOR', 'VETERINARIO'] }},
      { path: 'citas', component: CitaComponent, canActivate: [roleGuard], data: { title: 'Citas', roles: ['ADMINISTRADOR', 'RECEPCIONISTA'] }},
      { path: 'clientes', component: ClienteComponent, canActivate: [roleGuard], data: { title: 'Clientes', roles: GESTION_CLINICA }},
      { path: 'medicamentos', component: MedicamentoComponent, canActivate: [roleGuard], data: { title: 'Medicamentos', roles: ['ADMINISTRADOR', 'VETERINARIO'] }},
      { path: 'historias', component: HistoriaComponent, canActivate: [roleGuard], data: { title: 'Historias', roles: ['ADMINISTRADOR', 'VETERINARIO'] }},
      { path: 'especializaciones', component: EspecializacionComponent, canActivate: [roleGuard], data: { title: 'Especializaciones', roles: GESTION_CLINICA }},
      { path: 'inventario', component: InventarioComponent, canActivate: [roleGuard], data: { title: 'Inventario', roles: ['ADMINISTRADOR', 'VETERINARIO', 'DESPACHO_MEDICO'] } },
      { path: 'despachos', component: DespachoComponent, canActivate: [roleGuard], data: { title: 'Despacho médico', roles: ['ADMINISTRADOR', 'DESPACHO_MEDICO'] } },
      { path: 'facturacion', component: FacturacionComponent, canActivate: [roleGuard], data: { title: 'Facturación', roles: ['ADMINISTRADOR', 'RECEPCIONISTA'] } },
      { path: 'reportes', component: ReportesComponent, canActivate: [roleGuard], data: { title: 'Reportes', roles: ['ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA'] } }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
