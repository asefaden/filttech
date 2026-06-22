import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Experts } from './experts';

describe('Experts', () => {
  let component: Experts;
  let fixture: ComponentFixture<Experts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Experts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Experts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
