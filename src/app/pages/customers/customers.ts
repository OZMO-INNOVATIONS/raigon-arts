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
import { CustomerService, Customer, CustomerPhoto, SEED_CUSTOMERS } from '../../services/customer.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css'
})
export class Customers implements OnInit, OnDestroy {

  defaultPhotos = [
    { url: 'assets/images/sample_frame_1.jpg', name: 'Photo 1' },
    { url: 'assets/images/sample_frame_2.jpg', name: 'Photo 2' },
    { url: 'assets/images/sample_frame_1.jpg', name: 'Photo 3' }
  ];

  // Reactive signals for reliable zoneless updates
  readonly showViewModal = signal(false);
  readonly selectedCustomer = signal<Customer | null>(null);
  readonly customersList = signal<Customer[]>([]);

  allCustomers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  paginatedCustomers: Customer[] = [];

  searchQuery = '';
  statusFilter = 'All';
  sortBy = 'date_desc';

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

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
    this.searchQuery = '';
    this.statusFilter = 'All';
    this.currentPage = 1;

    this.loadCustomers();

    this.searchSub = this.searchService.query$.subscribe(q => {
      if (q !== undefined && q !== null) {
        this.searchQuery = q;
        this.currentPage = 1;
        this.applyFilters();
        this.cdr.detectChanges();
      }
    });

    this.orderSavedSub = this.newOrderService.orderSaved$.subscribe((savedCust?: any) => {
      this.searchQuery = '';
      this.statusFilter = 'All';
      this.currentPage = 1;
      this.searchService.clear();

      if (savedCust && savedCust.id) {
        const existingIdx = this.allCustomers.findIndex(c => c.id === savedCust.id);
        if (existingIdx !== -1) {
          this.allCustomers[existingIdx] = { ...this.allCustomers[existingIdx], ...savedCust };
        } else {
          this.allCustomers.unshift(savedCust);
        }
        this.applyFilters();
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }

      this.loadCustomers();
      this.showToastMessage('Customer saved successfully!');
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

  loadCustomers(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Immediately restore cached customer data so refresh displays data without delay
    const local = localStorage.getItem('raigon_customers');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.allCustomers = parsed;
          this.applyFilters();
        }
      } catch (e) {}
    }

    this.customerService.getCustomers().subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : ((data as any)?.value || (data as any)?.$values || (data as any)?.data || []);
        console.log('[Raigon Arts] Customers loaded from API:', list.length, 'records');
        if (list && list.length > 0) {
          this.allCustomers = list;
          localStorage.setItem('raigon_customers', JSON.stringify(list));
        } else if (this.allCustomers.length === 0) {
          this.loadFromLocalStorageFallback();
          return;
        }
        this.applyFilters();
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('[Raigon Arts] API unavailable, loading local data fallback:', err);
        if (this.allCustomers.length === 0) {
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
      // Deduplicate IDs and enrich records with seed details
      const seen = new Set<string>();
      let fallbackNum = 1005;

      stored = stored.map(c => {
        // Fix any duplicate IDs
        if (!c.id || seen.has(c.id)) {
          fallbackNum++;
          c.id = `RA-${fallbackNum}`;
        } else {
          const match = c.id.match(/\d+/);
          if (match) {
            const num = parseInt(match[0], 10);
            if (num > fallbackNum) fallbackNum = num;
          }
        }
        seen.add(c.id);

        // Enrich with seed details if missing
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

      localStorage.setItem('raigon_customers', JSON.stringify(stored));
    }

    this.allCustomers = stored;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  applyFilters(): void {
    let result = [...this.allCustomers];

    // Text Search
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        c =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(q)) ||
          (c.id && c.id.toLowerCase().includes(q)) ||
          (c.city && c.city.toLowerCase().includes(q)) ||
          (c.address && c.address.toLowerCase().includes(q)) ||
          (c.frameSize && c.frameSize.toLowerCase().includes(q)) ||
          (c.frameType && c.frameType.toLowerCase().includes(q)) ||
          (c.orderStatus && c.orderStatus.toLowerCase().includes(q))
      );
    }

    // Status Filter
    if (this.statusFilter && this.statusFilter !== 'All') {
      const filterLower = this.statusFilter.toLowerCase().trim();
      result = result.filter(c => (c.orderStatus || '').toLowerCase().trim() === filterLower);
    }

    // Sorting
    result.sort((a, b) => {
      switch (this.sortBy) {
        case 'date_asc':
          return (a.orderDate || '').localeCompare(b.orderDate || '');
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'amount_desc':
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        case 'date_desc':
        default: {
          const numA = parseInt((a.id || '').replace(/\D/g, ''), 10) || 0;
          const numB = parseInt((b.id || '').replace(/\D/g, ''), 10) || 0;
          return numB - numA;
        }
      }
    });

    this.filteredCustomers = result;
    this.totalPages = Math.ceil(this.filteredCustomers.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    if (this.currentPage < 1) this.currentPage = 1;

    const startIdx = (this.currentPage - 1) * this.pageSize;
    this.paginatedCustomers = this.filteredCustomers.slice(startIdx, startIdx + this.pageSize);
    this.customersList.set([...this.paginatedCustomers]);
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  onFilterChange(): void {
    this.searchService.query.set(this.searchQuery);
    this.currentPage = 1;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
      this.cdr.detectChanges();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
      this.cdr.detectChanges();
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

  openAddNewCustomer(): void {
    this.newOrderService.openOrder();
  }

  editCustomer(customer: Customer): void {
    this.newOrderService.openEditOrder(customer);
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
        this.loadCustomers();
        this.showToastMessage(`Customer ${name || id} deleted successfully.`);
      },
      error: () => {
        // Fallback to local delete
        const existing: Customer[] = JSON.parse(
          localStorage.getItem('raigon_customers') || '[]'
        );
        const updated = existing.filter(c => c.id !== id);
        localStorage.setItem('raigon_customers', JSON.stringify(updated));
        this.loadCustomers();
        this.showToastMessage(`Customer ${name || id} deleted successfully.`);
      }
    });
  }

  viewCustomer(customerOrId: any): void {
    let cust: Customer | null = null;
    if (typeof customerOrId === 'string') {
      cust = this.allCustomers.find(c => c.id === customerOrId) || null;
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

  editFromViewModal(): void {
    const cust = this.selectedCustomer();
    if (cust) {
      this.closeViewModal();
      this.editCustomer(cust);
    }
  }

  exportCSV(): void {
    if (this.filteredCustomers.length === 0) {
      this.showToastMessage('No customer records available to export.');
      return;
    }

    const headers = [
      'Customer ID',
      'Name',
      'Phone',
      'City',
      'Address',
      'Pincode',
      'Frame Size',
      'Frame Type',
      'Qty',
      'Total Amount',
      'Order Status',
      'Order Date'
    ];

    const rows = this.filteredCustomers.map(c => [
      c.id,
      `"${c.name}"`,
      c.phone,
      `"${c.city || ''}"`,
      `"${c.address || ''}"`,
      `"${c.pincode || ''}"`,
      `"${c.frameSize}"`,
      `"${c.frameType}"`,
      c.quantity,
      c.totalAmount,
      c.orderStatus,
      c.orderDate
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Raigon_Arts_Customers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToastMessage('Customer data exported to CSV successfully.');
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
