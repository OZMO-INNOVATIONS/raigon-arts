import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Customer, Order, FrameSize, WorkshopSettings, NotificationItem } from './storage';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('raigon_auth_token_v1');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // --- 1. AUTHENTICATION & RECOVERY ---
  login(credentials: { username: string; password: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth/login`, credentials, { headers: this.getHeaders() });
  }

  sendOtp(phone: string): Observable<ApiResponse<{ sessionId: string; targetPhone: string; expiresInSeconds: number; resendAvailableInSeconds: number }>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth/forgot-password/send-otp`, { phone }, { headers: this.getHeaders() });
  }

  verifyOtp(sessionId: string, otpCode: string): Observable<ApiResponse<{ resetToken: string; expiresInSeconds: number }>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth/forgot-password/verify-otp`, { sessionId, otpCode }, { headers: this.getHeaders() });
  }

  resetPassword(payload: { resetToken: string; newPassword: string; confirmPassword: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth/forgot-password/reset-password`, payload, { headers: this.getHeaders() });
  }

  getMe(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/auth/me`, { headers: this.getHeaders() });
  }

  // --- 2. DASHBOARD ---
  getDashboardStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/dashboard/stats`, { headers: this.getHeaders() });
  }

  getRecentOrders(limit: number = 10): Observable<ApiResponse<Order[]>> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<ApiResponse<Order[]>>(`${this.baseUrl}/dashboard/recent-orders`, { headers: this.getHeaders(), params });
  }

  // --- 3. CUSTOMERS ---
  getCustomers(search?: string, page: number = 1, limit: number = 50): Observable<ApiResponse<{ total: number; customers: Customer[] }>> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<{ total: number; customers: Customer[] }>>(`${this.baseUrl}/customers`, { headers: this.getHeaders(), params });
  }

  getCustomer(id: string): Observable<ApiResponse<{ customer: Customer; orders: Order[] }>> {
    return this.http.get<ApiResponse<{ customer: Customer; orders: Order[] }>>(`${this.baseUrl}/customers/${id}`, { headers: this.getHeaders() });
  }

  createCustomer(customer: Partial<Customer>): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(`${this.baseUrl}/customers`, customer, { headers: this.getHeaders() });
  }

  updateCustomer(id: string, customer: Partial<Customer>): Observable<ApiResponse<Customer>> {
    return this.http.put<ApiResponse<Customer>>(`${this.baseUrl}/customers/${id}`, customer, { headers: this.getHeaders() });
  }

  deleteCustomer(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/customers/${id}`, { headers: this.getHeaders() });
  }

  // --- 4. ORDERS ---
  getOrders(status?: string, paymentStatus?: string, search?: string): Observable<ApiResponse<{ total: number; orders: Order[] }>> {
    let params = new HttpParams();
    if (status && status !== 'All') params = params.set('status', status);
    if (paymentStatus && paymentStatus !== 'All') params = params.set('paymentStatus', paymentStatus);
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<{ total: number; orders: Order[] }>>(`${this.baseUrl}/orders`, { headers: this.getHeaders(), params });
  }

  getOrder(id: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.baseUrl}/orders/${id}`, { headers: this.getHeaders() });
  }

  createOrder(payload: { customer: Partial<Customer>; order: any }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/orders`, payload, { headers: this.getHeaders() });
  }

  updateOrderStatus(id: string, orderStatus: string, remarks?: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/orders/${id}/status`, { orderStatus, remarks }, { headers: this.getHeaders() });
  }

  updateOrder(id: string, order: Partial<Order>): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.baseUrl}/orders/${id}`, order, { headers: this.getHeaders() });
  }

  deleteOrder(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/orders/${id}`, { headers: this.getHeaders() });
  }

  // --- 5. PHOTOS ---
  getPhotos(orientation?: string, search?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams();
    if (orientation && orientation !== 'All') params = params.set('orientation', orientation);
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/photos`, { headers: this.getHeaders(), params });
  }

  uploadPhotos(photos: any[], orderId?: string): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(`${this.baseUrl}/photos/upload`, { photos, orderId }, { headers: this.getHeaders() });
  }

  // --- 6. FRAME SIZES ---
  getFrames(search?: string): Observable<ApiResponse<FrameSize[]>> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<FrameSize[]>>(`${this.baseUrl}/frames`, { headers: this.getHeaders(), params });
  }

  createFrame(frame: Partial<FrameSize>): Observable<ApiResponse<FrameSize>> {
    return this.http.post<ApiResponse<FrameSize>>(`${this.baseUrl}/frames`, frame, { headers: this.getHeaders() });
  }

  updateFrame(id: string, frame: Partial<FrameSize>): Observable<ApiResponse<FrameSize>> {
    return this.http.put<ApiResponse<FrameSize>>(`${this.baseUrl}/frames/${id}`, frame, { headers: this.getHeaders() });
  }

  deleteFrame(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/frames/${id}`, { headers: this.getHeaders() });
  }

  // --- 7. REPORTS ---
  getFinancialReports(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/reports/financials`, { headers: this.getHeaders() });
  }

  getProductionBreakdown(): Observable<ApiResponse<{ type: string; count: number; percentage: number }[]>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/reports/production-breakdown`, { headers: this.getHeaders() });
  }

  getExportCsvUrl(): string {
    return `${this.baseUrl}/reports/export-csv`;
  }

  // --- 8. SETTINGS ---
  getSettings(): Observable<ApiResponse<WorkshopSettings>> {
    return this.http.get<ApiResponse<WorkshopSettings>>(`${this.baseUrl}/settings`, { headers: this.getHeaders() });
  }

  updateSettings(settings: Partial<WorkshopSettings>): Observable<ApiResponse<WorkshopSettings>> {
    return this.http.put<ApiResponse<WorkshopSettings>>(`${this.baseUrl}/settings`, settings, { headers: this.getHeaders() });
  }

  // --- 9. NOTIFICATIONS ---
  getNotifications(): Observable<ApiResponse<{ unreadCount: number; notifications: NotificationItem[] }>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/notifications`, { headers: this.getHeaders() });
  }

  markAllNotificationsRead(): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/notifications/mark-all-read`, {}, { headers: this.getHeaders() });
  }

  // --- 10. BACKUP & RESTORE ---
  exportBackup(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/backup/export`, { headers: this.getHeaders() });
  }

  restoreBackup(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/backup/restore`, data, { headers: this.getHeaders() });
  }
}
