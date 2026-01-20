import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PersonalApprovalConfigResponse, DepartmentApprovalConfigResponse } from './approve-schedule-config.model';

@Injectable({
    providedIn: 'root'
})
export class ApproveScheduleConfigService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getPersonalApprovalConfigs(page: number = 0, size: number = 10): Observable<PersonalApprovalConfigResponse> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<PersonalApprovalConfigResponse>(`${this.baseUrl}/api/approval-configs/personal`, { params });
    }

    getDepartmentApprovalConfigs(page: number = 0, size: number = 10): Observable<DepartmentApprovalConfigResponse> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<DepartmentApprovalConfigResponse>(`${this.baseUrl}/api/approval-configs/departments`, { params });
    }

    getAllUsers(page: number = 0, size: number = 1000): Observable<any> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<any>(`${this.baseUrl}/api/users`, { params });
    }

    createPersonalApprovalConfig(payload: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/api/approval-configs`, payload);
    }

    getAllDepartments(page: number = 0, size: number = 1000): Observable<any> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<any>(`${this.baseUrl}/api/departments`, { params });
    }
}
