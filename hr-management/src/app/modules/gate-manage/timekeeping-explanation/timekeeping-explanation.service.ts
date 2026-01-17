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

  constructor(private http: HttpClient) { }

  // HR/Admin/Manager lay danh sach giai trinh cong voi bo loc tuy chon
  getAllTimekeepingExplanations(params: TimekeepingExplanationQueryParams = {}): Observable<any> {
    const { page = 0, size = 10, employeeCode, department, fromDate, toDate, status } = params;

    let httpParams: any = {
      page: page.toString(),
      size: size.toString()
    };

    // Them tham so loc tuy chon neu co
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

    return this.http.get(`${this.baseUrl}/api/timekeeping-explanations`, {
      params: httpParams
    });
  }

  // Manager lay danh sach giai trinh cong phong ban voi bo loc tuy chon
  getTimekeepingByDepartment(params: TimekeepingExplanationQueryParams = {}): Observable<any> {
    const { page = 0, size = 10, employeeCode, department, fromDate, toDate, status } = params;

    let httpParams: any = {
      page: page.toString(),
      size: size.toString()
    };

    // Them tham so loc tuy chon neu co
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

    // Manager su dung cung endpoint - backend tu dong loc theo phong ban cua quan ly
    return this.http.get(`${this.baseUrl}/api/timekeeping-explanations/pending`, {
      params: httpParams
    });
  }

  // Nhan vien lay danh sach giai trinh cong cua minh
  // Nhan vien lay danh sach giai trinh cong cua minh
  getTimekeepingMy(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/timekeeping-explanations`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    });
  }

  // Lay danh sach giai trinh cong can duyet (cho Manager/Admin)
  getPendingTimekeepingExplanationsApi(params: TimekeepingExplanationQueryParams = {}): Observable<any> {
    const { page = 0, size = 10, employeeCode, department, fromDate, toDate, status } = params;

    let httpParams: any = {
      page: page.toString(),
      size: size.toString()
    };

    if (employeeCode) httpParams.employeeCode = employeeCode;
    if (department) httpParams.department = department;
    if (fromDate) httpParams.fromDate = fromDate;
    if (toDate) httpParams.toDate = toDate;
    if (status) httpParams.status = status;

    return this.http.get(`${this.baseUrl}/api/timekeeping-explanations/pending`, {
      params: httpParams
    });
  }

  // Nhan vien gui yeu cau giai trinh cong
  addTimekeepingExplanation(body: TimekeepingExplanationRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': '*/*'
    });

    return this.http.post(`${this.baseUrl}/api/timekeeping-explanations`, body, { headers });
  }

  // HR/Admin xoa giai trinh cong
  deleteTimekeepingExplanation(id: number): Observable<any> {
    const headers = new HttpHeaders({
      'accept': '*/*'
    });

    // TODO: Replace with actual API endpoint
    // return this.http.delete(`${this.baseUrl}/api/timekeeping-explanation/admin/${id}`, { headers });

    // Mock response
    return of({ success: true });
  }

  // Duyet/Tu choi nhieu giai trinh cong
  bulkDecisionTimekeepingExplanationApi(body: { ids: number[], action: 'APPROVE' | 'REJECT', managerNote?: string }): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/api/timekeeping-explanations/bulk-decision`, body);
  }
}

