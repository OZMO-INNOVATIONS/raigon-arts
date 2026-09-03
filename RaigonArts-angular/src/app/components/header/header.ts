import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/notification';
import { QuickSearch } from '../quick-search/quick-search';
import { Notifications } from '../notifications/notifications';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [QuickSearch, Notifications],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  constructor(
    public themeService: ThemeService,
    public notifService: NotificationService,
    private router: Router
  ) {}

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }
}
