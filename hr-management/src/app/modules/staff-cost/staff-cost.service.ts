import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StaffCostService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getMySalary(page: number, size: number): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get(`${this.baseUrl}/api/salaries/my/list`, { params });
    }

    getSalaryDetail(month: number, year: number): Observable<any> {
        let params = new HttpParams()
            .set('month', month.toString())
            .set('year', year.toString());

        return this.http.get(`${this.baseUrl}/api/salaries/my`, { params });
    }
}
