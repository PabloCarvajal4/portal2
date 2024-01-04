import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstanciasGeneradasComponent } from './constancias-generadas.component';

describe('ConstanciasGeneradasComponent', () => {
  let component: ConstanciasGeneradasComponent;
  let fixture: ComponentFixture<ConstanciasGeneradasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConstanciasGeneradasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstanciasGeneradasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
