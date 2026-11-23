import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
<<<<<<< HEAD:src/app/demo/pages/login/login.component.spec.ts
      imports: [LoginComponent]
=======
      imports: [HistoriaMedicaComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3:src/app/demo/pages/historia-medica/historia-medica.component.spec.ts
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
