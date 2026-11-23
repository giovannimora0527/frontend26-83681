import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { UsuarioComponent } from './demo/pages/usuario/usuario.component';
import { MascotaComponent } from './demo/pages/mascota/mascota.component';
<<<<<<< HEAD
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
=======
import { ClienteComponent } from './demo/pages/cliente/cliente.component';
import { RazaComponent } from './demo/pages/raza/raza.component';
import { MedicosComponent } from './demo/pages/medicos/medicos.component';
import { EspecializacionComponent } from './demo/pages/especializacion/especializacion.component';
import { CitaComponent } from './demo/pages/cita/cita.component';
import { HistoriaMedicaComponent } from './demo/pages/historia-medica/historia-medica.component';
import { AnotacionHistoriaComponent } from './demo/pages/anotacion-historia/anotacion-historia.component';
import { FormulaMedicaComponent } from './demo/pages/formula-medica/formula-medica.component';
import { MedicamentoComponent } from './demo/pages/medicamento/medicamento.component';
import { SessionComponent } from './demo/pages/session/session.component';
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
<<<<<<< HEAD
  { path: 'login', component: LoginComponent, data: { title: 'Login' } },
=======
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
  {
    path: 'inicio',
    component: AdminComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    data: { title: 'Inicio' },
<<<<<<< HEAD
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
=======
    children: [
      { path: 'usuarios', component: UsuarioComponent, data: { title: 'Usuarios' }},
      { path: 'mascotas', component: MascotaComponent, data: { title: 'Mascotas' }},
      { path: 'clientes', component: ClienteComponent, data: { title: 'Clientes' }},
      { path: 'razas', component: RazaComponent, data: { title: 'Razas' }},
      { path: 'medicos', component: MedicosComponent, data: { title: 'Médicos' }},
      { path: 'especializaciones', component: EspecializacionComponent, data: { title: 'Especializaciones' }},
      { path: 'citas', component: CitaComponent, data: { title: 'Citas' }},
      { path: 'historias-medicas', component: HistoriaMedicaComponent, data: { title: 'Historias Médicas' }},
      { path: 'anotaciones-historias', component: AnotacionHistoriaComponent, data: { title: 'Anotaciones de Historia' }},
      { path: 'formulas-medicas', component: FormulaMedicaComponent, data: { title: 'Fórmulas Médicas' }},
      { path: 'medicamentos', component: MedicamentoComponent, data: { title: 'Medicamentos' }},
      { path: 'sesiones', component: SessionComponent, data: { title: 'Sesiones' }}
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
