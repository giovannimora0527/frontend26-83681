import { ComponentFixture, TestBed } from '@angular/core/testing';
<<<<<<< HEAD
import { of } from 'rxjs';
=======
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3

import { UsuarioComponent } from './usuario.component';

describe('UsuarioComponent', () => {
  let component: UsuarioComponent;
  let fixture: ComponentFixture<UsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
<<<<<<< HEAD
      imports: [UsuarioComponent],
      providers: [{
        provide: UsuarioService,
        useValue: {
          getPerfiles: () => of([]),
          getUsuarios: () => of([])
        }
      }]
=======
      imports: [UsuarioComponent]
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
