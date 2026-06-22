import { Component, inject, signal } from '@angular/core';
import { AlertService } from '../../shared/alert/alert.service';
import {
  normalizeEthiopianPhone,
  formatEthiopianPhoneWithCountryCode,
} from '../../shared/util/phone.util';
import { TermsAndConditions } from '../terms-and-conditions/terms-and-conditions';
import { Auth } from 'src/app/core/services/auth';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.css',
  standalone: true,
  imports: [TermsAndConditions],
})
export class LoginModal {
  private alertService = inject(AlertService);
  private authService = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);

  phoneNumber = signal('');
  password = signal('');
  agreedToTerms = signal(false);
  termsmodle = signal(false);
  generalError = signal<string>('');
  showPassword = signal(false);

  // SMS Subscribe
  smsPhone = '1234'; // Replace with your SMS short code
  smsMessage = 'OK';
  isMobile = signal(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

  closeterms() {
    this.termsmodle.set(false);
  }
  agreed() {
    this.agreedToTerms.set(true);
    this.termsmodle.set(false);
  }

  closeLogin() {
    this.router.navigate([{ outlets: { modal: null } }]);
  }

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.phoneNumber.set(input.value);
  }

  onPasswordInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.password.set(input.value);
  }

  toggleAgreedToTerms() {
    this.agreedToTerms.set(!this.agreedToTerms());
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  handleSubscribeClick() {
    if (!this.isMobile()) {
      this.alertService.info(
        'Mobile Device Required',
        `Please use your phone to subscribe via SMS. Send "${this.smsMessage}" to ${this.smsPhone}`
      );
    } else {
      // Open SMS app on mobile
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const separator = isIOS ? '&' : '?';
      const smsLink = `sms:${this.smsPhone}${separator}body=${encodeURIComponent(this.smsMessage)}`;
      window.location.href = smsLink;
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();

    // Validate phone number
    if (!this.phoneNumber().trim()) {
      this.alertService.validationError('Phone number');
      return;
    }

    const normalizedPhone = normalizeEthiopianPhone(this.phoneNumber());
    if (!normalizedPhone) {
      this.alertService.error(
        'Invalid Phone Number',
        'Please enter a valid Ethiopian phone number (9XXXXXXXX or 09XXXXXXXX)'
      );
      return;
    }

    // Validate password
    if (!this.password().trim()) {
      this.alertService.validationError('Password');
      return;
    }

    if (this.password().length < 6) {
      this.alertService.error('Invalid Password', 'Password must be at least 6 characters long');
      return;
    }

    // Validate terms agreement
    if (!this.agreedToTerms()) {
      this.alertService.warning(
        'Terms Required',
        'Please agree to the terms and conditions to continue'
      );
      return;
    }

    // Format phone with country code for submission
    const formattedPhone = formatEthiopianPhoneWithCountryCode(this.phoneNumber());
    if (!formattedPhone) {
      this.alertService.error('Invalid Phone Number', 'Unable to format phone number');
      return;
    }

    this.isLoading.set(true);
    this.authService
      .login({
        username: formattedPhone,
        password: this.password(),
      })
      .subscribe({
        next: (response) => {
          if (response.access_token) {
            // Fetch profile before navigating to ensure roles are available
            this.authService.manageProfile.myProfile().subscribe({
              next: (profile) => {
                this.isLoading.set(false);
                this.authService.setProfile(profile);

                // Get user roles and redirect accordingly
                const roles = this.authService
                  .getRolesFromStoredProfile()
                  .map((r) => r.toLowerCase());
                const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

                // Determine target route
                let targetRoute = '/s/courses';
                if (returnUrl) {
                  targetRoute = returnUrl;
                } else if (roles.includes('admin')) {
                  targetRoute = '/a/dashboard';
                } else if (roles.includes('expert')) {
                  targetRoute = '/e/dashboard';
                } else if (roles.includes('user')) {
                  targetRoute = '/s/courses';
                }

                // Navigate directly - this will close the modal and navigate simultaneously
                this.router.navigateByUrl(targetRoute);
              },
              error: () => {
                this.isLoading.set(false);
                this.generalError.set('Failed to fetch user profile');
              },
            });
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Login error:', error);
          if (error.status === 401) {
            this.generalError.set('Invalid phone or password');
          } else if (error.status === 0) {
            this.generalError.set('Unable to connect to server. Please try again later.');
          } else {
            this.generalError.set(error.error?.message || 'An error occurred during login');
          }
        },
      });
  }
}
