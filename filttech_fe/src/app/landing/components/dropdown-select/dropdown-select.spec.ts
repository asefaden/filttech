import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownSelect } from './dropdown-select';

describe('DropdownSelect', () => {
  let component: DropdownSelect;
  let fixture: ComponentFixture<DropdownSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownSelect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
