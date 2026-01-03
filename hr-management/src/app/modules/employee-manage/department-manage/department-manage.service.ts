import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepartmentManageService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getDepartmentsApi(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    // User requested specifically /api/departments/active
    return this.http.get<any>(`${this.baseUrl}/api/departments`, { params: httpParams });
  }

  createDepartmentApi(body: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/departments`, body);
  }

  deleteDepartmentApi(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/departments/${id}`);
  }

  getDepartmentByIdApi(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/departments/${id}`);
  }

  updateDepartmentApi(id: number | string, body: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/departments/${id}`, body);
  }
}
