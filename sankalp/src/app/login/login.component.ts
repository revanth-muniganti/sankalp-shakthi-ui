import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService, LoginResponse } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword: boolean = false;
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
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    // Clear previous error messages
    this.errorMessage = '';

    if (this.loginForm.valid) {
      this.isLoading = true;
      
      // Call login API
      this.apiService.login({
        username: this.loginForm.value.username.trim(),
        password: this.loginForm.value.password,
        grant_type: '' // Empty string as per API specification
      }).subscribe({
        next: (response: LoginResponse) => {
          this.isLoading = false;
          
          // Store token
          this.authService.setToken(response.access_token, response.token_type);
          
          // Store username from login form
          const username = this.loginForm.value.username.trim();
          if (username) {
            this.authService.setUsername(username);
          } else {
            // Fallback: decode from token
            this.authService.getUserEmail();
          }
          
          // Navigate to home/dashboard
          this.router.navigate(['/']);
        },
        error: (error: any) => {
          this.isLoading = false;
          // Handle different error formats
          if (error.error?.detail) {
            this.errorMessage = error.error.detail;
          } else if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = 'Login failed. Please try again.';
          }
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
