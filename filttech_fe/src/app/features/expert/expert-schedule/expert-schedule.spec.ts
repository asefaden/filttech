import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpertSchedule } from './expert-schedule';

describe('ExpertSchedule', () => {
  let component: ExpertSchedule;
  let fixture: ComponentFixture<ExpertSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpertSchedule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpertSchedule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
