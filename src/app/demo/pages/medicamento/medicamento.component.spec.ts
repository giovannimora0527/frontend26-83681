import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicamentoComponent } from './medicamento.component';

describe('MedicamentoComponent', () => {
  let component: MedicamentoComponent;
  let fixture: ComponentFixture<MedicamentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicamentoComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
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
