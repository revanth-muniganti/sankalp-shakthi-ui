import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InterestsSelectionComponent } from '../interests-selection/interests-selection.component';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, InterestsSelectionComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  otpForm: FormGroup;
  activeTab: 'mobile' | 'username' = 'username';
  showOtpModal: boolean = false;
  otpSent: boolean = false;
  countdown: number = 0;
  countdownInterval: any;
  showPassword: boolean = false;
  showInterestsModal: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });
  }

  switchTab(tab: 'mobile' | 'username') {
    this.activeTab = tab;
    // Reset form when switching tabs
    this.loginForm.reset();
    this.errorMessage = '';
    this.closeOtpModal();
  }

  onSubmit() {
    // Clear previous error messages
    this.errorMessage = '';

    if (this.activeTab === 'username') {
      if (this.username?.valid && this.password?.valid) {
        this.isLoading = true;
        
        // Call login API
        this.apiService.login({
          username: this.username.value.trim(),
          password: this.password.value,
          grant_type: 'password'
        }).subscribe({
          next: (response) => {
            this.isLoading = false;
            
            // Store token
            this.authService.setToken(response.access_token, response.token_type);
            
            // Show interests modal or navigate to home
            this.showInterestsModal = true;
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = error.message || 'Login failed. Please try again.';
          }
        });
      } else {
        this.username?.markAsTouched();
        this.password?.markAsTouched();
      }
    } else {
      if (this.mobileNumber?.valid) {
        // Show OTP modal and send OTP
        this.sendOtp();
      } else {
        this.mobileNumber?.markAsTouched();
      }
    }
  }

  sendOtp() {
    // Simulate sending OTP
    console.log('Sending OTP to:', this.mobileNumber?.value);
    this.showOtpModal = true;
    this.otpSent = true;
    this.startCountdown();
    // Here you would call your API to send OTP
  }

  verifyOtp() {
    if (this.otpForm.valid) {
      console.log('Verifying OTP:', this.otpForm.value.otp);
      // Here you would call your API to verify OTP
      // On success, close modal and proceed with login
      this.closeOtpModal();
      // Handle successful login - show interests modal
      this.showInterestsModal = true;
    } else {
      this.otpForm.get('otp')?.markAsTouched();
    }
  }

  resendOtp() {
    if (this.countdown === 0) {
      this.sendOtp();
    }
  }

  startCountdown() {
    this.countdown = 60; // 60 seconds
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  closeOtpModal() {
    this.showOtpModal = false;
    this.otpSent = false;
    this.otpForm.reset();
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdown = 0;
    }
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get mobileNumber() {
    return this.loginForm.get('mobileNumber');
  }

  get otp() {
    return this.otpForm.get('otp');
  }

  navigateToRegistration() {
    this.router.navigate(['/registration']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onInterestsSelected(interests: string[]) {
    console.log('Selected interests:', interests);
    this.showInterestsModal = false;
    // Here you would save the interests and navigate to dashboard/home
    // this.router.navigate(['/dashboard']);
  }

  onInterestsModalClose() {
    this.showInterestsModal = false;
  }
}
