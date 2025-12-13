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

    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
      console.log('User info saved');
    }
  }
}

