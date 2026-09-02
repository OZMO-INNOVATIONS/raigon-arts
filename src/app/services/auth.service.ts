import { Injectable, signal, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  success: boolean;
  email: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:5000/api/auth';
  private readonly AUTH_KEY = 'raigon_arts_auth';
  private readonly USER_KEY = 'raigon_arts_user';

  private http = inject(HttpClient);

  readonly isLoggedIn = signal<boolean>(false);
  readonly currentUser = signal<string>('Raigon Manager');
  justLoggedIn = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Fresh application startup always shows login page first
    this.isLoggedIn.set(false);
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        this.isLoggedIn.set(true);
        const displayName = res.name || res.email?.split('@')[0] || 'Raigon Manager';
        this.currentUser.set(displayName);
        this.justLoggedIn = true;
        if (isPlatformBrowser(this.platformId)) {
          sessionStorage.setItem(this.AUTH_KEY, 'true');
          sessionStorage.setItem(this.USER_KEY, displayName);
        }
      })
    );
  }

  logout(): void {
    this.isLoggedIn.set(false);
    this.justLoggedIn = false;
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.AUTH_KEY);
      sessionStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.AUTH_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }
}

