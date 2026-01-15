import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import jwt_decode from 'jwt-decode';

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

export interface AuthState {
  user: any;
  token: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private _authState$ = new BehaviorSubject<AuthState>({ user: this.getUser(), token: this.getToken() });
  public get authState$() {
    return this._authState$.asObservable();
  }

  constructor(private http: HttpClient) { }

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

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/users/me/password`, { oldPassword, newPassword });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
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
    }

    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    const userInfo = response.user || {
      id: response['id'] || response['employeeId'] || response['userId'],
      employeeId: response['employeeId'] || response['id'],
      username: response['username'],
      roles: response['roles'],
      status: response['status'],
      lastLogin: response['lastLogin'],
      isAdmin: response['isAdmin'],
      isHR: response['isHR'],
      isManager: response['isManager']
    };

    if (userInfo) {
      localStorage.setItem('user', JSON.stringify(userInfo));
    }
    this._authState$.next({ user: userInfo, token: token ?? null });
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
        // Prioritize HR or ADMIN if present in array? 
        // Returning the first one is legacy behavior, keeping it for fallback
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
      // Sử dụng jwt-decode để giải mã JWT an toàn
      const payload: any = jwt_decode(token);
      return payload.role ||
        (payload.roles && Array.isArray(payload.roles) ? payload.roles[0] : undefined) ||
        (payload.authorities && Array.isArray(payload.authorities) ? payload.authorities[0]?.authority : undefined) ||
        payload.authority ||
        null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  isManager(): boolean {
    const user = this.getUser();
    if (user) {
      if (user.isManager === true) return true;
      if (Array.isArray(user.roles)) {
        const roles = user.roles.map((r: any) => r.toString().toUpperCase());
        if (roles.includes('MANAGER') || roles.includes('ROLE_MANAGER') || roles.some((r: string) => r.includes('MANAGER'))) {
          console.log('isManager true via roles array');
          return true;
        }
      }
    }

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

  isHR(): boolean {
    const user = this.getUser();
    if (user && user.isHR === true) return true;

    const role = this.getUserRole();
    console.log('isHR check - role:', role);

    if (!role) {
      console.log('isHR - no role found');
      return false;
    }

    const isHRRole = role === 'HR' ||
      role === 'ROLE_HR' ||
      role.toUpperCase() === 'HR';

    console.log('isHR result:', isHRRole);
    return isHRRole;
  }

  isHROrAdmin(): boolean {
    const user = this.getUser();
    if (user) {
      if (user.isHR === true || user.isAdmin === true) return true;
    }

    const role = this.getUserRole();

    if (!role) {
      return false;
    }

    const isHROrAdminRole = role === 'HR' ||
      role === 'ROLE_HR' ||
      role === 'ADMIN' ||
      role === 'ROLE_ADMIN' ||
      role.toUpperCase().includes('HR') ||
      role.toUpperCase().includes('ADMIN');

    return isHROrAdminRole;
  }
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this._authState$.next({ user: null, token: null });
    // Reload page to clear state and redirect to login (guarded by guards)
    // Or you can inject Router and navigate to /login
    window.location.href = '/login';
  }
}
