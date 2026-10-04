import { TestBed } from '@angular/core/testing';

import { HistoriaMedicaServiceService } from './historia-medica-service.service';

describe('HistoriaMedicaServiceService', () => {
  let service: HistoriaMedicaServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoriaMedicaServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
