import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpertProfile } from './expert-profile';

describe('ExpertProfile', () => {
  let component: ExpertProfile;
  let fixture: ComponentFixture<ExpertProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpertProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpertProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
