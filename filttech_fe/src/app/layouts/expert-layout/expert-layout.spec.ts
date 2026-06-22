import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpertLayout } from './expert-layout';

describe('ExpertLayout', () => {
  let component: ExpertLayout;
  let fixture: ComponentFixture<ExpertLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpertLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpertLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
