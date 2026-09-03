import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService, Order } from '../../services/storage';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {
  orders: Order[] = [];
  totalBilled: number = 0;
  totalCollected: number = 0;
  totalOutstanding: number = 0;
  paidOrdersCount: number = 0;
  partialOrdersCount: number = 0;
  unpaidOrdersCount: number = 0;

  frameTypeCounts: { type: string; count: number; percentage: number }[] = [];

  constructor(
    private storage: StorageService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadReportsData();
  }

  loadReportsData(): void {
    this.orders = this.storage.getOrders();
    this.totalBilled = this.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    this.totalCollected = this.orders.reduce((sum, o) => sum + (o.advancePaid || 0), 0);
    this.totalOutstanding = this.orders.reduce((sum, o) => sum + (o.balanceAmount || 0), 0);

    this.paidOrdersCount = this.orders.filter(o => o.paymentStatus === 'Paid').length;
    this.partialOrdersCount = this.orders.filter(o => o.paymentStatus === 'Partial').length;
    this.unpaidOrdersCount = this.orders.filter(o => o.paymentStatus === 'Unpaid').length;

    const counts: { [key: string]: number } = {
      'Wooden Frame': 0,
      'Premium Frame': 0,
      'Classic Frame': 0,
      'Canvas Float': 0,
      'Box Frame': 0
    };

    let totalFrames = 0;
    this.orders.forEach(o => {
      const type = o.commonSpecs?.frameType || o.photos[0]?.frameType || 'Wooden Frame';
      counts[type] = (counts[type] || 0) + (o.photos?.length || 1);
      totalFrames += (o.photos?.length || 1);
    });

    this.frameTypeCounts = Object.keys(counts).map(type => ({
      type,
      count: counts[type],
      percentage: totalFrames > 0 ? Math.round((counts[type] / totalFrames) * 100) : 0
    }));
  }

  exportCSV(): void {
    let csv = 'Order Number,Customer Name,Phone,City,Order Date,Delivery Date,Total Amount,Advance Paid,Balance,Payment Status,Order Status\n';
    this.orders.forEach(o => {
      csv += `"${o.orderNumber}","${o.customerName}","${o.customerPhone}","${o.customerCity}","${o.orderDate}","${o.deliveryDate}",${o.totalAmount},${o.advancePaid},${o.balanceAmount},"${o.paymentStatus}","${o.orderStatus}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `RaigonArts_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    this.toast.success('Workshop Report CSV exported successfully!');
  }
}
