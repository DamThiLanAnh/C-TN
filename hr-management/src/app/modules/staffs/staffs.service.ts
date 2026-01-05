import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StaffsService {
    private apiUrl = `${environment.apiUrl}/api`;

    constructor(private http: HttpClient) { }

    getMyAttendance(date: Date): Observable<any> {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const formattedDate = `${year}-${month}`;
        
        const params = new HttpParams().set('month', formattedDate);
        const headers = new HttpHeaders({ 'Accept': '*/*' });
        return this.http.get(`${this.apiUrl}/attendance/my`, { params, headers });
    }

    getEmployeeDetail(id: number): Observable<any> {
        const headers = new HttpHeaders({ 'Accept': '*/*' });
        return this.http.get(`${this.apiUrl}/employees/${id}`, { headers });
    }
}
