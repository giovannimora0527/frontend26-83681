import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { MedicosServiceService } from './medicos-service.service';

describe('MedicosServiceService', () => {
  let service: MedicosServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(MedicosServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
