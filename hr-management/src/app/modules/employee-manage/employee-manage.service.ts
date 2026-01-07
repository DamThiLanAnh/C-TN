import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class EmployeeManageService {
  baseUrl = environment.apiUrl
  contextPath = this.baseUrl + '/api/employees'
  token = environment.bearToken

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'accept': '*/*',
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
  }

  getEmployeeById(id: number | string): Observable<any> {
    return this.http.get(`${this.contextPath}/${id}`, {
      headers: this.getHeaders()
    });
  }

  getEmployees(page: number = 0, size: number = 10, params?: any): Observable<any> {
    let httpParams = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get(this.contextPath, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  createEmployee(employee: any): Observable<any> {
    const payload = {
      fullName: employee.fullName || '',
      dateOfBirth: employee.dateOfBirth || employee.birthDay || null,
      position: employee.position || employee.workPositionName || '',
      departmentId: employee.departmentId || employee.department || null,
      email: employee.email || '',
      phoneNumber: employee.phone || employee.phoneNumber || ''
    };

    return this.http.post(this.contextPath, payload, {
      headers: this.getHeaders()
    });
  }

  updateEmployee(id: number | string, employee: any): Observable<any> {
    // Payload is constructed in component
    const payload = employee;

    return this.http.put(`${this.contextPath}/${id}`, payload, {
      headers: this.getHeaders()
    });
  }


  deleteEmployee(id: number | string): Observable<any> {
    return this.http.delete(`${this.contextPath}/${id}`, {
      headers: this.getHeaders()
    });
  }

  getAllDepartments(page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get(`${this.baseUrl}/api/departments`, {
      headers: this.getHeaders(),
      params: params
    });
  }
}

