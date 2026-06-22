import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsandResources } from './newsand-resources';

describe('NewsandResources', () => {
  let component: NewsandResources;
  let fixture: ComponentFixture<NewsandResources>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsandResources]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsandResources);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
