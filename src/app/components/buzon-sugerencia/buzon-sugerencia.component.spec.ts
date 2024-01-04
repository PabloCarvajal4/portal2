import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuzonSugerenciaComponent } from './buzon-sugerencia.component';

describe('BuzonSugerenciaComponent', () => {
  let component: BuzonSugerenciaComponent;
  let fixture: ComponentFixture<BuzonSugerenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuzonSugerenciaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuzonSugerenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
