import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { MascotaServiceService } from './mascota-service.service';

describe('MascotaServiceService', () => {
  let service: MascotaServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(MascotaServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
