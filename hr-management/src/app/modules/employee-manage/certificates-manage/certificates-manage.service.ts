import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CertificatesManageService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getCertificatesApi(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    
    // Check role to determine endpoint
    const isHR = this.authService.isHROrAdmin();
    const endpoint = isHR ? '/api/certificates' : '/api/certificates/my';
    
    return this.http.get<any>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  createCertificateApi(body: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/certificates`, body);
  }

  deleteCertificateApi(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/certificates/${id}`);
  }

  getCertificateByIdApi(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/certificates/${id}`);
  }

  updateCertificateApi(id: number | string, body: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/certificates/${id}`, body);
  }
}
