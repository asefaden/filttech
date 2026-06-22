import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Whychooseus } from './whychooseus';

describe('Whychooseus', () => {
  let component: Whychooseus;
  let fixture: ComponentFixture<Whychooseus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Whychooseus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Whychooseus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
