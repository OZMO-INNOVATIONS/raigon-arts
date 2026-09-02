import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NewOrderService } from '../../services/new-order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {

  isCollapsed = false;
  activeMenu = 'dashboard';

  constructor(
    private newOrderService: NewOrderService,
    private authService: AuthService,
    private router: Router
  ) { }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  openNewOrder(): void {
    console.log('New Order clicked');
    this.newOrderService.openOrder();
  }

  navigate(menu: string): void {
    this.activeMenu = menu;
  }

  logout(): void {
    console.log('Logout clicked');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}