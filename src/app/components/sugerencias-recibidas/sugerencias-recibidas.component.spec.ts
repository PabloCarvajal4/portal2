import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SugerenciasRecibidasComponent } from './sugerencias-recibidas.component';

describe('SugerenciasRecibidasComponent', () => {
  let component: SugerenciasRecibidasComponent;
  let fixture: ComponentFixture<SugerenciasRecibidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SugerenciasRecibidasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SugerenciasRecibidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
