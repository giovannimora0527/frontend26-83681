import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Keep the test entry compatible with the Angular 19 Karma builder, which no longer
// exposes webpack's legacy require.context runtime helper.
import './app/utils/jwt.util.spec';
import './app/theme/layout/admin/navigation/navigation.spec';
import './app/demo/pages/anotacion-historia/anotacion-historia.component.spec';
import './app/demo/pages/anotacion-historia/service/anotacion-historia.service.spec';
import './app/demo/pages/cita/cita.component.spec';
import './app/demo/pages/cita/service/cita.service.spec';
import './app/demo/pages/cliente/cliente.component.spec';
import './app/demo/pages/cliente/service/cliente.service.spec';
import './app/demo/pages/especializacion/especializacion.component.spec';
import './app/demo/pages/especializacion/service/especializacion.service.spec';
import './app/demo/pages/formula-medica/formula-medica.component.spec';
import './app/demo/pages/formula-medica/service/formula-medica.service.spec';
import './app/demo/pages/formula-medica/service/formula.service.spec';
import './app/demo/pages/historia/historia.component.spec';
import './app/demo/pages/historia/service/anotacion-historia.service.spec';
import './app/demo/pages/historia/service/historia.service.spec';
import './app/demo/pages/login/login.component.spec';
import './app/demo/pages/login/service/auth.service.spec';
import './app/demo/pages/mascota/mascota.component.spec';
import './app/demo/pages/mascota/service/mascota.service.spec';
import './app/demo/pages/mascota/service/raza.service.spec';
import './app/demo/pages/medicamento/medicamento.component.spec';
import './app/demo/pages/medicamento/service/medicamento.service.spec';
import './app/demo/pages/medico/medico.component.spec';
import './app/demo/pages/medico/service/medico.service.spec';
import './app/demo/pages/medico/service/medico-service.service.spec';
import './app/demo/pages/medicos/medicos.component.spec';
import './app/demo/pages/medicos/service/medicos-service.service.spec';
import './app/demo/pages/raza/raza.component.spec';
import './app/demo/pages/raza/service/raza.service.spec';
import './app/demo/pages/usuario/usuario.component.spec';
import './app/demo/pages/usuario/service/usuario.service.spec';
