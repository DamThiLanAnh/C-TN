import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notification {
    id: number;
    title: string;
    content: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class AllNotificationService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.apiUrl}/api/notifications`);
    }

    markAsRead(id: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/api/notifications/${id}/read`, {});
    }

    markAllAsRead(): Observable<any> {
        return this.http.post(`${this.apiUrl}/api/notifications/mark-all-read`, {});
    }
}
