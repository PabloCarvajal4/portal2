import { TestBed } from '@angular/core/testing';

import { BoletaPagoService } from './boleta-pago.service';

describe('BoletaPagoService', () => {
  let service: BoletaPagoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoletaPagoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
