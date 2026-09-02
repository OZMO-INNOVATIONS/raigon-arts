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
  }

  onSubmit(event?: Event): void {
    if (event) event.preventDefault();
    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your email.';
      return;
    }
    if (!this.password.trim()) {
      this.errorMessage = 'Please enter your password.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login({
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/'], { replaceUrl: true });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password. Please check your credentials.';
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
