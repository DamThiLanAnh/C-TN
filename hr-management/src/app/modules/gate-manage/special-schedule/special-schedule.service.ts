import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpecialScheduleService {
  private baseUrl = `${environment.apiUrl}/api/special-schedules`;

  constructor(private http: HttpClient) {}

  searchApi(body: any, params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.post<any>(`${this.baseUrl}/search`, body, { params: httpParams });
  }

  // API for employee role - get their own special schedules
  getMySpecialSchedulesApi(params: any): Observable<any> {
    // Simplify params - only send page and size like leave API
    const httpParams = new HttpParams()
      .set('page', params.page !== undefined ? params.page.toString() : '0')
      .set('size', params.size !== undefined ? params.size.toString() : '10');

    const url = `${this.baseUrl}/my`;
    console.log('🔵 ===== GET MY SPECIAL SCHEDULES API =====');
    console.log('🔵 Full URL:', url);
    console.log('🔵 Base URL:', this.baseUrl);
    console.log('🔵 Environment API URL:', environment.apiUrl);
    console.log('🔵 Params object:', params);
    console.log('🔵 HttpParams string:', httpParams.toString());
    console.log('🔵 Final URL with params:', `${url}?${httpParams.toString()}`);
    console.log('🔵 Page:', params.page, '| Size:', params.size);

    // Log token from localStorage
    const token = localStorage.getItem('token');
    console.log('🔵 Token in localStorage (from service):', token ? token.substring(0, 30) + '...' : 'NULL');

    // Don't set headers here - let interceptor handle it
    console.log('🔵 Making HTTP GET request...');
    return this.http.get<any>(url, { params: httpParams });
  }

  exportApi(body: any, params: any): Observable<Blob> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.post(`${this.baseUrl}/export`, body, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  findByIdApi(id: string | number): Observable<any> {
    console.log('🔵 Calling GET API /special-schedules/' + id);
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  approveByIdApi(body: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/approve`, body);
  }

  rejectByIdApi(body: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reject`, body);
  }

  approveByListIdsApi(body: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/approve-list`, body);
  }

  rejectByListIdsApi(body: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reject-list`, body);
  }
}

