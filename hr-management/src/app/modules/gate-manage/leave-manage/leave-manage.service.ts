import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

export interface LeaveRequest {
  employeeId: number;
  type: string;
  startDate: string;
  endDate: string;
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

  // HR/Admin get all leave requests with optional filters
  getAllLeaveRequests(params: LeaveQueryParams = {}): Observable<any> {
    const { page = 0, size = 10, employeeName, department, status, type } = params;

    let httpParams: any = {
      page: page.toString(),
      size: size.toString()
    };

    // Add optional filter parameters if provided
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

  // employee get his/her leave requests
  getLeaveMy(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/leave/my`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    });
  }

  // Get leave requests by department (for managers)
  getLeaveByDepartment(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/leave/department`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    });
  }

  //employee submit a leave request
  addLeaveRequest(body: LeaveRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': '*/*'
    });

    return this.http.post(`${this.baseUrl}/api/leave`, body, { headers });
  }

  // update leave request
  updateLeaveRequest(id: number, body: LeaveRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': '*/*'
    });
    return this.http.put(`${this.baseUrl}/api/leave/${id}`, body, { headers });
  }

  // HR delete a leave request (only HR has permission)
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

  // Get active departments for dropdown
  getActiveDepartments(): Observable<any> {
    console.log('LeaveManagementService.getActiveDepartments called');
    return this.http.get(`${this.baseUrl}/api/departments`); // Fixed: departments (plural)
  }

  // Get pending leave requests
  getPendingLeaves(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/leave/pending`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    });
  }

  // Approve or Reject leave request
  reviewLeaveRequest(id: number, body: { action: 'APPROVE' | 'REJECT', managerNote: string }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': '*/*'
    });
    return this.http.patch(`${this.baseUrl}/api/leave/${id}/decision`, body, { headers });
  }
}
