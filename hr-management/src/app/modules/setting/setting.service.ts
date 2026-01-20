import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  getAuditLogs(page: number, size: number, filters: any = {}): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    // User requested explicit headers
    const headers = new HttpHeaders({
      'Accept': '*/*'
    });

    return this.http.get(`${this.apiUrl}/audit`, { params, headers });
  }

  getUsers(page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get(`${environment.apiUrl}/api/users`, { params });
  }

  getEmployeesNoUser(page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get(`${environment.apiUrl}/api/employees/no-user`, { params });
  }

  createUserFromEmployee(employeeId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/users/from-employee/${employeeId}`, {});
  }

  updateUserRoles(userId: number, roles: string[]): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/users/${userId}/roles`, roles);
  }

  lockUser(userId: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/users/${userId}/lock`, {});
  }

  deactivateUser(userId: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/users/${userId}/deactivate`, {});
  }

  activateUser(userId: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/users/${userId}/activate`, {});
  }

  resetPassword(userId: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/users/${userId}/reset-password`, {});
  }
}
