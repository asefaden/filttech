import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
export interface ProfileDetailsRequest {
  name: string;
  username?: string;
  email?: string;
  phone: string;
  profession?: string;
  skills?: string[];
}
export interface ProfileDetailsResponse {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  username: string;
  rating: string;
  profession: string | null;
  skills: string[] | null;
  created_at: string;
  profile_photo_url: string;
  profile_image: string;
  roles: [
    {
      uuid: string;
      name: string;
    }
  ];
}
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

@Injectable({
  providedIn: 'root',
})
export class ManageProfile {
  private http = inject(HttpClient);

  updateProfileImage(image: File) {
    const formData = new FormData();
    formData.append('profile_image', image);
    return this.http.post('/update-profile-image', formData);
  }

  removeProfileImage() {
    return this.http.post('/remove-profile-image', {});
  }
  updateProfile(details: any) {
    return this.http.post('/update-profile', details);
  }

  myProfile() {
    return this.http.get<ProfileDetailsResponse>('/my-profile');
  }
  changePassword(payload: ChangePasswordRequest) {
    return this.http.post('/change-password', payload);
  }
}
