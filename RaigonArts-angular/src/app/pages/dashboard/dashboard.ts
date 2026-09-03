import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StorageService, Order, Customer } from '../../services/storage';
import { ModalService } from '../../services/modal.service';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  orders: Order[] = [];
  customers: Customer[] = [];

  totalOrdersCount: number = 0;
  inProgressCount: number = 0;
  completedOrdersCount: number = 0;
  pendingOrdersCount: number = 0;
  totalRevenue: number = 0;

  constructor(
    private storage: StorageService,
    public modalService: ModalService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.orders = this.storage.getOrders();
    this.customers = this.storage.getCustomers();

    this.totalOrdersCount = this.orders.length;
    this.inProgressCount = this.orders.filter(o => o.orderStatus === 'In Progress').length;
    this.completedOrdersCount = this.orders.filter(o => o.orderStatus === 'Completed').length;
    this.pendingOrdersCount = this.orders.filter(o => o.orderStatus === 'Pending').length;
    this.totalRevenue = this.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  openNewCustomer(): void {
    this.modalService.openCustomerModal('create');
  }

  goToCustomers(): void {
    this.router.navigate(['/customers']);
  }

  viewCustomer(customerId: string): void {
    const cust = this.storage.getCustomerById(customerId) || this.customers.find(c => c.id === customerId);
    if (cust) {
      const custOrders = this.orders.filter(o => o.customerId === cust.id);
      this.modalService.openViewCustomerModal(cust, custOrders);
    } else {
      // Fallback view with order data
      const order = this.orders.find(o => o.customerId === customerId);
      if (order) {
        const tempCustomer: Customer = {
          id: order.customerId,
          name: order.customerName,
          phone: order.customerPhone,
          city: order.customerCity,
          address: 'Workshop Customer',
          pincode: '695001',
          createdAt: order.orderDate,
          totalOrdersCount: 1,
          totalSpent: order.totalAmount
        };
        this.modalService.openViewCustomerModal(tempCustomer, [order]);
      }
    }
  }

  editOrder(order: Order): void {
    this.modalService.openCustomerModal('edit', order.customerId, order.id);
  }

  deleteOrder(order: Order): void {
    this.modalService.openConfirmModal(
      'Delete Order',
      `Are you sure you want to delete order ${order.orderNumber}?`,
      () => {
        this.storage.deleteOrder(order.id);
        this.toast.success(`Order ${order.orderNumber} deleted.`);
        this.loadDashboardData();
      }
    );
  }

  getCustomerInitial(name: string): string {
    return name ? name.trim().charAt(0).toUpperCase() : 'C';
  }
}
