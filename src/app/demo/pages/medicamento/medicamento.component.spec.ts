import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicamentoComponent } from './medicamento.component';
import { MedicamentoService } from './service/medicamento.service';
import { of } from 'rxjs';

describe('MedicamentoComponent', () => {
  let component: MedicamentoComponent;
  let fixture: ComponentFixture<MedicamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicamentoComponent],
      providers: [{ provide: MedicamentoService, useValue: { listarMedicamentos: () => of([]), crear: () => of({}), actualizar: () => of({}) } }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
