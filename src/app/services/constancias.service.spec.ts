import { TestBed } from '@angular/core/testing';

import { ConstanciasService } from './constancias.service';

describe('ConstanciasService', () => {
  let service: ConstanciasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConstanciasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
