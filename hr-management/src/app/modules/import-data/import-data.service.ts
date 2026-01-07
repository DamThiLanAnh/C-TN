import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ImportDataService {
    private baseUrl = `${environment.apiUrl}/api/attendance`;
    private salaryUrl = `${environment.apiUrl}/api/salary`;

    constructor(private http: HttpClient) { }

    importAttendance(month: string, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);

        // month param is required: ?month=yyyy-MM
        const params = new HttpParams().set('month', month);

        return this.http.post(`${this.baseUrl}/import`, formData, { params });
    }

    getImportHistories(month: string, page: number, size: number): Observable<any> {
        const params = new HttpParams()
            .set('month', month)
            .set('page', page)
            .set('size', size);
        return this.http.get(`${this.baseUrl}/import-histories`, { params });
    }

    importSalary(month: string, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        const params = new HttpParams().set('month', month);
        return this.http.post(`${this.salaryUrl}/import`, formData, { params });
    }

    getSalaryImportHistories(month: string, page: number, size: number): Observable<any> {
        const params = new HttpParams()
            .set('month', month)
            .set('page', page)
            .set('size', size);
        return this.http.get(`${this.salaryUrl}/import-histories`, { params });
    }
}
