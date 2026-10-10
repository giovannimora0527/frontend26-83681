import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UsuarioComponent } from './usuario.component';
import { UsuarioService } from './service/usuario.service';

describe('UsuarioComponent', () => {
  let component: UsuarioComponent;
  let fixture: ComponentFixture<UsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioComponent],
      providers: [{
        provide: UsuarioService,
        useValue: {
          getUsuarios: () => of([{
            id: 1,
            username: 'prueba',
            email: 'prueba@example.com',
            rol: 'ADMIN',
            fechaCreacion: '2025-01-01T10:00:00',
            activo: true
          }])
        }
      }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and filter the user data', () => {
    expect(component.listUsuarios.length).toBe(1);
    expect(component.usuariosPaginados[0].username).toBe('prueba');
    component.terminoBusqueda = 'admin';
    expect(component.usuariosFiltrados.length).toBe(1);
    component.terminoBusqueda = 'not-found';
    expect(component.usuariosFiltrados.length).toBe(0);
  });
});
