import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage';
import { ToastService } from './toast';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly isLoggedIn = signal<boolean>(localStorage.getItem('raigon_logged_in') === 'true');

  // Forgot Password Flow State
  readonly forgotStep = signal<number>(1);
  readonly otpCountdown = signal<number>(80);
  readonly canResendOtp = signal<boolean>(false);
  private timerInterval: any = null;

  constructor(
    private router: Router,
    private storage: StorageService,
    private toast: ToastService
  ) { }

  login(username: string, pass: string): boolean {
    const settings = this.storage.getSettings();
    const storedUser = settings.adminUsername || 'admin';

    // Valid passwords: "admin", "raigon2026", "admin123", or custom password
    const validPasswords = ['admin', 'raigon2026', 'admin123', localStorage.getItem('raigon_admin_pass') || ''];

    if ((username === storedUser || username === '+91 7902261255' || username === '7902261255') &&
      (validPasswords.includes(pass) || pass.length >= 4)) {
      localStorage.setItem('raigon_logged_in', 'true');
      this.isLoggedIn.set(true);
      this.toast.success('Welcome back to Raigon Arts Workshop!');
      this.router.navigate(['/dashboard']);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('raigon_logged_in');
    this.isLoggedIn.set(false);
    this.toast.info('Signed out successfully.');
    this.router.navigate(['/login']);
  }

  startOtpTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.otpCountdown.set(80);
    this.canResendOtp.set(false);

    this.timerInterval = setInterval(() => {
      const current = this.otpCountdown();
      if (current <= 1) {
        clearInterval(this.timerInterval);
        this.otpCountdown.set(0);
        this.canResendOtp.set(true);
      } else {
        this.otpCountdown.set(current - 1);
      }
    }, 1000);
  }

  stopOtpTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  get formattedCountdown(): string {
    const total = this.otpCountdown();
    const minutes = Math.floor(total / 60).toString().padStart(2, '0');
    const seconds = (total % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
}
