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
import { menuGuard } from './guards/menu.guard';
import { DespachoComponent } from './demo/pages/despacho/despacho.component';
import { ReportesComponent } from './demo/pages/reportes/reportes.component';
import { FacturacionComponent } from './demo/pages/facturacion/facturacion.component';
import { AtencionComponent } from './demo/pages/atencion/atencion.component';
import { TarifasComponent } from './demo/pages/tarifas/tarifas.component';


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
    canActivateChild: [authGuard, menuGuard],
    data: { title: 'Inicio' },
    children: [      
      { path: 'usuarios', component: UsuarioComponent, data: { title: 'Usuarios', menuCode: 'usuarios', roles: ['ADMINISTRADOR'] }},
      { path: 'mascotas', component: MascotaComponent, data: { title: 'Mascotas', menuCode: 'mascotas' }},
      { path: 'medicos', component: MedicoComponent, data: { title: 'Medicos', menuCode: 'medicos', roles: ['ADMINISTRADOR'] }},
      /* Inserte nuevos menus aqui */    
      { path: 'formulas', component: FormulaMedicaComponent, data: { title: 'Formulas', menuCode: 'formulas', roles: ['ADMINISTRADOR', 'RECEPCION', 'MEDICO'] }},
      { path: 'citas', component: CitaComponent, data: { title: 'Citas', menuCode: 'cita' }},
      { path: 'clientes', component: ClienteComponent, data: { title: 'Clientes', menuCode: 'clientes', roles: ['ADMINISTRADOR', 'RECEPCION'] }},
      { path: 'medicamentos', component: MedicamentoComponent, data: { title: 'Medicamentos', menuCode: 'medicamentos' }},
      { path: 'historias', component: HistoriaComponent, data: { title: 'Historias', menuCode: 'historias', roles: ['ADMINISTRADOR', 'RECEPCION', 'MEDICO'] }},
      { path: 'especializaciones', component: EspecializacionComponent, data: { title: 'Especializaciones', menuCode: 'especializaciones', roles: ['ADMINISTRADOR', 'RECEPCION', 'MEDICO'] }},
      { path: 'despacho', component: DespachoComponent, data: { title: 'Despacho', menuCode: 'despacho', roles: ['DESPACHO_MEDICO'] }},
      { path: 'reportes', component: ReportesComponent, data: { title: 'Reportes', menuCode: 'reportes', roles: ['ADMINISTRADOR'] }},
      { path: 'facturacion', component: FacturacionComponent, data: { title: 'Facturación', menuCode: 'facturacion', roles: ['ADMINISTRADOR', 'RECEPCION'] }},
      { path: 'atencion', component: AtencionComponent, data: { title: 'Atención médica', menuCode: 'atencion', roles: ['ADMINISTRADOR', 'MEDICO'] }},
      { path: 'tarifas', component: TarifasComponent, data: { title: 'Tarifas', menuCode: 'tarifas', roles: ['ADMINISTRADOR'] }}
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
