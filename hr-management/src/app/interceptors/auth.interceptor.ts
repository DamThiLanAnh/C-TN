import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('🚀 ========== AUTH INTERCEPTOR CALLED ==========');
    console.log('🔐 Request URL:', request.url);
    console.log('🔐 Request Method:', request.method);

    // Check if this is special-schedules/my request
    const isSpecialScheduleMyRequest = request.url.includes('/special-schedules/my');
    if (isSpecialScheduleMyRequest) {
      console.log('🎯 🎯 🎯 THIS IS SPECIAL-SCHEDULES/MY REQUEST 🎯 🎯 🎯');
    }

    // Thêm token vào header nếu có
    const token = this.authService.getToken();
    console.log('🔐 Token from localStorage KEY:', localStorage.getItem('token') ? 'EXISTS' : 'NULL');
    console.log('🔐 Token exists:', !!token);
    console.log('🔐 Token length:', token ? token.length : 0);
    console.log('🔐 Full Token:', token);

    // Compare with Postman token
    const postmanToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiZW52IiwiaWF0IjoxNzY2ODI3MDAwLCJleHAiOjE3NjY4Mjg4MDB9.H60KuWpMsC5YY8cGT5XMu-Vwlb6LH9yEXXqX1mOBfnM';
    if (token === postmanToken) {
      console.log('✅ ✅ ✅ TOKEN MATCHES POSTMAN TOKEN - SHOULD WORK! ✅ ✅ ✅');
    } else {
      console.log('❌ ❌ ❌ TOKEN DIFFERS FROM POSTMAN TOKEN - THIS IS THE ISSUE! ❌ ❌ ❌');
      console.log('Expected (Postman):', postmanToken);
      console.log('Got (localStorage):', token);
    }

    if (token) {
      request = this.addToken(request, token);
      console.log('✅ Token added to request headers');
      const authHeader = request.headers.get('Authorization');
      console.log('✅ Authorization header:', authHeader ? authHeader.substring(0, 50) + '...' : 'MISSING');
      console.log('✅ Full Authorization header:', authHeader);

      // Log all headers
      console.log('📋 All request headers:');
      request.headers.keys().forEach(key => {
        console.log(`   ${key}: ${request.headers.get(key)}`);
      });
    } else {
      console.warn('⚠️ No token found in localStorage!');
      console.warn('⚠️ Request will be sent WITHOUT Authorization header');
    }

    console.log('🚀 ========== SENDING REQUEST ==========');

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ ===== INTERCEPTOR CAUGHT ERROR =====');
        console.error('❌ Request URL:', request.url);
        console.error('❌ Request failed with status:', error.status);
        console.error('❌ Error statusText:', error.statusText);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error.error:', error.error);
        console.error('❌ Full error object:', error);

        // Nếu lỗi 401 (Unauthorized) và không phải request refresh token
        if (error.status === 401 && !request.url.includes('/auth/refresh')) {
          console.warn('⚠️ 401 Error - Attempting token refresh...');
          return this.handle401Error(request, next);
        }

        if (error.status === 403) {
          console.error('❌ ===== 403 FORBIDDEN DETAILS =====');
          console.error('❌ This means the token is valid but user does not have permission');
          console.error('❌ Check backend logs or permissions configuration');
          console.error('❌ Request URL:', request.url);
          console.error('❌ Request method:', request.method);
          console.error('❌ Token used:', request.headers.get('Authorization')?.substring(0, 50) + '...');
        }

        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();

      if (refreshToken) {
        return this.authService.refreshToken(refreshToken).pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;

            // Lưu token mới
            const newToken = response.token || response.accessToken || response.access_token;
            if (newToken) {
              localStorage.setItem('token', newToken);
            }

            this.refreshTokenSubject.next(newToken);

            // Retry request với token mới
            return next.handle(this.addToken(request, newToken));
          }),
          catchError((err) => {
            this.isRefreshing = false;

            // Nếu refresh token thất bại, đăng xuất và chuyển về trang login
            this.authService.logout();
            this.router.navigate(['/login']);

            return throwError(() => err);
          })
        );
      } else {
        // Không có refresh token, đăng xuất
        this.authService.logout();
        this.router.navigate(['/login']);
        return throwError(() => new Error('No refresh token available'));
      }
    } else {
      // Đang refresh, chờ token mới
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token));
        })
      );
    }
  }
}

