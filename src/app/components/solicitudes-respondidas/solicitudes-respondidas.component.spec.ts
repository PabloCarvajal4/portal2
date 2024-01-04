import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesRespondidasComponent } from './solicitudes-respondidas.component';

describe('SolicitudesRespondidasComponent', () => {
  let component: SolicitudesRespondidasComponent;
  let fixture: ComponentFixture<SolicitudesRespondidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolicitudesRespondidasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudesRespondidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
