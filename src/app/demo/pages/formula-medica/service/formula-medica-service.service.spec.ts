import { TestBed } from '@angular/core/testing';

import { FormulaMedicaServiceService } from './formula-medica-service.service';

describe('FormulaMedicaServiceService', () => {
  let service: FormulaMedicaServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormulaMedicaServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
