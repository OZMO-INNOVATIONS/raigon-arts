import { Component, HostListener } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from './components/sidebar/sidebar';
import { NewOrder } from './pages/new-order/new-order';
import { Login } from './pages/login/login';
import { NewOrderService } from './services/new-order.service';
import { AuthService } from './services/auth.service';
import { SearchService, QuickSearchResult } from './services/search.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, RouterOutlet, NewOrder, Login],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(
    private newOrderService: NewOrderService,
    public authService: AuthService,
    public searchService: SearchService,
    private router: Router
  ) { }

  openNewOrder(): void {
    this.newOrderService.openOrder();
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchService.setQuery(val);

    // As in the original project: navigating to customers displays matching results live
    if (val.trim() && this.router.url.split('?')[0] !== '/customers') {
      this.router.navigate(['/customers']);
    }
  }

  onSearchEnter(): void {
    this.searchService.closeDropdown();
    if (this.router.url.split('?')[0] !== '/customers') {
      this.router.navigate(['/customers']);
    }
  }

  selectResult(item: QuickSearchResult): void {
    this.searchService.setQuery(item.name || item.id);
    this.searchService.closeDropdown();
    this.router.navigate(['/customers']);
  }

  viewAllResults(): void {
    this.searchService.closeDropdown();
    this.router.navigate(['/customers']);
  }

  clearSearch(): void {
    this.searchService.clear();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'In Progress':
        return 'badge-in-progress';
      case 'Completed':
        return 'badge-completed';
      case 'Delivered':
        return 'badge-delivered';
      case 'Cancelled':
        return 'badge-cancelled';
      default:
        return 'badge-pending';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.header-search')) {
      this.searchService.closeDropdown();
    }
  }
}