import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeDdhhComponent } from './home-ddhh.component';

describe('HomeDdhhComponent', () => {
  let component: HomeDdhhComponent;
  let fixture: ComponentFixture<HomeDdhhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeDdhhComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeDdhhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
