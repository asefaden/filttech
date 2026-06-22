import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpertRating } from './expert-rating';

describe('ExpertRating', () => {
  let component: ExpertRating;
  let fixture: ComponentFixture<ExpertRating>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpertRating]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpertRating);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
