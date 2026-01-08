import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TimekeepingExplanationRequest {
  workDate: string;
  proposedCheckIn: string;
  proposedCheckOut: string;
  reason: string;
}

export interface TimekeepingExplanationQueryParams {
  page?: number;
  size?: number;
  employeeCode?: string;
  department?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TimekeepingExplanationService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // HR/Admin/Manager get all timekeeping explanations with optional filters
  getAllTimekeepingExplanations(params: TimekeepingExplanationQueryParams = {}): Observable<any> {
    const { page = 0, size = 10, employeeCode, department, fromDate, toDate, status } = params;

    let httpParams: any = {
      page: page.toString(),
      size: size.toString()
    };

    // Add optional filter parameters if provided
    if (employeeCode) {
      httpParams.employeeCode = employeeCode;
    }
    if (department) {
      httpParams.department = department;
    }
    if (fromDate) {
      httpParams.fromDate = fromDate;
    }
    if (toDate) {
      httpParams.toDate = toDate;
    }
    if (status) {
      httpParams.status = status;
    }

    console.log('🔵 Calling API /api/timekeeping-explanations with params:', httpParams);

    return this.http.get(`${this.baseUrl}/api/timekeeping-explanations`, {
      params: httpParams
    });
  }

  // Manager get department timekeeping explanations with optional filters
  getTimekeepingByDepartment(params: TimekeepingExplanationQueryParams = {}): Observable<any> {
    const { page = 0, size = 10, employeeCode, department, fromDate, toDate, status } = params;

    let httpParams: any = {
      page: page.toString(),
      size: size.toString()
    };

    // Add optional filter parameters if provided
    if (employeeCode) {
      httpParams.employeeCode = employeeCode;
    }
    if (department) {
      httpParams.department = department;
    }
    if (fromDate) {
      httpParams.fromDate = fromDate;
    }
    if (toDate) {
      httpParams.toDate = toDate;
    }
    if (status) {
      httpParams.status = status;
    }

    console.log('🔵 Manager calling API /api/timekeeping-explanations with params:', httpParams);

    // Manager uses same endpoint - backend filters by manager's department automatically
    return this.http.get(`${this.baseUrl}/api/timekeeping-explanations/pending`, {
      params: httpParams
    });
  }

  // Employee get their own timekeeping explanations
  getTimekeepingMy(page: number = 0, size: number = 10): Observable<any> {
    console.log('🔵 Employee calling API /api/timekeeping-explanations');

    return this.http.get(`${this.baseUrl}/api/timekeeping-explanations`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    });
  }

  // Employee submit a timekeeping explanation request
  addTimekeepingExplanation(body: TimekeepingExplanationRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': '*/*'
    });

    console.log('🔵 Calling POST API /api/timekeeping-explanations with body:', body);

    return this.http.post(`${this.baseUrl}/api/timekeeping-explanations`, body, { headers });
  }

  // HR/Admin delete a timekeeping explanation
  deleteTimekeepingExplanation(id: number): Observable<any> {
    const headers = new HttpHeaders({
      'accept': '*/*'
    });

    // TODO: Replace with actual API endpoint
    // return this.http.delete(`${this.baseUrl}/api/timekeeping-explanation/admin/${id}`, { headers });

    // Mock response
    return of({ success: true });
  }

  // Approve timekeeping explanation
  approveTimekeepingExplanation(id: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': '*/*'
    });

    // TODO: Replace with actual API endpoint
    // return this.http.put(`${this.baseUrl}/api/timekeeping-explanation/${id}/approve`, {}, { headers });

    // Mock response
    return of({ success: true, message: 'Duyệt thành công' });
  }

  // Reject timekeeping explanation
  rejectTimekeepingExplanation(id: number, reason?: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': '*/*'
    });

    // TODO: Replace with actual API endpoint
    // return this.http.put(`${this.baseUrl}/api/timekeeping-explanation/${id}/reject`, { reason }, { headers });

    // Mock response
    return of({ success: true, message: 'Từ chối thành công' });
  }

}

