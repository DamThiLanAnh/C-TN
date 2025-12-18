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

@Injectable({
  providedIn: 'root'
})
export class LeaveManagementService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getLeaveAll(page: number = 0, size: number = 10): Observable<any> {
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

  addLeaveRequest(body: LeaveRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': '*/*'
    });

    return this.http.post(`${this.baseUrl}/api/leave`, body, { headers });
  }
}
