import { Injectable, signal } from '@angular/core';
import { Customer, Order, FrameSize, PhotoFrameConfig } from './storage';

export interface CustomerModalData {
  isOpen: boolean;
  mode: 'create' | 'edit';
  customerId?: string;
  orderId?: string;
  initialCustomer?: Partial<Customer>;
}

export interface ViewCustomerModalData {
  isOpen: boolean;
  customer?: Customer;
  orders: Order[];
}

export interface FrameSizeModalData {
  isOpen: boolean;
  mode: 'create' | 'edit';
  frameSize?: FrameSize;
}

export interface ConfirmModalData {
  isOpen: boolean;
  title: string;
  message: string;
  confirmBtnText?: string;
  onConfirm?: () => void;
}

export interface LightboxModalData {
  isOpen: boolean;
  imageUrl: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  readonly customerModal = signal<CustomerModalData>({ isOpen: false, mode: 'create' });
  readonly viewCustomerModal = signal<ViewCustomerModalData>({ isOpen: false, orders: [] });
  readonly frameSizeModal = signal<FrameSizeModalData>({ isOpen: false, mode: 'create' });
  readonly confirmModal = signal<ConfirmModalData>({ isOpen: false, title: '', message: '' });
  readonly lightboxModal = signal<LightboxModalData>({ isOpen: false, imageUrl: '', title: '' });

  // --- Customer & Order Modal ---
  openCustomerModal(mode: 'create' | 'edit' = 'create', customerId?: string, orderId?: string): void {
    this.customerModal.set({
      isOpen: true,
      mode,
      customerId,
      orderId
    });
  }

  closeCustomerModal(): void {
    this.customerModal.set({ isOpen: false, mode: 'create' });
  }

  // --- View Customer Modal ---
  openViewCustomerModal(customer: Customer, orders: Order[]): void {
    this.viewCustomerModal.set({
      isOpen: true,
      customer,
      orders
    });
  }

  closeViewCustomerModal(): void {
    this.viewCustomerModal.set({ isOpen: false, orders: [] });
  }

  // --- Frame Size Modal ---
  openFrameSizeModal(mode: 'create' | 'edit' = 'create', frameSize?: FrameSize): void {
    this.frameSizeModal.set({
      isOpen: true,
      mode,
      frameSize
    });
  }

  closeFrameSizeModal(): void {
    this.frameSizeModal.set({ isOpen: false, mode: 'create' });
  }

  // --- Confirm Modal ---
  openConfirmModal(title: string, message: string, onConfirm: () => void, confirmBtnText: string = 'Confirm'): void {
    this.confirmModal.set({
      isOpen: true,
      title,
      message,
      confirmBtnText,
      onConfirm
    });
  }

  closeConfirmModal(): void {
    this.confirmModal.set({ isOpen: false, title: '', message: '' });
  }

  // --- Lightbox Modal ---
  openLightbox(imageUrl: string, title: string = 'Photo Preview'): void {
    this.lightboxModal.set({
      isOpen: true,
      imageUrl,
      title
    });
  }

  closeLightbox(): void {
    this.lightboxModal.set({ isOpen: false, imageUrl: '', title: '' });
  }
}
