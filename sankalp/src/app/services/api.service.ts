import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface RegistrationRequest {
  email: string;
  password: string;
  mobile_number: string;
  mobile_country_hint?: string;
}

export interface RegistrationResponse {
  email: string;
  mobile_country_hint: string;
  mobile_number: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  grant_type?: string;
  scope?: string;
  client_id?: string;
  client_secret?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000'; // Change to your backend URL if different

  constructor(private http: HttpClient) {}

  /**
   * Register a new user
   * @param registrationData User registration data
   * @returns Observable of registration response
   */
  register(registrationData: RegistrationRequest): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(
      `${this.baseUrl}/api/v1/auth/signup`,
      registrationData
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Login user and get access token
   * @param loginData User login credentials
   * @returns Observable of login response with access token
   */
  login(loginData: LoginRequest): Observable<LoginResponse> {
    // Prepare form-urlencoded data
    const params = new URLSearchParams();
    params.set('username', loginData.username);
    params.set('password', loginData.password);
    params.set('grant_type', loginData.grant_type || 'password');
    
    if (loginData.scope) {
      params.set('scope', loginData.scope);
    }
    if (loginData.client_id) {
      params.set('client_id', loginData.client_id);
    }
    if (loginData.client_secret) {
      params.set('client_secret', loginData.client_secret);
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<LoginResponse>(
      `${this.baseUrl}/api/v1/auth/token`,
      params.toString(),
      { headers }
    ).pipe(
      catchError(this.handleLoginError)
    );
  }

  /**
   * Handle HTTP errors for registration
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      } else if (error.status === 400) {
        errorMessage = error.error?.detail || 'Invalid request. Please check your input.';
      } else if (error.status === 409) {
        errorMessage = error.error?.detail || 'User already exists with this email or mobile number.';
      } else if (error.status === 422) {
        errorMessage = error.error?.detail || 'Validation error. Please check your input.';
      } else {
        errorMessage = error.error?.detail || `Server error: ${error.status}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Handle HTTP errors for login
   */
  private handleLoginError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      } else if (error.status === 400) {
        errorMessage = error.error?.detail || 'Invalid request. Please check your credentials.';
      } else if (error.status === 401) {
        errorMessage = error.error?.detail || 'Invalid username or password. Please try again.';
      } else if (error.status === 422) {
        errorMessage = error.error?.detail || 'Validation error. Please check your input.';
      } else {
        errorMessage = error.error?.detail || `Server error: ${error.status}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}

