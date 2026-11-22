import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { UsuarioComponent } from './demo/pages/usuario/usuario.component';
import { MascotaComponent } from './demo/pages/mascota/mascota.component';
import { MedicoComponent } from './demo/pages/medico/medico.component';
import { CitaComponent } from './demo/pages/cita/cita.component';
import { ClienteComponent } from './demo/pages/cliente/cliente.component';
import { InventarioComponent } from './demo/pages/inventario/inventario.component';
import { CargaInventarioComponent } from './demo/pages/carga-inventario/carga-inventario.component';
import { CalendarioMedicoComponent } from './demo/pages/calendario-medico/calendario-medico.component';
import { AtencionComponent } from './demo/pages/atencion/atencion.component';
import { TarifasComponent } from './demo/pages/tarifas/tarifas.component';
import { FacturasComponent } from './demo/pages/facturas/facturas.component';
import { DespachoComponent } from './demo/pages/despacho/despacho.component';
import { HistorialDespachosComponent } from './demo/pages/historial-despachos/historial-despachos.component';
import { ReportesComponent } from './demo/pages/reportes/reportes.component';
import { HistoriaComponent } from './demo/pages/historia/historia.component';
import { EspecializacionComponent } from './demo/pages/especializacion/especializacion.component';
import { LoginComponent } from './demo/pages/login/login.component';
import { authGuard } from './guards/auth.guard';


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
      { path: 'usuarios', component: UsuarioComponent, data: { title: 'Usuarios' }},
      { path: 'mascotas', component: MascotaComponent, data: { title: 'Mascotas' }},
      { path: 'medicos', component: MedicoComponent, data: { title: 'Medicos' }},
      /* Inserte nuevos menus aqui */    
      { path: 'citas', component: CitaComponent, data: { title: 'Citas' }},
      { path: 'clientes', component: ClienteComponent, data: { title: 'Clientes' }},
      { path: 'medicamentos', component: InventarioComponent, data: { title: 'Inventario' }},
      { path: 'carga-inventario', component: CargaInventarioComponent, data: { title: 'Carga masiva de inventario' }},
      { path: 'calendario-medico', component: CalendarioMedicoComponent, data: { title: 'Mi calendario' }},
      { path: 'atencion', component: AtencionComponent, data: { title: 'Atención médica' }},
      { path: 'atencion/:id', component: AtencionComponent, data: { title: 'Atención médica' }},
      { path: 'tarifas', component: TarifasComponent, data: { title: 'Tarifas y servicios' }},
      { path: 'facturas', component: FacturasComponent, data: { title: 'Facturación' }},
      { path: 'reportes', component: ReportesComponent, data: { title: 'Reportes' }},
      { path: 'despacho', component: DespachoComponent, data: { title: 'Despacho de medicamentos' }},
      { path: 'historial-despachos', component: HistorialDespachosComponent, data: { title: 'Historial de despachos' }},
      { path: 'historias', component: HistoriaComponent, data: { title: 'Historias' }},
      { path: 'especializaciones', component: EspecializacionComponent, data: { title: 'Especializaciones' }}
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
