import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Modal } from '../../components/modal/modal';
import { NewOrderService } from '../../services/new-order.service';
import { CustomerService, SEED_CUSTOMERS } from '../../services/customer.service';

export interface PhotoItem {
  id: string;
  name: string;
  url: string;
}

@Component({
  selector: 'app-new-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Modal
  ],
  templateUrl: './new-order.html',
  styleUrl: './new-order.css'
})
export class NewOrder implements OnInit, OnDestroy {

  private openSub!: Subscription;
  private editSub!: Subscription;

  editingId: string | null = null;
  errors: { [key: string]: string } = {};
  toastError = '';
  private errorTimer: any = null;

  // Staged photos array (empty for new customer order)
  photos: PhotoItem[] = [];

  get minDeliveryDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  getTodayDateString(): string {
    const today = new Date();
    return today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  order = this.getDefaultOrder();

  constructor(
    public newOrderService: NewOrderService,
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  get showOrderModal(): boolean {
    return this.newOrderService.isOpen();
  }

  ngOnInit(): void {
    this.openSub = this.newOrderService.openOrder$.subscribe(() => {
      this.editingId = null;
      this.errors = {};
      this.toastError = '';
      this.order = this.getDefaultOrder();
      this.photos = [];
      this.openOrderModal();
    });

    this.editSub = this.newOrderService.editOrder$.subscribe((customer) => {
      this.errors = {};
      this.toastError = '';
      this.populateForEdit(customer);
      this.openOrderModal();
    });
  }

  ngOnDestroy(): void {
    if (this.openSub) this.openSub.unsubscribe();
    if (this.editSub) this.editSub.unsubscribe();
  }

  getDefaultPhotos(): PhotoItem[] {
    return [];
  }

  getDefaultOrder() {
    return {
      customerName: '',
      phone: '',
      alternativePhone: '',
      city: '',
      address: '',
      pincode: '',

      frameSize: '',
      unit: 'Inch',
      customWidth: null as number | null,
      customHeight: null as number | null,

      frameType: '',
      frameMaterial: '',
      frameColor: '',
      orientation: '',

      quantity: 1,
      notes: '',

      orderDate: this.getTodayDateString(),
      deliveryDate: '',

      totalAmount: null as number | null,
      advancePaid: null as number | null,
      balanceAmount: 0,

      paymentStatus: '',
      orderStatus: ''
    };
  }

  cleanPhotoName(photo: any, index: number = 0): string {
    if (!photo) return `Photo_${index + 1}.jpg`;
    let raw = '';
    if (typeof photo === 'string') {
      raw = photo;
    } else if (typeof photo === 'object') {
      raw = photo.name || photo.Name || photo.fileName || photo.url || photo.Url || `Photo_${index + 1}.jpg`;
    }
    if (!raw || typeof raw !== 'string') return `Photo_${index + 1}.jpg`;
    if (raw.startsWith('data:')) return `Photo_${index + 1}.jpg`;
    const withoutQuery = raw.split('?')[0].split('#')[0];
    const parts = withoutQuery.split(/[/\\]/);
    const name = parts[parts.length - 1].trim();
    return name || `Photo_${index + 1}.jpg`;
  }

  populateForEdit(cust: any): void {
    this.editingId = cust.id;

    if (cust.photos && cust.photos.length > 0) {
      this.photos = cust.photos.map((p: any, idx: number) => {
        const name = this.cleanPhotoName(p, idx);
        const url = this.getPhotoUrl(p);
        return {
          id: `photo-${idx}`,
          name: name,
          url: url
        };
      });
    } else {
      this.photos = [];
    }

    this.order = {
      customerName: cust.name || '',
      phone: cust.phone || '',
      alternativePhone: cust.altPhone || cust.alternativePhone || '',
      city: cust.city || '',
      address: cust.address || '',
      pincode: cust.pincode || '',
      frameSize: cust.frameSize || '',
      unit: cust.unit || 'Inch',
      customWidth: cust.customWidth || null,
      customHeight: cust.customHeight || null,
      frameType: cust.frameType || '',
      frameMaterial: cust.material || cust.frameMaterial || '',
      frameColor: cust.color || cust.frameColor || '',
      orientation: cust.orientation || '',
      quantity: cust.quantity || 1,
      notes: cust.notes || '',
      orderDate: cust.orderDate || this.getTodayDateString(),
      deliveryDate: cust.deliveryDate || '',
      totalAmount: cust.totalAmount !== undefined ? cust.totalAmount : 0,
      advancePaid: cust.advancePaid !== undefined ? cust.advancePaid : 0,
      balanceAmount: cust.balanceAmount !== undefined ? cust.balanceAmount : Math.max(0, (cust.totalAmount || 0) - (cust.advancePaid || 0)),
      paymentStatus: cust.paymentStatus || '',
      orderStatus: cust.orderStatus || ''
    };
  }

  openOrderModal(): void {
    this.newOrderService.isOpen.set(true);
    this.cdr.detectChanges();
  }

  closeOrderModal(): void {
    this.editingId = null;
    this.newOrderService.closeOrder();
    this.cdr.detectChanges();
  }

  onAmountChange(): void {
    this.calculateBalance();
    this.validateField('totalAmount');
    this.validateField('advancePaid');
  }

  calculateBalance(): void {
    const total = this.order.totalAmount !== null && this.order.totalAmount !== undefined ? Number(this.order.totalAmount) : 0;
    const advance = this.order.advancePaid !== null && this.order.advancePaid !== undefined ? Number(this.order.advancePaid) : 0;

    if (advance > total && total > 0) {
      this.errors['advancePaid'] = 'Advance Paid cannot exceed Total Amount.';
    } else if (this.errors['advancePaid'] === 'Advance Paid cannot exceed Total Amount.') {
      delete this.errors['advancePaid'];
    }

    this.order.balanceAmount = Math.max(total - advance, 0);
  }

  async onFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      await this.processFiles(Array.from(input.files));
      input.value = '';
    }
  }

  async onFileDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      await this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  async processFiles(files: File[]): Promise<void> {
    for (const file of files) {
      try {
        const url = await this.readFileAsDataUrl(file);
        this.photos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          url
        });
      } catch (err) {
        console.error('Failed to read file:', file.name, err);
      }
    }
    this.cdr.detectChanges();
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  removePhoto(index: number): void {
    this.photos.splice(index, 1);
    this.cdr.detectChanges();
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

  validateField(field: string): void {
    delete this.errors[field];

    if (field === 'customerName') {
      const name = (this.order.customerName || '').trim();
      if (!name) {
        this.errors['customerName'] = 'Customer Name is required.';
      } else if (!/^[a-zA-Z\s]+$/.test(name)) {
        this.errors['customerName'] = 'Name must contain letters only (no numbers or special characters).';
      }
    }

    if (field === 'phone') {
      const phone = (this.order.phone || '').trim();
      if (!phone) {
        this.errors['phone'] = 'Phone Number is required.';
      } else if (!/^\d{10}$/.test(phone)) {
        this.errors['phone'] = 'Phone number must be exactly 10 digits.';
      }
    }

    if (field === 'alternativePhone') {
      const alt = (this.order.alternativePhone || '').trim();
      if (alt && !/^\d{10}$/.test(alt)) {
        this.errors['alternativePhone'] = 'Alternative phone number must be exactly 10 digits.';
      }
    }

    if (field === 'city') {
      const city = (this.order.city || '').trim();
      if (city && !/^[a-zA-Z\s]+$/.test(city)) {
        this.errors['city'] = 'City must contain letters only.';
      }
    }

    if (field === 'frameSize') {
      const frameSize = (this.order.frameSize || '').trim();
      if (!frameSize) {
        this.errors['frameSize'] = 'Frame Size is required.';
      }
    }

    if (field === 'frameType') {
      const frameType = (this.order.frameType || '').trim();
      if (!frameType) {
        this.errors['frameType'] = 'Frame Type is required.';
      }
    }

    if (field === 'deliveryDate') {
      const delDate = (this.order.deliveryDate || '').trim();
      if (!delDate) {
        this.errors['deliveryDate'] = 'Expected Delivery Date is required.';
      } else {
        const selected = new Date(delDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected <= today) {
          this.errors['deliveryDate'] = 'Expected Delivery Date must be a future date (tomorrow or later).';
        }
      }
    }

    if (field === 'totalAmount') {
      const total = this.order.totalAmount;
      if (total === null || total === undefined || total === ('' as any)) {
        this.errors['totalAmount'] = 'Total Amount is required.';
      } else if (Number(total) <= 0) {
        this.errors['totalAmount'] = 'Total Amount must be greater than 0.';
      }
    }

    if (field === 'advancePaid') {
      const total = Number(this.order.totalAmount) || 0;
      const advance = Number(this.order.advancePaid) || 0;
      if (advance < 0) {
        this.errors['advancePaid'] = 'Advance Paid cannot be negative.';
      } else if (total > 0 && advance > total) {
        this.errors['advancePaid'] = 'Advance Paid cannot exceed Total Amount.';
      }
    }

    if (field === 'paymentStatus') {
      const paymentStatus = (this.order.paymentStatus || '').trim();
      if (!paymentStatus) {
        this.errors['paymentStatus'] = 'Payment Status is required.';
      }
    }

    if (field === 'orderStatus') {
      const orderStatus = (this.order.orderStatus || '').trim();
      if (!orderStatus) {
        this.errors['orderStatus'] = 'Order Status is required.';
      }
    }

    this.cdr.detectChanges();
  }

  validateAll(): boolean {
    this.errors = {};

    // 1. Customer Name (Mandatory, Letters only)
    const name = (this.order.customerName || '').trim();
    if (!name) {
      this.errors['customerName'] = 'Customer Name is required.';
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      this.errors['customerName'] = 'Name must contain letters only (no numbers or special characters).';
    }

    // 2. Phone Number (Mandatory, Exactly 10 digits)
    const phone = (this.order.phone || '').trim();
    if (!phone) {
      this.errors['phone'] = 'Phone Number is required.';
    } else if (!/^\d{10}$/.test(phone)) {
      this.errors['phone'] = 'Phone number must be exactly 10 digits.';
    }

    // 3. Alternative Phone (Optional, but if entered must be exactly 10 digits)
    const alt = (this.order.alternativePhone || '').trim();
    if (alt && !/^\d{10}$/.test(alt)) {
      this.errors['alternativePhone'] = 'Alternative phone number must be exactly 10 digits.';
    }

    // 4. City (Optional, but if entered must be letters only)
    const city = (this.order.city || '').trim();
    if (city && !/^[a-zA-Z\s]+$/.test(city)) {
      this.errors['city'] = 'City must contain letters only.';
    }

    // 5. Frame Size (Mandatory)
    const frameSize = (this.order.frameSize || '').trim();
    if (!frameSize) {
      this.errors['frameSize'] = 'Frame Size is required.';
    }

    // 6. Frame Type (Mandatory)
    const frameType = (this.order.frameType || '').trim();
    if (!frameType) {
      this.errors['frameType'] = 'Frame Type is required.';
    }

    // 7. Expected Delivery Date (Mandatory, strictly future date)
    const delDate = (this.order.deliveryDate || '').trim();
    if (!delDate) {
      this.errors['deliveryDate'] = 'Expected Delivery Date is required.';
    } else {
      const selected = new Date(delDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected <= today) {
        this.errors['deliveryDate'] = 'Expected Delivery Date must be a future date (tomorrow or later).';
      }
    }

    // 8. Total Amount (Mandatory, > 0)
    const total = this.order.totalAmount;
    if (total === null || total === undefined || total === ('' as any)) {
      this.errors['totalAmount'] = 'Total Amount is required.';
    } else if (Number(total) <= 0) {
      this.errors['totalAmount'] = 'Total Amount must be greater than 0.';
    }

    // 9. Advance Paid & Balance checks
    const totalNum = Number(this.order.totalAmount) || 0;
    const advance = Number(this.order.advancePaid) || 0;
    if (advance < 0) {
      this.errors['advancePaid'] = 'Advance Paid cannot be negative.';
    } else if (totalNum > 0 && advance > totalNum) {
      this.errors['advancePaid'] = 'Advance Paid cannot exceed Total Amount.';
    }

    // 10. Payment Status (Mandatory)
    const paymentStatus = (this.order.paymentStatus || '').trim();
    if (!paymentStatus) {
      this.errors['paymentStatus'] = 'Payment Status is required.';
    }

    // 11. Order Status (Mandatory)
    const fieldsToValidate = [
      'customerName',
      'phone',
      'alternativePhone',
      'city',
      'totalAmount',
      'advancePaid',
      'frameSize',
      'frameType',
      'quantity'
    ];

    for (const field of fieldsToValidate) {
      this.validateField(field);
    }

    return Object.keys(this.errors).length === 0;
  }

  showToastError(msg: string): void {
    this.toastError = msg;
    if (this.errorTimer) clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(() => {
      this.toastError = '';
      this.cdr.detectChanges();
    }, 4000);
    this.cdr.detectChanges();
  }

  saveDraft(): void {
    const photoNames: string[] = this.photos
      .map((p, idx) => this.cleanPhotoName(p, idx))
      .filter(Boolean);

    let nextNum = 1005;
    let existing: any[] = [];
    if (isPlatformBrowser(this.platformId)) {
      existing = JSON.parse(localStorage.getItem('raigon_customers') || '[]');
      if (!Array.isArray(existing) || existing.length === 0) {
        existing = [...SEED_CUSTOMERS];
      }
      for (const c of existing) {
        if (c && c.id) {
          const num = parseInt(c.id.replace(/\D/g, ''), 10);
          if (!isNaN(num) && num >= nextNum) {
            nextNum = num + 1;
          }
        }
      }
    }

    const draftCustomer: any = {
      id: this.editingId || `RA-${nextNum}`,
      name: (this.order.customerName || '').trim() || 'Draft Order',
      phone: (this.order.phone || '').trim() || '9876543210',
      altPhone: (this.order.alternativePhone || '').trim(),
      city: (this.order.city || '').trim(),
      address: (this.order.address || '').trim(),
      pincode: (this.order.pincode || '').trim(),
      photos: photoNames,
      frameSize: (this.order.frameSize || '').trim(),
      frameType: (this.order.frameType || '').trim(),
      material: (this.order.frameMaterial || '').trim(),
      color: (this.order.frameColor || '').trim(),
      orientation: (this.order.orientation || '').trim(),
      quantity: Number(this.order.quantity) || 1,
      notes: (this.order.notes || '').trim(),
      orderDate: this.order.orderDate || this.getTodayDateString(),
      deliveryDate: (this.order.deliveryDate || '').trim(),
      totalAmount: Number(this.order.totalAmount) || 0,
      advancePaid: Number(this.order.advancePaid) || 0,
      balanceAmount: Number(this.order.balanceAmount) || 0,
      paymentStatus: (this.order.paymentStatus || 'Unpaid').trim(),
      orderStatus: 'Pending'
    };

    if (this.editingId) {
      this.customerService.updateCustomer(this.editingId, draftCustomer).subscribe({
        next: (res) => this.finalizeOrderSave(res || draftCustomer),
        error: (err) => {
          console.warn('[CustomerService] updateCustomer failed, persisting locally:', err);
          this.finalizeOrderSave(draftCustomer);
        }
      });
    } else {
      this.customerService.createCustomer(draftCustomer).subscribe({
        next: (created) => this.finalizeOrderSave(created || draftCustomer),
        error: (err) => {
          console.warn('[CustomerService] createCustomer failed, persisting locally:', err);
          this.finalizeOrderSave(draftCustomer);
        }
      });
    }
  }

  saveOrder(): void {
    if (!this.validateAll()) {
      const firstError = Object.values(this.errors)[0];
      this.showToastError(firstError || 'Please fix the highlighted errors before saving.');
      return;
    }

    const photoNames: string[] = this.photos
      .map((p, idx) => this.cleanPhotoName(p, idx))
      .filter(Boolean);

    let nextNum = 1005;
    let existing: any[] = [];
    if (isPlatformBrowser(this.platformId)) {
      existing = JSON.parse(localStorage.getItem('raigon_customers') || '[]');
      if (!Array.isArray(existing) || existing.length === 0) {
        existing = [...SEED_CUSTOMERS];
      }
      for (const c of existing) {
        if (c && c.id) {
          const num = parseInt(c.id.replace(/\D/g, ''), 10);
          if (!isNaN(num) && num >= nextNum) {
            nextNum = num + 1;
          }
        }
      }
    }

    const orderPayload: any = {
      id: this.editingId || `RA-${nextNum}`,
      name: (this.order.customerName || 'New Customer').trim(),
      phone: (this.order.phone || '').trim(),
      altPhone: (this.order.alternativePhone || '').trim(),
      city: (this.order.city || '').trim(),
      address: (this.order.address || '').trim(),
      pincode: (this.order.pincode || '').trim(),
      photos: photoNames,
      frameSize: (this.order.frameSize || '').trim(),
      frameType: (this.order.frameType || '').trim(),
      material: (this.order.frameMaterial || '').trim(),
      color: (this.order.frameColor || '').trim(),
      orientation: (this.order.orientation || '').trim(),
      quantity: Number(this.order.quantity) || 1,
      notes: (this.order.notes || '').trim(),
      orderDate: this.order.orderDate || this.getTodayDateString(),
      deliveryDate: (this.order.deliveryDate || '').trim(),
      totalAmount: Number(this.order.totalAmount) || 0,
      advancePaid: Number(this.order.advancePaid) || 0,
      balanceAmount: Number(this.order.balanceAmount) || 0,
      paymentStatus: (this.order.paymentStatus || 'Pending').trim(),
      orderStatus: (this.order.orderStatus || 'Pending').trim()
    };

    if (this.editingId) {
      this.customerService.updateCustomer(this.editingId, orderPayload).subscribe({
        next: (res) => this.finalizeOrderSave(res || orderPayload),
        error: (err) => {
          console.warn('[CustomerService] updateCustomer failed, persisting locally:', err);
          this.finalizeOrderSave(orderPayload);
        }
      });
    } else {
      this.customerService.createCustomer(orderPayload).subscribe({
        next: (created) => this.finalizeOrderSave(created || orderPayload),
        error: (err) => {
          console.warn('[CustomerService] createCustomer failed, persisting locally:', err);
          this.finalizeOrderSave(orderPayload);
        }
      });
    }
  }

  private finalizeOrderSave(customerData: any): void {
    if (isPlatformBrowser(this.platformId)) {
      let existing: any[] = JSON.parse(localStorage.getItem('raigon_customers') || '[]');
      if (!Array.isArray(existing) || existing.length === 0) {
        existing = [...SEED_CUSTOMERS];
      }

      if (this.editingId) {
        const idx = existing.findIndex((c: any) => c.id === this.editingId);
        if (idx !== -1) {
          existing[idx] = { ...existing[idx], ...customerData };
        } else {
          existing.unshift(customerData);
        }
      } else {
        const existingIdx = existing.findIndex((c: any) => c.id === customerData.id);
        if (existingIdx !== -1) {
          existing[existingIdx] = { ...existing[existingIdx], ...customerData };
        } else {
          existing.unshift(customerData);
        }
      }

      localStorage.setItem('raigon_customers', JSON.stringify(existing));
    }

    this.newOrderService.notifyOrderSaved(customerData);
    this.closeOrderModal();
    this.order = this.getDefaultOrder();
    this.photos = [];
    this.editingId = null;
    this.errors = {};
  }
}