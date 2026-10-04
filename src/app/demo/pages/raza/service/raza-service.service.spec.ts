import { TestBed } from '@angular/core/testing';

import { RazaServiceService } from './raza-service.service';

describe('RazaServiceService', () => {
  let service: RazaServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RazaServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
