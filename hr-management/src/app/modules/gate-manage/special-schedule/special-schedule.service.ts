import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpecialScheduleService {
  private baseUrl = `${environment.apiUrl}/special-schedules`;

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

  findByIdApi(id: string): Observable<any> {
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

