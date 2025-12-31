import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpecialScheduleService {
  private baseUrl = `${environment.apiUrl}/api/special-schedules`;

  constructor(private http: HttpClient) {
  }

  getMySpecialSchedulesApi(params: any): Observable<any> {
    // Simplify params - only send page and size like leave API
    const httpParams = new HttpParams()
      .set('page', params.page !== undefined ? params.page.toString() : '0')
      .set('size', params.size !== undefined ? params.size.toString() : '10');

    const url = `${this.baseUrl}/my`;

    return this.http.get<any>(url, {params: httpParams});
  }

  getMyApprovalsSpecialSchedulesApi(params: any): Observable<any> {
    const httpParams = new HttpParams()
      .set('page', params.page !== undefined ? params.page.toString() : '0')
      .set('size', params.size !== undefined ? params.size.toString() : '10');
    return this.http.get<any>(`${this.baseUrl}/my-approvals`, {params: httpParams});
  }

  findByIdApi(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  getDepartmentSpecialSchedulesApi(params: any): Observable<any> {
    const httpParams = new HttpParams()
      .set('page', params.page !== undefined ? params.page.toString() : '0')
      .set('size', params.size !== undefined ? params.size.toString() : '10');
    return this.http.get<any>(`${this.baseUrl}/department`, {params: httpParams});
  }

  createSpecialScheduleApi(body: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, body);
  }

  updateSpecialScheduleApi(id: number | string, body: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, body);
  }

  deleteSpecialScheduleApi(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
