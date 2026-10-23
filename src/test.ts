import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

import './app/demo/pages/cliente/cliente.component.spec';
import './app/demo/pages/cliente/service/cliente.service.spec';
import './app/demo/pages/mascota/mascota.component.spec';
import './app/demo/pages/mascota/service/mascota-service.service.spec';
import './app/demo/pages/medicos/medicos.component.spec';
import './app/demo/pages/medicos/service/medicos-service.service.spec';
import './app/demo/pages/usuario/usuario.component.spec';
import './app/demo/pages/usuario/service/usuario.service.spec';

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
