import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  email = '';
  password = '';
  rememberMe = true;
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.errorMessage = '';
    this.isLoading = false;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onInputChange(): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  onSubmit(event?: Event): void {
    if (event) event.preventDefault();

    if (this.isLoading) {
      return;
    }

    const emailTrimmed = this.email ? this.email.trim() : '';
    const passwordTrimmed = this.password ? this.password.trim() : '';

    if (!emailTrimmed) {
      this.errorMessage = 'Email is required.';
      this.isLoading = false;
      return;
    }

    if (!this.isValidEmail(emailTrimmed)) {
      this.errorMessage = 'Please enter a valid email address.';
      this.isLoading = false;
      return;
    }

    if (!passwordTrimmed) {
      this.errorMessage = 'Password is required.';
      this.isLoading = false;
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login({
      email: emailTrimmed,
      password: this.password
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.success) {
          this.errorMessage = '';
          this.router.navigate(['/'], { replaceUrl: true });
        } else {
          this.errorMessage = 'Invalid email or password.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password.';
      }
    });
  }

  quickDemoBypass(): void {
    this.onSubmit();
  }

  forgotPassword(event: Event): void {
    event.preventDefault();
    this.errorMessage = 'Please contact your administrator to reset your password.';
  }
}
