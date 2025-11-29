import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly TOKEN_TYPE_KEY = 'token_type';

  constructor(private router: Router) {}

  /**
   * Store authentication token
   */
  setToken(token: string, tokenType: string = 'bearer'): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.TOKEN_TYPE_KEY, tokenType);
  }

  /**
   * Get access token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get token type
   */
  getTokenType(): string | null {
    return localStorage.getItem(this.TOKEN_TYPE_KEY);
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
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_TYPE_KEY);
    this.router.navigate(['/login']);
  }

  /**
   * Clear all auth data
   */
  clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_TYPE_KEY);
  }
}

