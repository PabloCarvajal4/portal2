import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambiarFotoComponent } from './cambiar-foto.component';

describe('CambiarFotoComponent', () => {
  let component: CambiarFotoComponent;
  let fixture: ComponentFixture<CambiarFotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CambiarFotoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CambiarFotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
