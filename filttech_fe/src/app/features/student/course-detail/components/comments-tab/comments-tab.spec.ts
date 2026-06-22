import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsTab } from './comments-tab';

describe('CommentsTab', () => {
  let component: CommentsTab;
  let fixture: ComponentFixture<CommentsTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentsTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentsTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
