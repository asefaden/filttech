import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarRatingInput } from './star-rating-input';

describe('StarRatingInput', () => {
  let component: StarRatingInput;
  let fixture: ComponentFixture<StarRatingInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarRatingInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StarRatingInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
