import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutTab } from './about-tab';

describe('AboutTab', () => {
  let component: AboutTab;
  let fixture: ComponentFixture<AboutTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
