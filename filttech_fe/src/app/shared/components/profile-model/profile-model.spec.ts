import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileModel } from './profile-model';

describe('ProfileModel', () => {
  let component: ProfileModel;
  let fixture: ComponentFixture<ProfileModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
