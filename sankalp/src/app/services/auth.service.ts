import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly TOKEN_TYPE_KEY = 'token_type';

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Store authentication token
   */
  setToken(token: string, tokenType: string = 'bearer'): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.TOKEN_TYPE_KEY, tokenType);
    }
  }

  /**
   * Get access token
   */
  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /**
   * Get token type
   */
  getTokenType(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(this.TOKEN_TYPE_KEY);
    }
    return null;
  }

  /**
   * Get authorization header value
   */
  getAuthorizationHeader(): string | null {
    const token = this.getToken();
    const tokenType = this.getTokenType() || 'bearer';
    return token ? `${tokenType} ${token}` : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Logout user
   */
  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_TYPE_KEY);
    }
    this.router.navigate(['/login']);
  }

  /**
   * Clear all auth data
   */
  clearAuth(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_TYPE_KEY);
      localStorage.removeItem('user_email');
      localStorage.removeItem('username');
    }
  }

  /**
   * Decode JWT token to get user info
   */
  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      // JWT tokens have 3 parts separated by dots: header.payload.signature
      const payload = token.split('.')[1];
      if (!payload) return null;

      // Decode base64
      const decoded = JSON.parse(atob(payload));
      const email = decoded.sub || decoded.email;
      
      // Store email for quick access
      if (this.isBrowser() && email) {
        localStorage.setItem('user_email', email);
        // Extract username from email (part before @)
        const username = email.split('@')[0];
        localStorage.setItem('username', username);
      }
      
      return email || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get username from stored value or decode from token
   */
  getUsername(): string | null {
    if (this.isBrowser()) {
      // Try to get from localStorage first
      const stored = localStorage.getItem('username');
      if (stored) return stored;

      // If not stored, decode from token
      const email = this.getUserEmail();
      if (email) {
        const username = email.split('@')[0];
        localStorage.setItem('username', username);
        return username;
      }
    }
    return null;
  }

  /**
   * Store username
   */
  setUsername(username: string): void {
    if (this.isBrowser()) {
      localStorage.setItem('username', username);
    }
  }
}

