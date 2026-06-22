import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularCourses } from './popular-courses';

describe('PopularCourses', () => {
  let component: PopularCourses;
  let fixture: ComponentFixture<PopularCourses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopularCourses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopularCourses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
