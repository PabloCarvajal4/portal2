import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DenunciasRegistradasComponent } from './denuncias-registradas.component';

describe('DenunciasRegistradasComponent', () => {
  let component: DenunciasRegistradasComponent;
  let fixture: ComponentFixture<DenunciasRegistradasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DenunciasRegistradasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DenunciasRegistradasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
