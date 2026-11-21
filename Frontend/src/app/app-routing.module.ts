import { InicioPanelComponent } from './demo/pages/inicio-panel/inicio-panel.component';
import { GestionLotesPanelComponent } from './demo/pages/gestion-lotes-panel/gestion-lotes-panel.component';
import { ExportacionInventarioPanelComponent } from './demo/pages/exportacion-inventario-panel/exportacion-inventario-panel.component';
import { EstadoInventarioPanelComponent } from './demo/pages/estado-inventario-panel/estado-inventario-panel.component';
import { AuditoriaDespachoPanelComponent } from './demo/pages/auditoria-despacho-panel/auditoria-despacho-panel.component';
import { ControlCitasPanelComponent } from './demo/pages/control-citas-panel/control-citas-panel.component';
import { RegistroPagosPanelComponent } from './demo/pages/registro-pagos-panel/registro-pagos-panel.component';
import { CrearFacturaPanelComponent } from './demo/pages/crear-factura-panel/crear-factura-panel.component';
import { ImportacionInventarioPanelComponent } from './demo/pages/importacion-inventario-panel/importacion-inventario-panel.component';
import { FinanzasPanelComponent } from './demo/pages/finanzas-panel/finanzas-panel.component';
import { AlertasInventarioPanelComponent } from './demo/pages/alertas-inventario-panel/alertas-inventario-panel.component';
import { AgendaMedicaPanelComponent } from './demo/pages/agenda-medica-panel/agenda-medica-panel.component';
import { DespachoPanelComponent } from './demo/pages/despacho-panel/despacho-panel.component';
import { ConciliacionPanelComponent } from './demo/pages/conciliacion-panel/conciliacion-panel.component';
import { DocumentosPanelComponent } from './demo/pages/documentos-panel/documentos-panel.component';
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
      { path: '', component: InicioPanelComponent, pathMatch: 'full', data: { title: 'Inicio' } },
      { path: 'gestion-lotes', component: GestionLotesPanelComponent, data: { title: 'Gestión de lotes' } },
      { path: 'exportacion-inventario', component: ExportacionInventarioPanelComponent, data: { title: 'Exportación de inventario' } },
      
      { path: 'importacion-inventario', component: ImportacionInventarioPanelComponent, data: { title: 'importacion-inventario' } },
      { path: 'crear-factura', component: CrearFacturaPanelComponent, data: { title: 'crear-factura' } },
      { path: 'registro-pagos', component: RegistroPagosPanelComponent, data: { title: 'registro-pagos' } },
      { path: 'usuarios', component: UsuarioComponent, data: { title: 'Usuarios' }},
      { path: 'mascotas', component: MascotaComponent, data: { title: 'Mascotas' }},
      { path: 'medicos', component: MedicoComponent, data: { title: 'Medicos' }},
      { path: 'documentos', component: DocumentosPanelComponent, data: { title: 'documentos' } },
      { path: 'conciliacion', component: ConciliacionPanelComponent, data: { title: 'conciliacion' } },
      { path: 'despacho', component: DespachoPanelComponent, data: { title: 'despacho' } },
      { path: 'agenda-medica', component: AgendaMedicaPanelComponent, data: { title: 'agenda-medica' } },
      { path: 'alertas-inventario', component: AlertasInventarioPanelComponent, data: { title: 'alertas-inventario' } },
      { path: 'finanzas', component: FinanzasPanelComponent, data: { title: 'finanzas' } },
      { path: 'control-citas', component: ControlCitasPanelComponent, data: { title: 'control-citas' } },
      { path: 'auditoria-despacho', component: AuditoriaDespachoPanelComponent, data: { title: 'auditoria-despacho' } },
      { path: 'estado-inventario', component: EstadoInventarioPanelComponent, data: { title: 'estado-inventario' } },
      /* Inserte nuevos menus aqui */    
      { path: 'formulas', component: FormulaMedicaComponent, data: { title: 'Formulas' }},
      { path: 'citas', component: CitaComponent, data: { title: 'Citas' }},
      { path: 'clientes', component: ClienteComponent, data: { title: 'Clientes' }},
      { path: 'medicamentos', component: MedicamentoComponent, data: { title: 'Medicamentos' }},
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
