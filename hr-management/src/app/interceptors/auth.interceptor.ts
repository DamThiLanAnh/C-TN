import { Injectable, Injector } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, switchMap, filter, take, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private injector: Injector) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authService = this.injector.get(AuthService);
    const token = authService.getToken();

    let authReq = req;
    // Skip adding token for login and refresh endpoints
    if (token && !req.url.includes('/auth/refresh') && !req.url.includes('/auth/login')) {
      authReq = this.addToken(req, token);
    }

    return next.handle(authReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // If 401 comes from login or refresh, we can't do anything, just throw
          if (req.url.includes('auth/login') || req.url.includes('auth/refresh')) {
            return throwError(error);
          }
          return this.handle401Error(authReq, next);
        }
        return throwError(error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    const authService = this.injector.get(AuthService);

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      const refreshToken = authService.getRefreshToken();

      if (refreshToken) {
        return authService.refreshToken(refreshToken).pipe(
          switchMap((tokenResponse: any) => {
            this.isRefreshing = false;
            authService.saveTokens(tokenResponse);
            const newToken = authService.getToken();
            if (newToken) {
              this.refreshTokenSubject.next(newToken);
              return next.handle(this.addToken(request, newToken));
            }
            return throwError('Refreshed token not found');
          }),
          catchError((err) => {
            this.isRefreshing = false;
            authService.logout();
            return throwError(err);
          })
        );
      } else {
        this.isRefreshing = false;
        authService.logout();
        return throwError('No refresh token');
      }
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt!));
        })
      );
    }
  }
}

