import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService, Customer, Order } from '../../services/storage';
import { ModalService } from '../../services/modal.service';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css'
})
export class Customers implements OnInit {
  customers: Customer[] = [];
  searchQuery: string = '';

  constructor(
    private storage: StorageService,
    public modalService: ModalService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customers = this.storage.getCustomers();
  }

  get filteredCustomers(): Customer[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.customers;
    return this.customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.city.toLowerCase().includes(q) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  }

  openAddCustomer(): void {
    this.modalService.openCustomerModal('create');
  }

  viewCustomer(c: Customer): void {
    const orders = this.storage.getOrders().filter(o => o.customerId === c.id);
    this.modalService.openViewCustomerModal(c, orders);
  }

  editCustomer(c: Customer): void {
    const orders = this.storage.getOrders().filter(o => o.customerId === c.id);
    this.modalService.openCustomerModal('edit', c.id, orders[0]?.id);
  }

  addNewOrderForCustomer(c: Customer): void {
    this.modalService.openCustomerModal('create', c.id);
  }

  deleteCustomer(c: Customer): void {
    this.modalService.openConfirmModal(
      'Delete Customer',
      `Are you sure you want to delete customer ${c.name}?`,
      () => {
        this.storage.deleteCustomer(c.id);
        this.toast.success(`Customer ${c.name} deleted.`);
        this.loadCustomers();
      }
    );
  }

  sendWhatsApp(c: Customer): void {
    const text = `Hello ${c.name},\n\nThank you for reaching out to *Raigon Arts Custom Framing*!\nHow can we help you with your photo framing needs today?`;
    const url = this.storage.generateWhatsAppUrl(c.phone, text);
    window.open(url, '_blank');
  }
}
