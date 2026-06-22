import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpertRequests } from './expert-requests';

describe('ExpertRequests', () => {
  let component: ExpertRequests;
  let fixture: ComponentFixture<ExpertRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpertRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpertRequests);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
