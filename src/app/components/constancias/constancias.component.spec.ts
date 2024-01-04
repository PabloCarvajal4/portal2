import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstanciasComponent } from './constancias.component';

describe('ConstanciasComponent', () => {
  let component: ConstanciasComponent;
  let fixture: ComponentFixture<ConstanciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConstanciasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstanciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
