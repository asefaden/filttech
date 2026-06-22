import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentFeedbacks } from './student-feedbacks';

describe('StudentFeedbacks', () => {
  let component: StudentFeedbacks;
  let fixture: ComponentFixture<StudentFeedbacks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentFeedbacks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentFeedbacks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
