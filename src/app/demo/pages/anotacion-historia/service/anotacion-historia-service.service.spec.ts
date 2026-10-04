import { TestBed } from '@angular/core/testing';

import { AnotacionHistoriaServiceService } from './anotacion-historia-service.service';

describe('AnotacionHistoriaServiceService', () => {
  let service: AnotacionHistoriaServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnotacionHistoriaServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
