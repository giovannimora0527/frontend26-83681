import { TestBed } from '@angular/core/testing';

import { EspecializacionServiceService } from './especializacion-service.service';

describe('EspecializacionServiceService', () => {
  let service: EspecializacionServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EspecializacionServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
