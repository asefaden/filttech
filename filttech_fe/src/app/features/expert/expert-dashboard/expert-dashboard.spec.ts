import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpertDashboard } from './expert-dashboard';

describe('ExpertDashboard', () => {
  let component: ExpertDashboard;
  let fixture: ComponentFixture<ExpertDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpertDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpertDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
