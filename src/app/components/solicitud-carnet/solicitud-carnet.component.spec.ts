import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudCarnetComponent } from './solicitud-carnet.component';

describe('SolicitudCarnetComponent', () => {
  let component: SolicitudCarnetComponent;
  let fixture: ComponentFixture<SolicitudCarnetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolicitudCarnetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudCarnetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
