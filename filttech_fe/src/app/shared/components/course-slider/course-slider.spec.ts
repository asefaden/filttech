import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseSlider } from './course-slider';

describe('CourseSlider', () => {
  let component: CourseSlider;
  let fixture: ComponentFixture<CourseSlider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseSlider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseSlider);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
