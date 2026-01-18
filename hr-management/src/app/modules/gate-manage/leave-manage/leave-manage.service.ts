import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

export interface LeaveRequest {
  employeeId: number;
  type: string;
  leaveDate: string;
  duration: string;
  reason: string;
}

export interface LeaveQueryParams {
  page?: number;
  size?: number;
  employeeName?: string;
  department?: string;
  status?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeaveManagementService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // lay tat ca yeu cau (HR/Admin)
  getAllLeaveRequests(params: LeaveQueryParams = {}): Observable<any> {
    const { page = 0, size = 10, employeeName, department, status, type } = params;

    let httpParams: any = {
      page: page.toString(),
      size: size.toString()
    };

    // them tham so loc
    if (employeeName) {
      httpParams.employeeName = employeeName;
    }
    if (department) {
      httpParams.department = department;
    }
    if (status) {
      httpParams.status = status;
    }
    if (type) {
      httpParams.type = type;
    }

    return this.http.get(`${this.baseUrl}/api/leave`, {
      params: httpParams
    });
  }

  // lay yeu cau cua toi
  getLeaveMy(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/leave/my`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    });
  }

  // lay yeu cau theo phong ban
  getLeaveByDepartment(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/leave/department`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    });
  }

  // tao yeu cau moi
  addLeaveRequest(body: LeaveRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': '*/*'
    });

    return this.http.post(`${this.baseUrl}/api/leave`, body, { headers });
  }

  // cap nhat yeu cau
  updateLeaveRequest(id: number, body: LeaveRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': '*/*'
    });
    return this.http.put(`${this.baseUrl}/api/leave/${id}`, body, { headers });
  }

  // xoa yeu cau (HR)
  deleteLeaveRequest(leaveId: number): Observable<any> {
    const url = `${this.baseUrl}/api/leave/hr/${leaveId}`;
    console.log('🔍 DELETE URL:', url);
    console.log('🔍 BaseUrl:', this.baseUrl);
    console.log('🔍 Leave ID:', leaveId);

    const headers = new HttpHeaders({
      'accept': '*/*'
    });

    return this.http.delete(url, { headers });
  }

  // lay danh sach phong ban
  getActiveDepartments(): Observable<any> {
    console.log('LeaveManagementService.getActiveDepartments called');
    return this.http.get(`${this.baseUrl}/api/departments`); // Fixed: departments (plural)
  }

  // lay yeu cau cho duyet
  getPendingLeaves(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/leave/pending`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    });
  }

  // duyet hoac tu choi
  decisionLeaveRequest(body: { ids: number[], action: 'APPROVE' | 'REJECT', managerNote?: string }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': '*/*'
    });
    return this.http.patch(`${this.baseUrl}/api/leave/decision`, body, { headers });
  }
}
