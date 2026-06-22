import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AlertService } from 'src/app/shared/alert/alert.service';
import { EMAIL_PATTERN } from 'src/app/shared/util/email.util';
import {
  ETH_PHONE_PATTERN,
  formatEthiopianPhoneWithCountryCode,
} from 'src/app/shared/util/phone.util';
import { ManageProfile } from 'src/app/core/services/manage-profile';
import { Auth } from 'src/app/core/services/auth';

@Component({
  selector: 'app-expert-profile',
  imports: [CommonModule, FormsModule, NgClass],
  templateUrl: './expert-profile.html',
  styleUrl: './expert-profile.css',
})
export class ExpertProfile implements OnInit {
  private alertService = inject(AlertService);
  private profileService = inject(ManageProfile);
  private authService = inject(Auth);

  // Profile data
  fullName = signal('');
  userName = signal('');
  email = signal('');
  phoneNumber = signal('');
  professional = signal('');

  // Computed profile image from auth service or fallback
  profileImage = computed(() => {
    const profile = this.authService.profile();
    if (!profile) return '';

    const profilePhotoUrl = profile['profile_photo_url'];
    const profileImg = profile['profile_image'];
    return (profileImg || profilePhotoUrl) as string;
  });

  // Skills - for experts we'll store as a comma-separated string in professional field
  skills = signal<string[]>([]);
  newSkill = signal('');

  // Loading states
  isUploadingImage = signal(false);
  isSaving = signal(false);
  isLoading = signal(true);

  // Original data for reset functionality
  private originalData = signal({
    fullName: '',
    userName: '',
    email: '',
    phoneNumber: '',
    professional: '',
    skills: [] as string[],
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  /**
   * Load expert profile from backend
   */
  private loadProfile(): void {
    this.isLoading.set(true);
    this.profileService.myProfile().subscribe({
      next: (profile) => {
        this.fullName.set(profile.name || '');
        this.userName.set(profile.username || '');
        this.email.set(profile.email || '');
        this.phoneNumber.set(profile.phone_number || '');
        this.professional.set(profile.profession || '');

        // Handle skills - convert from array or set empty
        const profileSkills = profile.skills || [];
        this.skills.set(Array.isArray(profileSkills) ? profileSkills : []);

        // Update auth service profile
        this.authService.setProfile(profile);

        // Store original data for reset functionality
        this.originalData.set({
          fullName: profile.name || '',
          userName: profile.username || '',
          email: profile.email || '',
          phoneNumber: profile.phone_number || '',
          professional: profile.profession || '',
          skills: Array.isArray(profileSkills) ? [...profileSkills] : [],
        });

        this.isLoading.set(false);
      },
      error: (error) => {
        this.alertService.error('Load Error', 'Failed to load profile data');
        console.error('Profile load error:', error);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Add a new skill to the skills array
   */
  addSkill(): void {
    const skill = this.newSkill().trim();
    if (!skill) {
      return;
    }
    if (this.skills().includes(skill)) {
      this.alertService.warning('Duplicate Skill', 'This skill is already added');
      return;
    }
    this.skills.update((skills) => [...skills, skill]);
    this.newSkill.set('');
  }

  /**
   * Remove a skill from the skills array
   */
  removeSkill(skillToRemove: string): void {
    this.skills.update((skills) => skills.filter((skill) => skill !== skillToRemove));
  }

  /**
   * Handle profile image upload
   */
  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) {
      return;
    }

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

    this.isUploadingImage.set(true);

    this.profileService.updateProfileImage(file).subscribe({
      next: () => {
        this.alertService.success('Success', 'Profile image updated successfully');
        this.isUploadingImage.set(false);
        input.value = '';
        // Reload profile to get updated image
        this.loadProfile();
      },
      error: (error) => {
        this.alertService.submissionError(
          'Image upload',
          error?.error?.message || 'Failed to upload image'
        );
        this.isUploadingImage.set(false);
        input.value = '';
      },
    });
  }

  private validateForm(): boolean {
    // Validate full name
    const name = this.fullName().trim();
    if (!name) {
      this.alertService.validationError('Full Name');
      return false;
    }
    if (name.length < 2) {
      this.alertService.error('Invalid Name', 'Full name must be at least 2 characters');
      return false;
    }

    // Validate email
    const email = this.email().trim();
    if (!email) {
      this.alertService.validationError('Email');
      return false;
    }
    if (!EMAIL_PATTERN.test(email)) {
      this.alertService.error('Invalid Email', 'Please enter a valid email address');
      return false;
    }

    // Validate phone number
    const phone = this.phoneNumber().trim();
    if (!phone) {
      this.alertService.validationError('Phone Number');
      return false;
    }
    if (!ETH_PHONE_PATTERN.test(phone)) {
      this.alertService.error(
        'Invalid Phone Number',
        'Please enter a valid Ethiopian phone number (e.g., +251912345678 or 0912345678)'
      );
      return false;
    }

    // Validate username
    const username = this.userName().trim();
    if (!username) {
      this.alertService.validationError('Username');
      return false;
    }
    if (username.length < 3) {
      this.alertService.error('Invalid Username', 'Username must be at least 3 characters');
      return false;
    }
    // Check for valid username format (alphanumeric and underscores)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      this.alertService.error(
        'Invalid Username',
        'Username can only contain letters, numbers, and underscores'
      );
      return false;
    }

    // Validate professional
    const professional = this.professional().trim();
    if (!professional) {
      this.alertService.validationError('Professional');
      return false;
    }

    // Validate skills
    if (this.skills().length === 0) {
      this.alertService.error('Missing Skills', 'Please add at least one skill');
      return false;
    }

    return true;
  }

  /**
   * Save profile changes to backend
   */
  saveChanges(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving.set(true);

    // Normalize phone number
    const normalizedPhone = formatEthiopianPhoneWithCountryCode(this.phoneNumber());
    if (!normalizedPhone) {
      this.alertService.error('Invalid Phone', 'Failed to normalize phone number');
      this.isSaving.set(false);
      return;
    }

    const profileData = {
      name: this.fullName().trim(),
      username: this.userName().trim(),
      email: this.email().trim().toLowerCase(),
      phone: normalizedPhone,
      profession: this.professional().trim(),
      skills: this.skills(),
    };

    this.profileService.updateProfile(profileData).subscribe({
      next: () => {
        this.alertService.success('Success', 'Profile updated successfully');
        this.isSaving.set(false);
        // Update original data to reflect saved changes
        this.originalData.set({
          fullName: profileData.name,
          userName: profileData.username,
          email: profileData.email,
          phoneNumber: profileData.phone,
          professional: profileData.profession,
          skills: [...profileData.skills],
        });
        // Reload profile to get updated data
        this.loadProfile();
      },
      error: (error: any) => {
        const errorMessage = error?.error?.message || 'Failed to update profile. Please try again.';
        this.alertService.submissionError('Profile update', errorMessage);
        this.isSaving.set(false);
      },
    });
  }

  /**
   * Cancel changes and reset to original values
   */
  cancel(): void {
    this.alertService
      .confirm(
        'Discard Changes?',
        'Yes, discard',
        'No, keep editing',
        'Are you sure you want to discard all changes?'
      )
      .then((result) => {
        if (result.isConfirmed) {
          const original = this.originalData();
          this.fullName.set(original.fullName);
          this.userName.set(original.userName);
          this.email.set(original.email);
          this.phoneNumber.set(original.phoneNumber);
          this.professional.set(original.professional);
          this.skills.set([...original.skills]);
          this.newSkill.set('');
          this.alertService.info('Changes Discarded', 'Your changes have been discarded');
        }
      });
  }

  /**
   * Remove profile image
   */
  removeProfileImage(): void {
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
              // Reload profile to get updated image
              this.loadProfile();
            },
            error: (error) => {
              this.alertService.submissionError(
                'Remove image',
                error?.error?.message || 'Failed to remove profile image'
              );
              this.isUploadingImage.set(false);
            },
          });
        }
      });
  }

  /**
   * Check if there are unsaved changes
   */
  hasUnsavedChanges(): boolean {
    const original = this.originalData();
    return (
      this.fullName().trim() !== original.fullName ||
      this.userName().trim() !== original.userName ||
      this.email().trim().toLowerCase() !== original.email ||
      this.phoneNumber().trim() !== original.phoneNumber ||
      this.professional().trim() !== original.professional ||
      JSON.stringify(this.skills()) !== JSON.stringify(original.skills)
    );
  }
}
