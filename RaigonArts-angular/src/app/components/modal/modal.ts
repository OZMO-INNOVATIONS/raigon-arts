import { Component, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal.service';
import { StorageService, Customer, Order, FrameSize, PhotoFrameConfig } from '../../services/storage';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class Modal {
  // Form state for Customer & Order Modal
  formCustId: string = '';
  formCustName: string = '';
  formCustPhone: string = '';
  formCustAltPhone: string = '';
  formCustCity: string = '';
  formCustAddress: string = '';
  formCustPincode: string = '';

  configMode: 'same' | 'individual' = 'same';
  selectedPhotos: PhotoFrameConfig[] = [];

  // Common Frame Specs
  formFrameSize: string = '12 × 18 inch';
  formUnit: 'inch' | 'cm' | 'mm' = 'inch';
  formCustomWidth?: number;
  formCustomHeight?: number;
  formFrameType: string = 'Wooden Frame';
  formFrameMaterial: string = 'Teak Wood Moulding';
  formFrameColor: string = 'Walnut Brown';
  formOrientation: 'Landscape' | 'Portrait' | 'Square' = 'Landscape';
  formQuantity: number = 1;
  formNotes: string = '';

  // Order & Payment Details
  formOrderId: string = '';
  formOrderDate: string = '';
  formDeliveryDate: string = '';
  formTotalAmount: number = 2500;
  formAdvancePaid: number = 1000;
  formPaymentStatus: 'Paid' | 'Partial' | 'Unpaid' = 'Partial';
  formOrderStatus: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' = 'In Progress';

  // Frame Size Form
  formSizeId: string = '';
  formSizeName: string = '';
  formSizeWidth: number = 12;
  formSizeHeight: number = 18;
  formSizeUnit: 'inch' | 'cm' = 'inch';
  formSizeCategory: 'Standard Photo' | 'Medium Portrait' | 'Large Gallery' | 'Exhibition Wall Art' | 'Custom Size' = 'Large Gallery';

  constructor(
    public modalService: ModalService,
    private storage: StorageService,
    private toast: ToastService
  ) {
    // Watch customer modal state changes
    effect(() => {
      const state = this.modalService.customerModal();
      if (state.isOpen) {
        this.initCustomerForm(state.mode, state.customerId, state.orderId);
      }
    });

    // Watch frame size modal state changes
    effect(() => {
      const state = this.modalService.frameSizeModal();
      if (state.isOpen) {
        if (state.frameSize) {
          this.formSizeId = state.frameSize.id;
          this.formSizeName = state.frameSize.name;
          this.formSizeWidth = state.frameSize.width;
          this.formSizeHeight = state.frameSize.height;
          this.formSizeUnit = state.frameSize.unit === 'cm' ? 'cm' : 'inch';
          this.formSizeCategory = state.frameSize.category;
        } else {
          this.formSizeId = '';
          this.formSizeName = '';
          this.formSizeWidth = 12;
          this.formSizeHeight = 18;
          this.formSizeUnit = 'inch';
          this.formSizeCategory = 'Standard Photo';
        }
      }
    });
  }

  get balanceAmount(): number {
    return Math.max(0, (this.formTotalAmount || 0) - (this.formAdvancePaid || 0));
  }

  private initCustomerForm(mode: 'create' | 'edit', customerId?: string, orderId?: string): void {
    const today = new Date().toISOString().split('T')[0];
    const defaultDelivery = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    if (customerId) {
      const cust = this.storage.getCustomerById(customerId);
      if (cust) {
        this.formCustId = cust.id;
        this.formCustName = cust.name;
        this.formCustPhone = cust.phone;
        this.formCustAltPhone = cust.altPhone || '';
        this.formCustCity = cust.city;
        this.formCustAddress = cust.address;
        this.formCustPincode = cust.pincode;
      }
    } else {
      this.formCustId = '';
      this.formCustName = '';
      this.formCustPhone = '';
      this.formCustAltPhone = '';
      this.formCustCity = 'Trivandrum';
      this.formCustAddress = '';
      this.formCustPincode = '';
    }

    if (orderId) {
      const order = this.storage.getOrderById(orderId);
      if (order) {
        this.formOrderId = order.id;
        this.formOrderDate = order.orderDate;
        this.formDeliveryDate = order.deliveryDate;
        this.formTotalAmount = order.totalAmount;
        this.formAdvancePaid = order.advancePaid;
        this.formPaymentStatus = order.paymentStatus;
        this.formOrderStatus = order.orderStatus;
        this.configMode = order.configMode || 'same';
        this.selectedPhotos = [...(order.photos || [])];

        if (order.commonSpecs) {
          this.formFrameSize = order.commonSpecs.frameSize;
          this.formUnit = order.commonSpecs.unit as any;
          this.formCustomWidth = order.commonSpecs.customWidth;
          this.formCustomHeight = order.commonSpecs.customHeight;
          this.formFrameType = order.commonSpecs.frameType;
          this.formFrameMaterial = order.commonSpecs.frameMaterial;
          this.formFrameColor = order.commonSpecs.frameColor;
          this.formOrientation = order.commonSpecs.orientation;
          this.formQuantity = order.commonSpecs.quantity;
          this.formNotes = order.commonSpecs.notes || '';
        }
        return;
      }
    }

    // Default new order state
    this.formOrderId = '';
    this.formOrderDate = today;
    this.formDeliveryDate = defaultDelivery;
    this.formTotalAmount = 2500;
    this.formAdvancePaid = 1000;
    this.formPaymentStatus = 'Partial';
    this.formOrderStatus = 'In Progress';
    this.configMode = 'same';
    this.selectedPhotos = [
      {
        id: 'p_' + Date.now(),
        photoUrl: 'assets/images/sample_frame_1.svg',
        photoName: 'Customer_Sample_1.jpg',
        frameSize: '12 × 18 inch',
        unit: 'inch',
        frameType: 'Wooden Frame',
        frameMaterial: 'Teak Wood Moulding',
        frameColor: 'Walnut Brown',
        orientation: 'Landscape',
        quantity: 1,
        notes: ''
      }
    ];
  }

  setFrameConfigMode(mode: 'same' | 'individual'): void {
    this.configMode = mode;
  }

  handleFileSelect(event: any): void {
    const files: FileList = event.target?.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const url = e.target?.result as string;
        this.selectedPhotos.push({
          id: 'p_' + Date.now() + '_' + i,
          photoUrl: url,
          photoName: file.name,
          frameSize: this.formFrameSize,
          unit: this.formUnit,
          customWidth: this.formCustomWidth,
          customHeight: this.formCustomHeight,
          frameType: this.formFrameType,
          frameMaterial: this.formFrameMaterial,
          frameColor: this.formFrameColor,
          orientation: this.formOrientation,
          quantity: this.formQuantity,
          notes: this.formNotes
        });
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(index: number): void {
    this.selectedPhotos.splice(index, 1);
  }

  saveCustomerOrder(e: Event): void {
    e.preventDefault();

    if (!this.formCustName.trim() || !this.formCustPhone.trim()) {
      this.toast.error('Please enter customer name and phone number.');
      return;
    }

    // Save or update Customer
    const savedCustomer = this.storage.saveCustomer({
      id: this.formCustId || undefined,
      name: this.formCustName,
      phone: this.formCustPhone,
      altPhone: this.formCustAltPhone,
      city: this.formCustCity,
      address: this.formCustAddress,
      pincode: this.formCustPincode
    });

    // Save or update Order
    const savedOrder = this.storage.saveOrder({
      id: this.formOrderId || undefined,
      customerId: savedCustomer.id,
      customerName: savedCustomer.name,
      customerPhone: savedCustomer.phone,
      customerCity: savedCustomer.city,
      orderDate: this.formOrderDate,
      deliveryDate: this.formDeliveryDate,
      totalAmount: Number(this.formTotalAmount) || 0,
      advancePaid: Number(this.formAdvancePaid) || 0,
      paymentStatus: this.formPaymentStatus,
      orderStatus: this.formOrderStatus,
      configMode: this.configMode,
      photos: this.selectedPhotos,
      commonSpecs: {
        frameSize: this.formFrameSize,
        unit: this.formUnit,
        customWidth: this.formCustomWidth,
        customHeight: this.formCustomHeight,
        frameType: this.formFrameType,
        frameMaterial: this.formFrameMaterial,
        frameColor: this.formFrameColor,
        orientation: this.formOrientation,
        quantity: Number(this.formQuantity) || 1,
        notes: this.formNotes
      }
    });

    this.storage.addNotification(
      'Order Saved',
      `Order #${savedOrder.orderNumber} for ${savedCustomer.name} saved successfully.`
    );

    this.toast.success(`Customer & Order #${savedOrder.orderNumber} saved!`);
    this.modalService.closeCustomerModal();
  }

  // --- Frame Size Modal Methods ---
  saveFrameSizeForm(e: Event): void {
    e.preventDefault();
    if (!this.formSizeName.trim()) {
      this.toast.error('Please provide size name.');
      return;
    }

    this.storage.saveFrameSize({
      id: this.formSizeId || undefined,
      name: this.formSizeName,
      width: Number(this.formSizeWidth) || 0,
      height: Number(this.formSizeHeight) || 0,
      unit: this.formSizeUnit,
      category: this.formSizeCategory
    });

    this.toast.success(`Frame size ${this.formSizeName} saved!`);
    this.modalService.closeFrameSizeModal();
  }

  // --- View Customer WhatsApp Action ---
  sendWhatsAppReceipt(customer: Customer, orders: Order[]): void {
    const latestOrder = orders[0];
    const text = `Hello ${customer.name},\n\nThank you for choosing *Raigon Arts Custom Framing*!\n\n📋 *Order Receipt Summary:*\nOrder Number: ${latestOrder?.orderNumber || 'N/A'}\nFrame Details: ${latestOrder?.photos?.length || 1} Photo(s) - ${latestOrder?.commonSpecs?.frameSize || '12 × 18 inch'}\nTotal Amount: ₹${latestOrder?.totalAmount || 0}\nAdvance Paid: ₹${latestOrder?.advancePaid || 0}\nBalance Due: ₹${latestOrder?.balanceAmount || 0}\nExpected Delivery: ${latestOrder?.deliveryDate || 'Within 7 days'}\n\nWorkshop: Raigon Arts, Trivandrum.\nContact: +91 79022261255`;

    const url = this.storage.generateWhatsAppUrl(customer.phone, text);
    window.open(url, '_blank');
  }

  editCustomerFromView(customer: Customer, orders: Order[]): void {
    this.modalService.closeViewCustomerModal();
    this.modalService.openCustomerModal('edit', customer.id, orders[0]?.id);
  }

  downloadPhoto(url: string, title: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = (title || 'photo') + '.jpg';
    link.click();
    this.toast.info('Downloading photo preview...');
  }
}
