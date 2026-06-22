import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from 'src/app/core/services/auth';
import { ManageProfile } from 'src/app/core/services/manage-profile';
import { AlertService } from 'src/app/shared/alert/alert.service';
import { formatEthiopianPhoneWithCountryCode } from 'src/app/shared/util/phone.util';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private authService = inject(Auth);
  private profileService = inject(ManageProfile);
  private alertService = inject(AlertService);

  phoneNumber = signal('');
  username = signal('');
  profileImage = computed(() => {
    const profile = this.authService.profile();
    if (!profile) return null;
    const profilePhotoUrl = profile['profile_photo_url'];
    const profileImg = profile['profile_image'];
    return (profileImg || profilePhotoUrl || null) as string | null;
  });

  avatarPreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  isUploadingImage = signal(false);
  isSaving = signal(false);
  isLoading = signal(true);

  isEditingName = signal(false);
  tempUsername = signal('');

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading.set(true);
    this.profileService.myProfile().subscribe({
      next: (profile) => {
        this.username.set(profile.username || '');
        this.phoneNumber.set(profile.phone_number || '');
        this.authService.setProfile(profile);
        this.isLoading.set(false);
      },
      error: () => {
        this.alertService.error('Error', 'Failed to load profile');
        this.isLoading.set(false);
      },
    });
  }

  toggleEditName() {
    if (this.isEditingName()) {
      // Save
      this.saveProfile();
    } else {
      // Start editing
      this.tempUsername.set(this.username());
      this.isEditingName.set(true);
    }
  }

  saveProfile() {
    if (!this.tempUsername().trim()) {
      this.alertService.validationError('Username');
      return;
    }

    this.isSaving.set(true);
    const normalizedPhone = formatEthiopianPhoneWithCountryCode(this.phoneNumber());

    this.profileService
      .updateProfile({
        username: this.tempUsername().trim(),
        phone: normalizedPhone || this.phoneNumber(),
      })
      .subscribe({
        next: () => {
          this.username.set(this.tempUsername());
          this.isEditingName.set(false);
          this.isSaving.set(false);
          this.alertService.success('Success', 'Profile updated successfully');
          this.loadProfile();
        },
        error: (error) => {
          this.isSaving.set(false);
          this.alertService.submissionError(
            'Profile update',
            error?.error?.message || 'Failed to update profile'
          );
        },
      });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.alertService.error('Invalid File', 'Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.alertService.error('File Too Large', 'Image size must be less than 5MB');
        return;
      }

      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('avatarInput') as HTMLInputElement;
    fileInput?.click();
  }

  uploadAvatar() {
    const file = this.selectedFile();
    if (!file) return;

    this.isUploadingImage.set(true);
    this.profileService.updateProfileImage(file).subscribe({
      next: () => {
        this.alertService.success('Success', 'Profile image updated successfully');
        this.isUploadingImage.set(false);
        this.cancelAvatarUpload();
        this.loadProfile();
      },
      error: (error) => {
        this.isUploadingImage.set(false);
        this.alertService.submissionError(
          'Image upload',
          error?.error?.message || 'Failed to upload image'
        );
      },
    });
  }

  cancelAvatarUpload() {
    this.selectedFile.set(null);
    this.avatarPreview.set(null);
    const fileInput = document.getElementById('avatarInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  removeProfileImage() {
    this.alertService
      .confirm(
        'Remove Profile Image?',
        'Yes, remove',
        'Cancel',
        'Are you sure you want to remove your profile image?'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.isUploadingImage.set(true);
          this.profileService.removeProfileImage().subscribe({
            next: () => {
              this.alertService.success('Success', 'Profile image removed successfully');
              this.isUploadingImage.set(false);
              this.loadProfile();
            },
            error: (error) => {
              this.isUploadingImage.set(false);
              this.alertService.submissionError(
                'Remove image',
                error?.error?.message || 'Failed to remove profile image'
              );
            },
          });
        }
      });
  }
}
