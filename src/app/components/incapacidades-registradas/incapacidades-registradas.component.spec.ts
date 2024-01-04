import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncapacidadesRegistradasComponent } from './incapacidades-registradas.component';

describe('IncapacidadesRegistradasComponent', () => {
  let component: IncapacidadesRegistradasComponent;
  let fixture: ComponentFixture<IncapacidadesRegistradasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncapacidadesRegistradasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncapacidadesRegistradasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
