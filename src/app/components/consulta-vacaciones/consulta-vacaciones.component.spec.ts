import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaVacacionesComponent } from './consulta-vacaciones.component';

describe('ConsultaVacacionesComponent', () => {
  let component: ConsultaVacacionesComponent;
  let fixture: ComponentFixture<ConsultaVacacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultaVacacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaVacacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
