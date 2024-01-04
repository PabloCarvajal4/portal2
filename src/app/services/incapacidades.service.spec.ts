import { TestBed } from '@angular/core/testing';

import { IncapacidadesService } from './incapacidades.service';

describe('IncapacidadesService', () => {
  let service: IncapacidadesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncapacidadesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
