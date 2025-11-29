import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService, RegistrationRequest } from '../services/api.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Country codes for mobile number
  countryCodes = [
    { code: 'US', name: 'United States', prefix: '+1' },
    { code: 'IN', name: 'India', prefix: '+91' },
    { code: 'GB', name: 'United Kingdom', prefix: '+44' },
    { code: 'CA', name: 'Canada', prefix: '+1' },
    { code: 'AU', name: 'Australia', prefix: '+61' }
  ];

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private apiService: ApiService
  ) {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]],
      mobileNumber: ['', [
        Validators.required, 
        Validators.pattern(/^[0-9]{10}$/)
      ]],
      mobileCountryHint: ['US', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Custom validator for password strength
   */
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;

    return !passwordValid ? { passwordStrength: true } : null;
  }

  /**
   * Custom validator to check if passwords match
   */
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit() {
    // Clear previous messages
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registrationForm.valid) {
      this.isLoading = true;

      // Format mobile number with country code
      const countryCode = this.countryCodes.find(c => c.code === this.registrationForm.value.mobileCountryHint);
      const formattedMobileNumber = countryCode 
        ? `${countryCode.prefix}${this.registrationForm.value.mobileNumber}`
        : `+1${this.registrationForm.value.mobileNumber}`;

      const registrationData: RegistrationRequest = {
        email: this.registrationForm.value.email.toLowerCase().trim(),
        password: this.registrationForm.value.password,
        mobile_number: formattedMobileNumber,
        mobile_country_hint: this.registrationForm.value.mobileCountryHint
      };

      this.apiService.register(registrationData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Registration successful! Redirecting to login...';
          
          // Navigate to login page after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Registration failed. Please try again.';
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registrationForm.controls).forEach(key => {
        this.registrationForm.get(key)?.markAsTouched();
      });
    }
  }

  get email() {
    return this.registrationForm.get('email');
  }

  get password() {
    return this.registrationForm.get('password');
  }

  get confirmPassword() {
    return this.registrationForm.get('confirmPassword');
  }

  get mobileNumber() {
    return this.registrationForm.get('mobileNumber');
  }

  get mobileCountryHint() {
    return this.registrationForm.get('mobileCountryHint');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
