import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewOrderService {

  // Reactive signal for zoneless change detection
  readonly isOpen = signal(false);

  // Event used to tell the New Order component that the modal should be opened.
  private openOrderSubject = new Subject<void>();
  readonly openOrder$ = this.openOrderSubject.asObservable();

  // Event for editing existing customer orders
  private editOrderSubject = new Subject<any>();
  readonly editOrder$ = this.editOrderSubject.asObservable();

  // Signal triggered whenever an order is saved
  readonly lastOrderSavedTime = signal<number>(0);

  // Event used to tell components that a new order has been saved
  private orderSavedSubject = new Subject<any>();
  readonly orderSaved$ = this.orderSavedSubject.asObservable();

  // Call this method from Dashboard or Sidebar
  // whenever Add New Order / New Order is clicked.
  openOrder(): void {
    this.isOpen.set(true);
    this.openOrderSubject.next();
  }

  openEditOrder(customer: any): void {
    this.isOpen.set(true);
    this.editOrderSubject.next(customer);
  }

  closeOrder(): void {
    this.isOpen.set(false);
  }

  // Call this method after saving an order to notify listeners (e.g. Dashboard, Customers)
  notifyOrderSaved(savedCustomer?: any): void {
    this.lastOrderSavedTime.set(Date.now());
    this.orderSavedSubject.next(savedCustomer);
  }
}
