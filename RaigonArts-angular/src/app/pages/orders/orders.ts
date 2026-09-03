import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService, Order, Customer } from '../../services/storage';
import { ModalService } from '../../services/modal.service';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  orders: Order[] = [];
  selectedFilter: string = 'All';
  searchQuery: string = '';

  constructor(
    private storage: StorageService,
    public modalService: ModalService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orders = this.storage.getOrders();
  }

  get filteredOrders(): Order[] {
    let list = this.orders;
    if (this.selectedFilter !== 'All') {
      list = list.filter(o => o.orderStatus === this.selectedFilter);
    }
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      );
    }
    return list;
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
  }

  openNewOrder(): void {
    this.modalService.openCustomerModal('create');
  }

  editOrder(order: Order): void {
    this.modalService.openCustomerModal('edit', order.customerId, order.id);
  }

  viewCustomer(customerId: string): void {
    const cust = this.storage.getCustomerById(customerId);
    if (cust) {
      const custOrders = this.orders.filter(o => o.customerId === cust.id);
      this.modalService.openViewCustomerModal(cust, custOrders);
    }
  }

  updateOrderStatus(order: Order, newStatus: any): void {
    order.orderStatus = newStatus;
    this.storage.saveOrder(order);
    this.toast.success(`Order ${order.orderNumber} status updated to ${newStatus}`);
  }

  deleteOrder(order: Order): void {
    this.modalService.openConfirmModal(
      'Delete Order',
      `Are you sure you want to delete order ${order.orderNumber}?`,
      () => {
        this.storage.deleteOrder(order.id);
        this.toast.success(`Order ${order.orderNumber} deleted.`);
        this.loadOrders();
      }
    );
  }

  sendWhatsAppReceipt(order: Order): void {
    const cust = this.storage.getCustomerById(order.customerId);
    if (!cust) return;
    const text = `Hello ${order.customerName},\n\nYour frame order *${order.orderNumber}* status is *${order.orderStatus}*.\nTotal: ₹${order.totalAmount} | Advance Paid: ₹${order.advancePaid} | Balance: ₹${order.balanceAmount}.\nExpected Delivery: ${order.deliveryDate}.\n\nRaigon Arts Workshop.`;
    const url = this.storage.generateWhatsAppUrl(cust.phone, text);
    window.open(url, '_blank');
  }
}
