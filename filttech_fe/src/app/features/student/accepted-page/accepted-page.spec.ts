import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptedPage } from './accepted-page';

describe('AcceptedPage', () => {
  let component: AcceptedPage;
  let fixture: ComponentFixture<AcceptedPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcceptedPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcceptedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
