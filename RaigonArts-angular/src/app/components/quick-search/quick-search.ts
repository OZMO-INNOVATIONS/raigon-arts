import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageService, Customer, Order, FrameSize } from '../../services/storage';
import { ModalService } from '../../services/modal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quick-search',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="header-search" (click)="$event.stopPropagation()">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input
        type="text"
        id="globalSearchInput"
        [(ngModel)]="searchQuery"
        (input)="onSearchChange()"
        placeholder="Quick search customers, orders, photos..."
      />

      @if (showResults && (matchingCustomers.length > 0 || matchingOrders.length > 0 || matchingFrames.length > 0)) {
        <div class="quick-search-results">
          @if (matchingCustomers.length > 0) {
            <div style="padding: 4px 10px; font-size: 11px; font-weight: 700; color: var(--color-gold-dark);">CUSTOMERS</div>
            @for (c of matchingCustomers; track c.id) {
              <div class="quick-search-item" (click)="selectCustomer(c)">
                <div>
                  <div class="font-semibold text-xs">{{ c.name }}</div>
                  <div class="text-xs text-muted">{{ c.phone }} • {{ c.city }}</div>
                </div>
                <span class="badge badge-in-progress">{{ c.totalOrdersCount || 0 }} orders</span>
              </div>
            }
          }

          @if (matchingOrders.length > 0) {
            <div style="padding: 8px 10px 4px; font-size: 11px; font-weight: 700; color: var(--color-gold-dark);">ORDERS</div>
            @for (o of matchingOrders; track o.id) {
              <div class="quick-search-item" (click)="selectOrder(o)">
                <div>
                  <div class="font-semibold text-xs">{{ o.orderNumber }} — {{ o.customerName }}</div>
                  <div class="text-xs text-muted">₹{{ o.totalAmount }} • {{ o.orderStatus }}</div>
                </div>
                <span class="badge" [class.badge-completed]="o.orderStatus === 'Completed'" [class.badge-in-progress]="o.orderStatus === 'In Progress'">{{ o.orderStatus }}</span>
              </div>
            }
          }

          @if (matchingFrames.length > 0) {
            <div style="padding: 8px 10px 4px; font-size: 11px; font-weight: 700; color: var(--color-gold-dark);">FRAME SIZES</div>
            @for (f of matchingFrames; track f.id) {
              <div class="quick-search-item" (click)="selectFrame(f)">
                <div>
                  <div class="font-semibold text-xs">{{ f.name }}</div>
                  <div class="text-xs text-muted">{{ f.category }}</div>
                </div>
              </div>
            }
          }
        </div>
      }
    </div>
  `
})
export class QuickSearch {
  searchQuery: string = '';
  showResults: boolean = false;
  matchingCustomers: Customer[] = [];
  matchingOrders: Order[] = [];
  matchingFrames: FrameSize[] = [];

  constructor(
    private storage: StorageService,
    private modalService: ModalService,
    private router: Router
  ) {}

  onSearchChange(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.showResults = false;
      this.matchingCustomers = [];
      this.matchingOrders = [];
      this.matchingFrames = [];
      return;
    }

    this.matchingCustomers = this.storage.getCustomers().filter(c => 
      c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.city.toLowerCase().includes(q)
    ).slice(0, 3);

    this.matchingOrders = this.storage.getOrders().filter(o => 
      o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q)
    ).slice(0, 3);

    this.matchingFrames = this.storage.getFrameSizes().filter(f =>
      f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    ).slice(0, 3);

    this.showResults = true;
  }

  selectCustomer(c: Customer): void {
    const orders = this.storage.getOrders().filter(o => o.customerId === c.id);
    this.modalService.openViewCustomerModal(c, orders);
    this.closeSearch();
  }

  selectOrder(o: Order): void {
    this.router.navigate(['/orders']);
    this.closeSearch();
  }

  selectFrame(f: FrameSize): void {
    this.router.navigate(['/frames']);
    this.closeSearch();
  }

  closeSearch(): void {
    this.showResults = false;
    this.searchQuery = '';
  }
}
