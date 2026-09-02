import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  signal
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NewOrderService } from '../../services/new-order.service';
import { CustomerService, Customer, CustomerPhoto, SEED_CUSTOMERS } from '../../services/customer.service';
import { AuthService } from '../../services/auth.service';

interface DashboardStats {
  totalCustomers: number;
  totalOrders: number;
  inProgress: number;
  completed: number;
  pending: number;
  totalRevenue: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  stats: DashboardStats = {
    totalCustomers: 0,
    totalOrders: 0,
    inProgress: 0,
    completed: 0,
    pending: 0,
    totalRevenue: 0
  };

  defaultPhotos = [
    { url: 'assets/images/sample_frame_1.jpg', name: 'Photo 1' },
    { url: 'assets/images/sample_frame_2.jpg', name: 'Photo 2' },
    { url: 'assets/images/sample_frame_1.jpg', name: 'Photo 3' }
  ];

  readonly showViewModal = signal(false);
  readonly selectedCustomer = signal<Customer | null>(null);

  recentCustomers: Customer[] = [];
  toastMessage = '';
  private toastTimer: any = null;

  private orderSavedSub!: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private newOrderService: NewOrderService,
    private customerService: CustomerService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();

    this.orderSavedSub = this.newOrderService.orderSaved$.subscribe((savedCust?: any) => {
      if (savedCust && savedCust.id) {
        const existingIdx = this.recentCustomers.findIndex(c => c.id === savedCust.id);
        if (existingIdx !== -1) {
          this.recentCustomers[existingIdx] = { ...this.recentCustomers[existingIdx], ...savedCust };
        } else {
          this.recentCustomers.unshift(savedCust);
          this.recentCustomers = this.recentCustomers.slice(0, 5);
        }
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
      this.loadDashboardData();
      this.showToastMessage('Order saved successfully!');
    });

    if (this.authService.justLoggedIn) {
      this.authService.justLoggedIn = false;
      this.showToastMessage('Welcome to Raigon Arts Management System!');
    }
  }

  ngOnDestroy(): void {
    if (this.orderSavedSub) {
      this.orderSavedSub.unsubscribe();
    }
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  loadDashboardData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Immediately restore cached customer data so refresh displays data without delay
    const local = localStorage.getItem('raigon_customers');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.processDashboardCustomers(parsed);
        }
      } catch (e) {}
    }

    this.customerService.getCustomers().subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : ((data as any)?.value || (data as any)?.$values || (data as any)?.data || []);
        if (list && list.length > 0) {
          localStorage.setItem('raigon_customers', JSON.stringify(list));
          this.processDashboardCustomers(list);
        } else if (this.recentCustomers.length === 0) {
          this.loadDashboardFromLocalStorage();
        }
      },
      error: (err) => {
        console.warn('API unavailable, loading local dashboard data:', err);
        if (this.recentCustomers.length === 0) {
          this.loadDashboardFromLocalStorage();
        }
      }
    });
  }

  private loadDashboardFromLocalStorage(): void {
    let customers: Customer[] = JSON.parse(
      localStorage.getItem('raigon_customers') || '[]'
    );

    if (customers.length === 0) {
      customers = [...SEED_CUSTOMERS];
      localStorage.setItem('raigon_customers', JSON.stringify(customers));
    } else {
      // Enrich existing records so seed details (notes, material, photos) are present
      customers = customers.map(c => {
        const seed = SEED_CUSTOMERS.find(s => s.id === c.id);
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
    }

    this.processDashboardCustomers(customers);
  }

  private processDashboardCustomers(customers: Customer[]): void {
    const sorted = [...customers].sort((a, b) => {
      const numA = parseInt((a.id || '').replace(/\D/g, ''), 10) || 0;
      const numB = parseInt((b.id || '').replace(/\D/g, ''), 10) || 0;
      return numB - numA;
    });

    this.recentCustomers = sorted.slice(0, 5);

    const totalCustomers = sorted.length;
    const totalOrders = sorted.length;

    const inProgress = sorted.filter(
      customer => (customer.orderStatus || '').toLowerCase() === 'in progress'
    ).length;

    const completed = sorted.filter(
      customer => {
        const s = (customer.orderStatus || '').toLowerCase();
        return s === 'completed' || s === 'delivered';
      }
    ).length;

    const pending = sorted.filter(
      customer => (customer.orderStatus || '').toLowerCase() === 'pending'
    ).length;

    const totalRevenue = sorted.reduce(
      (total, customer) => total + Number(customer.totalAmount || 0),
      0
    );

    this.stats = {
      totalCustomers,
      totalOrders,
      inProgress,
      completed,
      pending,
      totalRevenue
    };

    this.cdr.markForCheck();
    this.cdr.detectChanges();
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

  // Opens the shared New Order modal
  addNewOrder(): void {
    this.newOrderService.openOrder();
  }

  viewAllCustomers(): void {
    this.router.navigate(['/customers']);
  }

  viewCustomer(customerOrId: any): void {
    let cust: Customer | null = null;
    if (typeof customerOrId === 'string') {
      cust = this.recentCustomers.find(c => c.id === customerOrId) || null;
    } else {
      cust = customerOrId;
    }
    this.selectedCustomer.set(cust);
    this.showViewModal.set(true);
    this.cdr.detectChanges();
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
    this.selectedCustomer.set(null);
    this.cdr.detectChanges();
  }

  editCustomer(customerOrId: any): void {
    let cust = customerOrId;
    if (typeof customerOrId === 'string') {
      cust = this.recentCustomers.find(c => c.id === customerOrId) || { id: customerOrId };
    }
    this.newOrderService.openEditOrder(cust);
  }

  editFromViewModal(): void {
    const cust = this.selectedCustomer();
    if (cust) {
      this.closeViewModal();
      this.editCustomer(cust);
    }
  }

  deleteCustomer(id: string, name?: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const label = name ? `customer "${name}"` : 'this customer';
    const confirmed = window.confirm(`Are you sure you want to delete ${label}?`);
    if (!confirmed) return;

    this.customerService.deleteCustomer(id).subscribe({
      next: () => {
        const existing: Customer[] = JSON.parse(
          localStorage.getItem('raigon_customers') || '[]'
        );
        const updated = existing.filter(c => c.id !== id);
        localStorage.setItem('raigon_customers', JSON.stringify(updated));
        this.loadDashboardData();
        this.showToastMessage(`Customer ${name || id} deleted successfully.`);
      },
      error: () => {
        const existing: Customer[] = JSON.parse(
          localStorage.getItem('raigon_customers') || '[]'
        );
        const updated = existing.filter(c => c.id !== id);
        localStorage.setItem('raigon_customers', JSON.stringify(updated));
        this.loadDashboardData();
        this.showToastMessage(`Customer ${name || id} deleted successfully.`);
      }
    });
  }

  showToastMessage(msg: string): void {
    this.toastMessage = msg;
    this.startToastDismissTimer();
    this.cdr.detectChanges();
  }

  dismissToast(): void {
    this.toastMessage = '';
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.cdr.detectChanges();
  }

  private startToastDismissTimer(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 4500);
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

  getPhotoName(photo: any, index: number = 0): string {
    if (!photo) return `Photo_${index + 1}.jpg`;
    if (typeof photo === 'string') return photo;
    return photo.name || photo.Name || `Photo_${index + 1}.jpg`;
  }
}