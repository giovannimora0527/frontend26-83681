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
import { clinicaGuard } from './guards/clinica.guard';
import { perfilesClinica } from './demo/pages/gestion-clinica/clinica-api.service';

const personalAdministrativo = [...perfilesClinica.admin, ...perfilesClinica.recepcion];

/** Define las rutas de la aplicación y qué pantalla se abre en cada una. */
export const routes: Routes = [
  {
    path: '',
    // La ruta principal abre el inicio; el guard redirige al login si no hay sesión.
    redirectTo: 'inicio',
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
      { path: 'formulas', component: FormulaMedicaComponent, data: { title: 'Formulas' }},
      { path: 'citas', component: CitaComponent, canActivate: [clinicaGuard],
        data: { title: 'Citas', perfiles: personalAdministrativo, agendaMedica: true } },
      { path: 'calendario-medico', canActivate: [clinicaGuard],
        data: { title: 'Mi agenda', perfiles: perfilesClinica.medicos },
        loadComponent: () => import('./demo/pages/gestion-clinica/agenda.component').then(m => m.AgendaComponent) },
      { path: 'atencion-medica/:id', canActivate: [clinicaGuard],
        data: { title: 'Atención médica', perfiles: perfilesClinica.medicos },
        loadComponent: () => import('./demo/pages/gestion-clinica/atencion.component').then(m => m.AtencionComponent) },
      { path: 'atencion-medica', redirectTo: 'calendario-medico', pathMatch: 'full' },
      { path: 'tarifas', canActivate: [clinicaGuard],
        data: { title: 'Especialidades y tarifas', perfiles: perfilesClinica.admin },
        loadComponent: () => import('./demo/pages/gestion-clinica/tarifas.component').then(m => m.TarifasComponent) },
      { path: 'facturacion', canActivate: [clinicaGuard],
        data: { title: 'Facturación y pagos', perfiles: personalAdministrativo },
        loadComponent: () => import('./demo/pages/gestion-clinica/facturacion.component').then(m => m.FacturacionComponent) },
      { path: 'reportes', canActivate: [clinicaGuard],
        data: { title: 'Reportes', perfiles: personalAdministrativo },
        loadComponent: () => import('./demo/pages/gestion-clinica/reportes.component').then(m => m.ReportesComponent) },
      { path: 'clientes', component: ClienteComponent, data: { title: 'Clientes' }},
      { path: 'medicamentos', component: MedicamentoComponent, data: { title: 'Medicamentos' }},
      { path: 'historias', component: HistoriaComponent, data: { title: 'Historias' }},
      { path: 'especializaciones', component: EspecializacionComponent, data: { title: 'Especializaciones' }}
    ]
  },
  { path: '**', redirectTo: 'login' }
];

/** Configura las rutas de la aplicación y sus controles de acceso. */
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
