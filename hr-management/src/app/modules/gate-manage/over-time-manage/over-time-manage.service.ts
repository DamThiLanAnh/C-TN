import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from "../../../services/auth.service";

@Injectable({
  providedIn: 'root'
})
export class OverTimeManageService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getOverTimesApi(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    // Check role to determine endpoint
    const isManager = this.authService.isManager();
    const endpoint = isManager ? '/api/ots/manager' : '/api/ots/my';
    
    return this.http.get<any>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  createOverTimeApi(body: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/ots`, body);
  }

  deleteOverTimeApi(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/ots/${id}`);
  }

  getOverTimeByIdApi(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ots/${id}`);
  }

  updateOverTimeApi(id: number | string, body: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/ots/${id}`, body);
  }

  respondToOtApi(id: number | string, body: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/api/ots/participants/${id}/response`, body);
  }
}
