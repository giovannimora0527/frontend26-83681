import { TestBed } from '@angular/core/testing';

import { CitaServiceService } from './cita-service.service';

describe('CitaServiceService', () => {
  let service: CitaServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CitaServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
