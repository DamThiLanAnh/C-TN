import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
  user?: any;
  [key: string]: any;
}

export interface RefreshTokenResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    console.log('🔐 Calling login API:', `${this.apiUrl}/auth/login`);
    console.log('📤 Login payload:', { username, password: '***' });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': '*/*',
      'X-Requested-With': 'XMLHttpRequest'
    });

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      { username, password },
      {
        headers,
        withCredentials: false
      }
    ).pipe(
      tap((response: LoginResponse) => {
        console.log('✅ Login response:', response);
      })
    );
  }

  refreshToken(refreshToken: string): Observable<RefreshTokenResponse> {
    console.log('Calling refresh token API:', `${this.apiUrl}/auth/refresh`);

    const headers = new HttpHeaders({
      'accept': '*/*'
    });

    return this.http.post<RefreshTokenResponse>(
      `${this.apiUrl}/auth/refresh?refreshToken=${refreshToken}`,
      {},
      { headers }
    ).pipe(
      tap((response: RefreshTokenResponse) => {
        console.log('✅ Refresh token response:', response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  saveTokens(response: LoginResponse): void {
    // Hỗ trợ nhiều format response khác nhau từ backend
    const token = response.token || response.accessToken || response.access_token;
    const refreshToken = response.refreshToken || response.refresh_token;

    if (token) {
      localStorage.setItem('token', token);
      console.log('Access token saved');
    }

    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
      console.log('Refresh token saved');
    }

    // Save user info - either from response.user or construct from response
    const userInfo = response.user || {
      username: response['username'],
      roles: response['roles'],
      status: response['status'],
      lastLogin: response['lastLogin']
    };

    if (userInfo) {
      localStorage.setItem('user', JSON.stringify(userInfo));
      console.log('User info saved:', userInfo);
    }
  }

  getUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getUserRole(): string | null {
    const user = this.getUser();
    console.log('getUserRole - user object:', user);

    if (user) {
      // Check for role in different formats
      if (user.role) {
        console.log('Found role:', user.role);
        return user.role;
      }
      if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
        console.log('Found roles array:', user.roles);
        return user.roles[0];
      }
    }

    // Fallback: decode token to get role
    console.log('Falling back to token role detection');
    return this.getRoleFromToken();
  }

  getRoleFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Decode JWT token (format: header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));

      // Check for role in different formats
      return payload.role ||
             payload.roles?.[0] ||
             payload.authorities?.[0]?.authority ||
             payload.authority ||
             null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  isManager(): boolean {
    const role = this.getUserRole();
    console.log('isManager check - role:', role);

    if (!role) {
      console.log('isManager - no role found');
      return false;
    }

    const isManagerRole = role === 'MANAGER' ||
           role === 'ROLE_MANAGER' ||
           role.toUpperCase().includes('MANAGER');

    console.log('isManager result:', isManagerRole);
    return isManagerRole;
  }
}

