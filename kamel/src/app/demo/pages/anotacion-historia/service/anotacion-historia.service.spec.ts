import { TestBed } from '@angular/core/testing';

import { AnotacionHistoriaService } from './anotacion-historia.service';

describe('AnotacionHistoriaService', () => {
  let service: AnotacionHistoriaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnotacionHistoriaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
