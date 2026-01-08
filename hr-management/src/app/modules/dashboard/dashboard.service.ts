import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardOverview {
    month: string;
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    lockedEmployees: number;
    totalDepartments: number;
    attendance: {
        totalWorkingDays: number;
        lateCount: number;
        lateEmployees: number;
        lateRate: number;
    };
    overtime: {
        totalOtMinutes: number;
        totalOtHours: number;
        otEmployees: number;
    };
    salary: {
        totalPaidSalary: number;
        totalOtSalary: number;
        averageSalary: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private baseUrl = `${environment.apiUrl}/api/dashboard`;

    constructor(private http: HttpClient) { }

    getOverview(month: string): Observable<DashboardOverview> {
        const params = new HttpParams().set('month', month);
        return this.http.get<DashboardOverview>(`${this.baseUrl}/overview`, { params });
    }
}
