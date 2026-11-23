import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnotacionHistoriaComponent } from './anotacion-historia.component';

describe('AnotacionHistoriaComponent', () => {
  let component: AnotacionHistoriaComponent;
  let fixture: ComponentFixture<AnotacionHistoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnotacionHistoriaComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnotacionHistoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
