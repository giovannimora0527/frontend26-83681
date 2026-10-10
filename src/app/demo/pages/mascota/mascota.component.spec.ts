import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MascotaComponent } from './mascota.component';
import { MascotaServiceService } from './service/mascota-service.service';

describe('MascotaComponent', () => {
  let component: MascotaComponent;
  let fixture: ComponentFixture<MascotaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MascotaComponent],
      providers: [{
        provide: MascotaServiceService,
        useValue: {
          getMascotas: () => of([]),
          getRazas: () => of([]),
          getClientes: () => of([]),
          guardarMascota: () => of({ message: 'ok' }),
          actualizarMascota: () => of({ message: 'ok' })
        }
      }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MascotaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
