import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NewOrderService } from '../../services/new-order.service';
import { SearchService } from '../../services/search.service';
import { CustomerService, Customer, SEED_CUSTOMERS } from '../../services/customer.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit, OnDestroy {

  defaultPhotos = [
    { url: 'assets/images/sample_frame_1.jpg', name: 'Photo 1' },
    { url: 'assets/images/sample_frame_2.jpg', name: 'Photo 2' },
    { url: 'assets/images/sample_frame_1.jpg', name: 'Photo 3' }
  ];

  // Reactive signals for zoneless change detection
  readonly showViewModal = signal(false);
  readonly selectedOrder = signal<Customer | null>(null);
  readonly ordersList = signal<Customer[]>([]);

  allOrders: Customer[] = [];
  filteredOrders: Customer[] = [];

  searchQuery = '';
  selectedTab = 'All';

  // Available status filter tabs
  readonly tabs = ['All', 'Pending', 'In Progress', 'Completed', 'Delivered', 'Cancelled'];

  // Status dropdown options
  readonly statusOptions = ['Pending', 'In Progress', 'Completed', 'Delivered', 'Cancelled'];

  toastMessage = '';
  private toastTimer: any = null;
  private orderSavedSub!: Subscription;
  private searchSub!: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public newOrderService: NewOrderService,
    private searchService: SearchService,
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.searchService.query()) {
      this.searchQuery = this.searchService.query();
    }

    this.loadOrders();

    this.searchSub = this.searchService.query$.subscribe(q => {
      this.searchQuery = q;
      this.applyFilters();
      this.cdr.detectChanges();
    });

    this.orderSavedSub = this.newOrderService.orderSaved$.subscribe((savedCust?: any) => {
      this.searchQuery = '';
      this.selectedTab = 'All';
      if (savedCust && savedCust.id) {
        const existingIdx = this.allOrders.findIndex(c => c.id === savedCust.id);
        if (existingIdx !== -1) {
          this.allOrders[existingIdx] = { ...this.allOrders[existingIdx], ...savedCust };
        } else {
          this.allOrders.unshift(savedCust);
        }
        this.applyFilters();
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
      this.loadOrders();
      this.showToastMessage('Order saved successfully!');
    });
  }

  ngOnDestroy(): void {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
    if (this.orderSavedSub) {
      this.orderSavedSub.unsubscribe();
    }
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  loadOrders(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Immediately restore cached order data so refresh displays data without delay
    const local = localStorage.getItem('raigon_customers');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.allOrders = parsed;
          this.applyFilters();
        }
      } catch (e) {}
    }

    this.customerService.getCustomers().subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : ((data as any)?.value || (data as any)?.$values || (data as any)?.data || []);
        if (list && list.length > 0) {
          this.allOrders = list;
          localStorage.setItem('raigon_customers', JSON.stringify(list));
        } else if (this.allOrders.length === 0) {
          this.loadFromLocalStorageFallback();
          return;
        }
        this.applyFilters();
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('API unavailable, falling back to local storage:', err);
        if (this.allOrders.length === 0) {
          this.loadFromLocalStorageFallback();
        }
      }
    });
  }

  private loadFromLocalStorageFallback(): void {
    let stored: Customer[] = JSON.parse(
      localStorage.getItem('raigon_customers') || '[]'
    );

    if (stored.length === 0) {
      stored = [...SEED_CUSTOMERS];
      localStorage.setItem('raigon_customers', JSON.stringify(stored));
    } else {
      // Enrich with seed details if missing
      stored = stored.map(c => {
        const seed = SEED_CUSTOMERS.find(sc => sc.id === c.id);
        if (seed) {
          return {
            ...seed,
            ...c,
            altPhone: c.altPhone || seed.altPhone,
            address: c.address || seed.address,
            pincode: c.pincode || seed.pincode,
            material: c.material || seed.material,
            color: c.color || seed.color,
            orientation: c.orientation || seed.orientation,
            notes: c.notes !== undefined && c.notes !== '' ? c.notes : seed.notes,
            deliveryDate: c.deliveryDate || seed.deliveryDate,
            photos: (c.photos && c.photos.length > 0) ? c.photos : seed.photos
          };
        }
        return c;
      });

      // Ensure all seed records are in stored list
      for (const seed of SEED_CUSTOMERS) {
        if (!stored.some(c => c.id === seed.id)) {
          stored.push(seed);
        }
      }

      localStorage.setItem('raigon_customers', JSON.stringify(stored));
    }

    this.allOrders = stored;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  applyFilters(): void {
    let result = [...this.allOrders];

    // Status Tab Filter
    if (this.selectedTab !== 'All') {
      result = result.filter(order => order.orderStatus === this.selectedTab);
    }

    // Text Search Filter (Order ID, Customer Name, Phone, Frame Spec)
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        order =>
          (order.id && order.id.toLowerCase().includes(q)) ||
          (order.name && order.name.toLowerCase().includes(q)) ||
          (order.phone && order.phone.includes(q)) ||
          (order.frameSize && order.frameSize.toLowerCase().includes(q)) ||
          (order.frameType && order.frameType.toLowerCase().includes(q)) ||
          (order.orderStatus && order.orderStatus.toLowerCase().includes(q))
      );
    }

    // Sort by ID order: RA-1001, RA-1002, RA-1003, RA-1004, RA-1005
    result.sort((a, b) => {
      const numA = parseInt((a.id || '').replace(/\D/g, ''), 10) || 0;
      const numB = parseInt((b.id || '').replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

    this.filteredOrders = result;
    this.ordersList.set([...this.filteredOrders]);
  }

  setTab(tab: string): void {
    this.selectedTab = tab;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.applyFilters();
    this.cdr.detectChanges();
  }

  getTabCount(tab: string): number {
    if (tab === 'All') {
      return this.allOrders.length;
    }
    return this.allOrders.filter(order => order.orderStatus === tab).length;
  }

  getPhotoCount(order: Customer): string {
    if (order.photos && order.photos.length > 0) {
      return `${order.photos.length} Photos`;
    }
    return '0 Photos';
  }

  getPaymentClass(status?: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'paid') return 'payment-paid';
    if (s === 'unpaid') return 'payment-unpaid';
    return 'payment-partial';
  }

  onStatusChange(order: Customer, newStatus: string): void {
    order.orderStatus = newStatus;
    
    // Persist to local storage
    if (isPlatformBrowser(this.platformId)) {
      const stored: Customer[] = JSON.parse(
        localStorage.getItem('raigon_customers') || '[]'
      );
      const idx = stored.findIndex(c => c.id === order.id);
      if (idx !== -1) {
        stored[idx].orderStatus = newStatus;
        localStorage.setItem('raigon_customers', JSON.stringify(stored));
      }
    }

    // Try persisting to API backend if available
    this.customerService.updateCustomer(order.id, order).subscribe({
      next: () => {},
      error: () => {}
    });

    this.applyFilters();
    this.showToastMessage(`Order ${order.id} status updated to "${newStatus}".`);
    this.cdr.detectChanges();
  }

  openCreateOrder(): void {
    this.newOrderService.openOrder();
  }

  viewOrder(order: Customer): void {
    this.selectedOrder.set(order);
    this.showViewModal.set(true);
    this.cdr.detectChanges();
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
    this.selectedOrder.set(null);
    this.cdr.detectChanges();
  }

  editOrder(order: Customer): void {
    this.newOrderService.openEditOrder(order);
  }

  editFromViewModal(): void {
    const ord = this.selectedOrder();
    if (ord) {
      this.closeViewModal();
      this.editOrder(ord);
    }
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

  getPhotoUrl(photo: any): string {
    if (!photo) return 'assets/images/sample_frame_1.jpg';
    if (typeof photo === 'string') {
      if (photo.startsWith('data:') || photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('assets/')) {
        return photo;
      }
      if (photo.toLowerCase().includes('sample_frame_2') || photo.toLowerCase().includes('photo_b') || photo.toLowerCase().includes('photo_2') || photo.toLowerCase().includes('portrait_2')) {
        return 'assets/images/sample_frame_2.jpg';
      }
      return 'assets/images/sample_frame_1.jpg';
    }
    const url = photo.url || photo.Url || '';
    if (url) return url;
    return 'assets/images/sample_frame_1.jpg';
  }

  showToastMessage(msg: string): void {
    this.toastMessage = msg;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 4000);
    this.cdr.detectChanges();
  }

  dismissToast(): void {
    this.toastMessage = '';
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.cdr.detectChanges();
  }
}
