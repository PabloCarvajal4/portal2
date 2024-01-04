import { TestBed } from '@angular/core/testing';

import { EncriptacionService } from './encriptacion.service';

describe('EncriptacionService', () => {
  let service: EncriptacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncriptacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
