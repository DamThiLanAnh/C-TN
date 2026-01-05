import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StaffsService {
    private apiUrl = `${environment.apiUrl}/api`;

    constructor(private http: HttpClient) { }

    getMyAttendance(month: string): Observable<any> {
        const params = new HttpParams().set('month', month);
        return this.http.get(`${this.apiUrl}/attendance/my`, { params });
    }
}
