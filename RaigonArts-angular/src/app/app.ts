import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Sidebar } from './components/sidebar/sidebar';
import { Header } from './components/header/header';
import { Modal } from './components/modal/modal';
import { Toast } from './components/toast/toast';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, Header, Modal, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  isSidebarCollapsed = false;
  isLoginPage = signal<boolean>(true);

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.isLoginPage.set(url.includes('/login') || url === '/');
    });
  }
}
