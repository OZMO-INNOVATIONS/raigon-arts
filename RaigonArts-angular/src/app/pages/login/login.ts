import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { StorageService } from '../../services/storage';

export interface FormErrors {
  username?: string;
  password?: string;
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit, OnDestroy {
  // 1 = Sign In, 2 = Forgot Phone, 3 = OTP, 4 = Create New Password
  currentScreen: number = 1;

  // Screen 1: Sign In
  username: string = 'admin';
  password: string = 'raigon2026';
  showPassword: boolean = false;

  // Screen 2: Forgot Password Phone
  forgotPhone: string = '+91 7902261255';

  // Screen 3: Enter OTP
  forgotOtpCode: string = '';

  // Screen 4: Create New Password
  resetNewPassword: string = '';
  resetConfirmPassword: string = '';
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  // Field validation errors
  errors: FormErrors = {};

  constructor(
    public authService: AuthService,
    private storage: StorageService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    const settings = this.storage.getSettings();
    if (settings.registeredPhone) {
      this.forgotPhone = settings.registeredPhone;
    }
  }

  // --- PASSWORD VISIBILITY TOGGLES ---
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // --- SCREEN NAVIGATION ---
  goToScreen(screenNumber: number): void {
    this.currentScreen = screenNumber;
    this.errors = {};
    if (screenNumber === 1) {
      this.authService.stopOtpTimer();
    }
  }

  clearError(field: keyof FormErrors): void {
    if (this.errors[field]) {
      delete this.errors[field];
    }
  }

  // --- SCREEN 1: SIGN IN ---
  onLogin(e: Event): void {
    e.preventDefault();
    this.errors = {};

    let hasError = false;

    if (!this.username || !this.username.trim()) {
      this.errors.username = 'Please enter your phone number or username.';
      hasError = true;
    }

    if (!this.password) {
      this.errors.password = 'Please enter your password.';
      hasError = true;
    }

    if (hasError) return;

    const success = this.authService.login(this.username.trim(), this.password);
    if (!success) {
      this.errors.password = 'Invalid username or password. Please try again.';
      this.toast.error('Invalid workshop credentials.');
    }
  }

  // --- SCREEN 2: SEND OTP ---
  sendOTP(e: Event): void {
    e.preventDefault();
    this.errors = {};
    this.forgotOtpCode = '';
    this.currentScreen = 3;
    this.authService.startOtpTimer();
    this.toast.success(`OTP sent to WhatsApp on ${this.forgotPhone}`);
  }

  // --- SCREEN 3: RESEND & VERIFY OTP ---
  resendOTP(): void {
    if (!this.authService.canResendOtp()) return;
    this.errors = {};
    this.authService.startOtpTimer();
    this.toast.info(`New OTP sent to WhatsApp on ${this.forgotPhone}`);
  }

  verifyOTP(e: Event): void {
    e.preventDefault();
    this.errors = {};

    if (!this.forgotOtpCode || !this.forgotOtpCode.trim()) {
      this.errors.otp = 'Please enter the 4-digit verification code.';
      return;
    }

    if (this.forgotOtpCode.trim().length < 4) {
      this.errors.otp = 'Please enter a valid 4-digit OTP code.';
      return;
    }

    this.authService.stopOtpTimer();
    this.toast.success('OTP verified successfully!');
    this.currentScreen = 4;
  }

  // --- SCREEN 4: SAVE NEW PASSWORD ---
  submitNewPassword(e: Event): void {
    e.preventDefault();
    this.errors = {};

    let hasError = false;

    if (!this.resetNewPassword) {
      this.errors.newPassword = 'Please enter a new password.';
      hasError = true;
    } else if (this.resetNewPassword.length < 6) {
      this.errors.newPassword = 'Password must be at least 6 characters.';
      hasError = true;
    }

    if (!this.resetConfirmPassword) {
      this.errors.confirmPassword = 'Please confirm your new password.';
      hasError = true;
    } else if (this.resetNewPassword !== this.resetConfirmPassword) {
      this.errors.confirmPassword = 'Passwords do not match.';
      hasError = true;
    }

    if (hasError) return;

    // Save updated password in local storage & auth settings
    localStorage.setItem('raigon_admin_pass', this.resetNewPassword);
    this.toast.success('Password reset successfully! Please sign in with your new password.');

    // Return to Sign In Screen
    this.password = '';
    this.resetNewPassword = '';
    this.resetConfirmPassword = '';
    this.currentScreen = 1;
  }

  ngOnDestroy(): void {
    this.authService.stopOtpTimer();
  }
}
