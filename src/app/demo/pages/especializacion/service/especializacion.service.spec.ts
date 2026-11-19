import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EspecializacionService } from './especializacion.service';

describe('EspecializacionService', () => {
  let service: EspecializacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(EspecializacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
