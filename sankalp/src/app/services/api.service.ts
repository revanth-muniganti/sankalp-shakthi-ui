import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface RegistrationRequest {
  email: string;
  password: string;
  mobile_number: string;
  mobile_country_hint: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  grant_type: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface RegistrationResponse {
  id: number;
  email: string;
  mobile_number: string;
  mobile_country_hint: string;
  is_active: boolean;
}

export interface ServiceType {
  id: number;
  name: string;
}

export interface Service {
  id: number;
  name: string;
  service_type_id: number;
  description1: string | null;
  key_insights_descr: string | null;
  descr3: string | null;
  min_price: number | null;
  max_price: number | null;
  rating: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://127.0.0.1:8000/api/v1';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Register a new user
   */
  register(data: RegistrationRequest): Observable<RegistrationResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': 'application/json'
    });

    return this.http.post<RegistrationResponse>(
      `${this.baseUrl}/signup`,
      data,
      { headers }
    ).pipe(
      catchError((error: any) => {
        const errorMessage = error.error?.detail || error.message || 'Registration failed';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Login user
   */
  login(data: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'accept': 'application/json'
    });

    // Convert to form-urlencoded format using HttpParams
    // Note: grant_type can be empty string as per the API
    const body = new HttpParams()
      .set('username', data.username)
      .set('password', data.password)
      .set('grant_type', data.grant_type || '')
      .set('scope', '')
      .set('client_id', '')
      .set('client_secret', '');

    return this.http.post<LoginResponse>(
      `${this.baseUrl}/login`,
      body.toString(),
      { headers }
    ).pipe(
      catchError((error: any) => {
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.status === 0) {
          errorMessage = 'Unable to connect to server. Please check if the backend is running and CORS is configured.';
        } else if (error.status === 401) {
          errorMessage = 'Invalid username or password. Please try again.';
        } else if (error.status === 404) {
          errorMessage = 'Login endpoint not found. Please check the server configuration.';
        } else if (error.error?.detail) {
          errorMessage = error.error.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get all service types
   */
  getServiceTypes(skip: number = 0, limit: number = 100): Observable<ServiceType[]> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const authHeader = this.authService.getAuthorizationHeader();
    if (authHeader) {
      headers = headers.set('Authorization', authHeader);
    }

    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    const url = `${this.baseUrl}/service_types`;

    return this.http.get<ServiceType[]>(url, { headers, params }).pipe(
      catchError((error: any) => {
        // Only log error details in development
        if (!error.error?.detail) {
          console.error('Failed to fetch service types:', error.status || error.message);
        }
        const errorMessage = error.error?.detail || error.message || 'Failed to fetch service types';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get all services
   */
  getServices(
    serviceTypeId: number | null = null,
    skip: number = 0,
    limit: number = 100
  ): Observable<Service[]> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const authHeader = this.authService.getAuthorizationHeader();
    if (authHeader) {
      headers = headers.set('Authorization', authHeader);
    }

    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (serviceTypeId !== null) {
      params = params.set('service_type_id', serviceTypeId.toString());
    }

    const url = `${this.baseUrl}/services`;

    return this.http.get<Service[]>(url, { headers, params }).pipe(
      catchError((error: any) => {
        if (!error.error?.detail) {
          console.error('Failed to fetch services:', error.status || error.message);
        }
        const errorMessage = error.error?.detail || error.message || 'Failed to fetch services';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get a single service by ID
   */
  getServiceById(serviceId: number): Observable<Service> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const authHeader = this.authService.getAuthorizationHeader();
    if (authHeader) {
      headers = headers.set('Authorization', authHeader);
    }

    const url = `${this.baseUrl}/services/${serviceId}`;

    return this.http.get<Service>(url, { headers }).pipe(
      catchError((error: any) => {
        if (!error.error?.detail) {
          console.error('Failed to fetch service:', error.status || error.message);
        }
        const errorMessage = error.error?.detail || error.message || 'Failed to fetch service';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Create a booking
   */
  createBooking(data: BookingRequest): Observable<BookingResponse> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': 'application/json'
    });

    const authHeader = this.authService.getAuthorizationHeader();
    if (authHeader) {
      headers = headers.set('Authorization', authHeader);
    } else {
      return throwError(() => new Error('Authentication required. Please login to book a service.'));
    }

    return this.http.post<BookingResponse>(
      `${this.baseUrl}/bookings`,
      data,
      { headers }
    ).pipe(
      catchError((error: any) => {
        let errorMessage = 'Failed to create booking. Please try again.';
        
        if (error.status === 401) {
          errorMessage = 'Authentication required. Please login to book a service.';
        } else if (error.status === 400) {
          errorMessage = error.error?.detail || 'Invalid booking data. Please check your information.';
        } else if (error.error?.detail) {
          errorMessage = error.error.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get all bookings for the current user
   */
  getBookings(skip: number = 0, limit: number = 100): Observable<BookingResponse[]> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const authHeader = this.authService.getAuthorizationHeader();
    if (authHeader) {
      headers = headers.set('Authorization', authHeader);
    } else {
      return throwError(() => new Error('Authentication required. Please login to view bookings.'));
    }

    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    const url = `${this.baseUrl}/bookings`;

    return this.http.get<BookingResponse[]>(url, { headers, params }).pipe(
      catchError((error: any) => {
        if (!error.error?.detail) {
          console.error('Failed to fetch bookings:', error.status || error.message);
        }
        const errorMessage = error.error?.detail || error.message || 'Failed to fetch bookings';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}

export interface BookingRequest {
  service_id: number;
  payment_status: string;
  scheduled_time: string; // ISO 8601 datetime string
  address: string;
}

export interface BookingResponse {
  id: number;
  user_id: number;
  service_id: number;
  scheduled_time: string;
  payment_status: string;
  address: string;
}
