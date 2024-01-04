import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprobacionSolicitudesComponent } from './aprobacion-solicitudes.component';

describe('AprobacionSolicitudesComponent', () => {
  let component: AprobacionSolicitudesComponent;
  let fixture: ComponentFixture<AprobacionSolicitudesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AprobacionSolicitudesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AprobacionSolicitudesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
