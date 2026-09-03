import { Injectable } from '@angular/core';

export interface PhotoFrameConfig {
  id?: string;
  photoUrl: string;
  photoName: string;
  frameSize: string;
  unit: string;
  customWidth?: number;
  customHeight?: number;
  frameType: string;
  frameMaterial: string;
  frameColor: string;
  orientation: 'Landscape' | 'Portrait' | 'Square';
  quantity: number;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  altPhone?: string;
  city: string;
  address: string;
  pincode: string;
  createdAt: string;
  totalOrdersCount?: number;
  totalSpent?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  orderStatus: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  configMode: 'same' | 'individual';
  photos: PhotoFrameConfig[];
  commonSpecs?: {
    frameSize: string;
    unit: string;
    customWidth?: number;
    customHeight?: number;
    frameType: string;
    frameMaterial: string;
    frameColor: string;
    orientation: 'Landscape' | 'Portrait' | 'Square';
    quantity: number;
    notes?: string;
  };
  createdAt: string;
}

export interface FrameSize {
  id: string;
  code?: string;
  name: string;
  width: number;
  height: number;
  unit: 'inch' | 'cm' | 'mm' | string;
  category: 'Standard Photo' | 'Medium Portrait' | 'Large Gallery' | 'Exhibition Wall Art' | 'Custom Size';
  activeOrdersCount?: number;
  status?: 'Active' | 'Inactive' | string;
}

export interface WorkshopSettings {
  workshopName: string;
  subtitle: string;
  phone: string;
  whatsappPhone: string;
  address: string;
  currency: string;
  adminUsername: string;
  taxRate: number;
  registeredPhone: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'order' | 'customer' | 'alert' | 'system';
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly CUSTOMERS_KEY = 'raigon_customers_v1';
  private readonly ORDERS_KEY = 'raigon_orders_v1';
  private readonly FRAMES_KEY = 'raigon_frames_v1';
  private readonly SETTINGS_KEY = 'raigon_settings_v1';
  private readonly NOTIFICATIONS_KEY = 'raigon_notifications_v1';

  constructor() {
    this.initDefaultData();
  }

  private initDefaultData(): void {
    if (!localStorage.getItem(this.CUSTOMERS_KEY)) {
      const defaultCustomers: Customer[] = [
        {
          id: 'cust_101',
          name: 'Arun Kumar',
          phone: '+91 7902261255',
          altPhone: '+91 9447000000',
          city: 'Trivandrum',
          address: 'Villa 42, Palm Meadows, Kowdiar',
          pincode: '695003',
          createdAt: '2026-08-20',
          totalOrdersCount: 2,
          totalSpent: 4800
        },
        {
          id: 'cust_102',
          name: 'Meera Nair',
          phone: '+91 9847123456',
          altPhone: '+91 7902261255',
          city: 'Kochi',
          address: '4B Skyline Horizon, Marine Drive',
          pincode: '682031',
          createdAt: '2026-08-25',
          totalOrdersCount: 1,
          totalSpent: 3200
        },
        {
          id: 'cust_103',
          name: 'Rahul Varma',
          phone: '+91 9446554433',
          altPhone: '',
          city: 'Kollam',
          address: 'Beach Road, Near Light House',
          pincode: '691001',
          createdAt: '2026-08-28',
          totalOrdersCount: 1,
          totalSpent: 1800
        },
        {
          id: 'cust_104',
          name: 'Ananya Sreedhar',
          phone: '+91 8129001122',
          altPhone: '+91 9895003344',
          city: 'Calicut',
          address: 'Green Valley Villa 12, Chevayur',
          pincode: '673017',
          createdAt: '2026-09-01',
          totalOrdersCount: 1,
          totalSpent: 5500
        }
      ];
      localStorage.setItem(this.CUSTOMERS_KEY, JSON.stringify(defaultCustomers));
    }

    if (!localStorage.getItem(this.ORDERS_KEY)) {
      const defaultOrders: Order[] = [
        {
          id: 'ord_1006',
          orderNumber: 'RA-1006',
          customerId: 'cust_106',
          customerName: 'Name',
          customerPhone: '64451154548184',
          customerCity: 'h',
          orderDate: '2026-09-02',
          deliveryDate: '2026-09-09',
          totalAmount: 2500,
          advancePaid: 1000,
          balanceAmount: 1500,
          paymentStatus: 'Partial',
          orderStatus: 'In Progress',
          configMode: 'same',
          photos: [
            {
              id: 'p6',
              photoUrl: 'assets/images/sample_frame_1.svg',
              photoName: 'Gallery_Memory.jpg',
              frameSize: '12 × 18 inch',
              unit: 'inch',
              frameType: 'Wooden Frame',
              frameMaterial: 'Teak Wood Moulding',
              frameColor: 'Walnut Brown',
              orientation: 'Landscape',
              quantity: 1
            }
          ],
          commonSpecs: {
            frameSize: '12 × 18 inch',
            unit: 'inch',
            frameType: 'Wooden Frame',
            frameMaterial: 'Teak Wood Moulding',
            frameColor: 'Walnut Brown',
            orientation: 'Landscape',
            quantity: 1
          },
          createdAt: '2026-09-02T10:00:00Z'
        },
        {
          id: 'ord_1001',
          orderNumber: 'RA-1001',
          customerId: 'cust_101',
          customerName: 'Arun Kumarddd',
          customerPhone: '7902261255',
          customerCity: 'Trivandrum',
          orderDate: '2026-08-28',
          deliveryDate: '2026-09-05',
          totalAmount: 4500,
          advancePaid: 0,
          balanceAmount: 4500,
          paymentStatus: 'Unpaid',
          orderStatus: 'Cancelled',
          configMode: 'same',
          photos: [
            {
              id: 'p1',
              photoUrl: 'assets/images/sample_frame_1.svg',
              photoName: 'Family_Portrait_Kowdiar.jpg',
              frameSize: '12 × 18 inch',
              unit: 'inch',
              frameType: 'Wooden Frame',
              frameMaterial: 'Teak Wood Moulding',
              frameColor: 'Walnut Brown',
              orientation: 'Landscape',
              quantity: 2
            }
          ],
          commonSpecs: {
            frameSize: '12 × 18 inch',
            unit: 'inch',
            frameType: 'Wooden Frame',
            frameMaterial: 'Teak Wood Moulding',
            frameColor: 'Walnut Brown',
            orientation: 'Landscape',
            quantity: 2
          },
          createdAt: '2026-08-28T10:30:00Z'
        },
        {
          id: 'ord_1002',
          orderNumber: 'RA-1002',
          customerId: 'cust_102',
          customerName: 'Fathima',
          customerPhone: '7902261255',
          customerCity: 'Kochi',
          orderDate: '2026-08-29',
          deliveryDate: '2026-09-06',
          totalAmount: 2200,
          advancePaid: 1000,
          balanceAmount: 1200,
          paymentStatus: 'Partial',
          orderStatus: 'In Progress',
          configMode: 'same',
          photos: [
            {
              id: 'p2',
              photoUrl: 'assets/images/sample_frame_2.svg',
              photoName: 'Studio_Portraits.jpg',
              frameSize: '8 × 12 inch',
              unit: 'inch',
              frameType: 'Premium Frame',
              frameMaterial: 'Gold Leaf Moulding',
              frameColor: 'Classic Gold',
              orientation: 'Portrait',
              quantity: 1
            }
          ],
          commonSpecs: {
            frameSize: '8 × 12 inch',
            unit: 'inch',
            frameType: 'Premium Frame',
            frameMaterial: 'Gold Leaf Moulding',
            frameColor: 'Classic Gold',
            orientation: 'Portrait',
            quantity: 1
          },
          createdAt: '2026-08-29T14:15:00Z'
        },
        {
          id: 'ord_1003',
          orderNumber: 'RA-1003',
          customerId: 'cust_103',
          customerName: 'Rahul Raj',
          customerPhone: '7902261255',
          customerCity: 'Kollam',
          orderDate: '2026-08-30',
          deliveryDate: '2026-09-02',
          totalAmount: 12000,
          advancePaid: 12000,
          balanceAmount: 0,
          paymentStatus: 'Paid',
          orderStatus: 'Completed',
          configMode: 'same',
          photos: [
            {
              id: 'p3',
              photoUrl: 'assets/images/sample_frame_1.svg',
              photoName: 'Lighthouse_Sunset.jpg',
              frameSize: '16 × 20 inch',
              unit: 'inch',
              frameType: 'Classic Frame',
              frameMaterial: 'Matte Black Wood',
              frameColor: 'Matte Black',
              orientation: 'Landscape',
              quantity: 4
            }
          ],
          commonSpecs: {
            frameSize: '16 × 20 inch',
            unit: 'inch',
            frameType: 'Classic Frame',
            frameMaterial: 'Matte Black Wood',
            frameColor: 'Matte Black',
            orientation: 'Landscape',
            quantity: 4
          },
          createdAt: '2026-08-30T11:00:00Z'
        },
        {
          id: 'ord_1004',
          orderNumber: 'RA-1004',
          customerId: 'cust_104',
          customerName: 'Ananya Nair',
          customerPhone: '7902261255',
          customerCity: 'Kozhikode',
          orderDate: '2026-08-31',
          deliveryDate: '2026-09-07',
          totalAmount: 6800,
          advancePaid: 0,
          balanceAmount: 6800,
          paymentStatus: 'Unpaid',
          orderStatus: 'Cancelled',
          configMode: 'same',
          photos: [
            {
              id: 'p4',
              photoUrl: 'assets/images/sample_frame_2.svg',
              photoName: 'Canvas_Art_Mural.jpg',
              frameSize: '20 × 30 inch',
              unit: 'inch',
              frameType: 'Canvas Float',
              frameMaterial: 'Natural Pine Wood',
              frameColor: 'Natural Pine',
              orientation: 'Square',
              quantity: 1
            }
          ],
          commonSpecs: {
            frameSize: '20 × 30 inch',
            unit: 'inch',
            frameType: 'Canvas Float',
            frameMaterial: 'Natural Pine Wood',
            frameColor: 'Natural Pine',
            orientation: 'Square',
            quantity: 1
          },
          createdAt: '2026-08-31T16:00:00Z'
        },
        {
          id: 'ord_1005',
          orderNumber: 'RA-1005',
          customerId: 'cust_105',
          customerName: 'Meera Nair',
          customerPhone: '7902261255',
          customerCity: 'Kochi',
          orderDate: '2026-09-01',
          deliveryDate: '2026-09-08',
          totalAmount: 3600,
          advancePaid: 1500,
          balanceAmount: 2100,
          paymentStatus: 'Partial',
          orderStatus: 'In Progress',
          configMode: 'same',
          photos: [
            {
              id: 'p5',
              photoUrl: 'assets/images/sample_frame_1.svg',
              photoName: 'Landscape_Prints.jpg',
              frameSize: '12 × 18 inch',
              unit: 'inch',
              frameType: 'Wooden Frame',
              frameMaterial: 'Teak Wood Moulding',
              frameColor: 'Walnut Brown',
              orientation: 'Landscape',
              quantity: 1
            }
          ],
          commonSpecs: {
            frameSize: '12 × 18 inch',
            unit: 'inch',
            frameType: 'Wooden Frame',
            frameMaterial: 'Teak Wood Moulding',
            frameColor: 'Walnut Brown',
            orientation: 'Landscape',
            quantity: 1
          },
          createdAt: '2026-09-01T12:00:00Z'
        }
      ];
      localStorage.setItem(this.ORDERS_KEY, JSON.stringify(defaultOrders));
    }

    if (!localStorage.getItem(this.FRAMES_KEY)) {
      const defaultFrames: FrameSize[] = [
        { id: 'f1', code: 'FS-01', name: '4 × 6 inch', width: 4, height: 6, unit: 'inch', category: 'Standard Photo', activeOrdersCount: 142, status: 'Active' },
        { id: 'f2', code: 'FS-02', name: '5 × 7 inch', width: 5, height: 7, unit: 'inch', category: 'Standard Photo', activeOrdersCount: 98, status: 'Active' },
        { id: 'f3', code: 'FS-03', name: '8 × 10 inch', width: 8, height: 10, unit: 'inch', category: 'Medium Portrait', activeOrdersCount: 210, status: 'Active' },
        { id: 'f4', code: 'FS-04', name: '8 × 12 inch', width: 8, height: 12, unit: 'inch', category: 'Medium Portrait', activeOrdersCount: 320, status: 'Active' },
        { id: 'f5', code: 'FS-05', name: '12 × 18 inch', width: 12, height: 18, unit: 'inch', category: 'Large Gallery', activeOrdersCount: 455, status: 'Active' },
        { id: 'f6', code: 'FS-06', name: '16 × 20 inch', width: 16, height: 20, unit: 'inch', category: 'Large Gallery', activeOrdersCount: 184, status: 'Active' },
        { id: 'f7', code: 'FS-07', name: '20 × 30 inch', width: 20, height: 30, unit: 'inch', category: 'Exhibition Wall Art', activeOrdersCount: 92, status: 'Active' }
      ];
      localStorage.setItem(this.FRAMES_KEY, JSON.stringify(defaultFrames));
    }

    if (!localStorage.getItem(this.SETTINGS_KEY)) {
      const defaultSettings: WorkshopSettings = {
        workshopName: 'Raigon Arts',
        subtitle: 'Custom Photo Framing & Studio Workshop',
        phone: '+91 7902261255',
        whatsappPhone: '+91 7902261255',
        address: 'Workshop St, Art District, Trivandrum, Kerala 695001',
        currency: '₹',
        adminUsername: 'admin',
        taxRate: 5,
        registeredPhone: '+91 7902261255'
      };
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(defaultSettings));
    }

    if (!localStorage.getItem(this.NOTIFICATIONS_KEY)) {
      const defaultNotifications: NotificationItem[] = [
        { id: 'n1', title: 'New Order Received', message: 'Order #RA-2026-0844 created for Rahul Varma', time: '10m ago', isRead: false, type: 'order' },
        { id: 'n2', title: 'Payment Updated', message: 'Advance paid ₹1000 for Order #RA-2026-0842', time: '1h ago', isRead: false, type: 'order' },
        { id: 'n3', title: 'Customer Profile Created', message: 'Ananya Sreedhar added from Calicut', time: '2h ago', isRead: true, type: 'customer' }
      ];
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(defaultNotifications));
    }
  }

  // --- CUSTOMERS ---
  getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(this.CUSTOMERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getCustomerById(id: string): Customer | undefined {
    return this.getCustomers().find(c => c.id === id);
  }

  saveCustomer(customer: Partial<Customer>): Customer {
    const list = this.getCustomers();
    if (customer.id) {
      const index = list.findIndex(c => c.id === customer.id);
      if (index !== -1) {
        list[index] = { ...list[index], ...customer } as Customer;
        localStorage.setItem(this.CUSTOMERS_KEY, JSON.stringify(list));
        return list[index];
      }
    }
    const newCustomer: Customer = {
      id: 'cust_' + Date.now(),
      name: customer.name || 'New Customer',
      phone: customer.phone || '',
      altPhone: customer.altPhone || '',
      city: customer.city || '',
      address: customer.address || '',
      pincode: customer.pincode || '',
      createdAt: new Date().toISOString().split('T')[0],
      totalOrdersCount: 0,
      totalSpent: 0
    };
    list.unshift(newCustomer);
    localStorage.setItem(this.CUSTOMERS_KEY, JSON.stringify(list));
    return newCustomer;
  }

  deleteCustomer(id: string): void {
    const list = this.getCustomers().filter(c => c.id !== id);
    localStorage.setItem(this.CUSTOMERS_KEY, JSON.stringify(list));
  }

  // --- ORDERS ---
  getOrders(): Order[] {
    try {
      const data = localStorage.getItem(this.ORDERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id);
  }

  saveOrder(order: Partial<Order>): Order {
    const list = this.getOrders();
    const balance = (order.totalAmount || 0) - (order.advancePaid || 0);
    const paymentStatus = balance <= 0 ? 'Paid' : (order.advancePaid || 0) > 0 ? 'Partial' : 'Unpaid';

    if (order.id) {
      const index = list.findIndex(o => o.id === order.id);
      if (index !== -1) {
        list[index] = {
          ...list[index],
          ...order,
          balanceAmount: Math.max(0, balance),
          paymentStatus: order.paymentStatus || paymentStatus
        } as Order;
        localStorage.setItem(this.ORDERS_KEY, JSON.stringify(list));
        return list[index];
      }
    }

    const newOrder: Order = {
      id: 'ord_' + Date.now(),
      orderNumber: 'RA-2026-' + Math.floor(1000 + Math.random() * 9000),
      customerId: order.customerId || '',
      customerName: order.customerName || 'Customer',
      customerPhone: order.customerPhone || '',
      customerCity: order.customerCity || '',
      orderDate: order.orderDate || new Date().toISOString().split('T')[0],
      deliveryDate: order.deliveryDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      totalAmount: order.totalAmount || 0,
      advancePaid: order.advancePaid || 0,
      balanceAmount: Math.max(0, balance),
      paymentStatus: paymentStatus,
      orderStatus: order.orderStatus || 'Pending',
      configMode: order.configMode || 'same',
      photos: order.photos || [],
      commonSpecs: order.commonSpecs,
      createdAt: new Date().toISOString()
    };
    list.unshift(newOrder);
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(list));

    // Update customer stats
    this.updateCustomerOrderStats(newOrder.customerId);
    return newOrder;
  }

  deleteOrder(id: string): void {
    const order = this.getOrderById(id);
    const list = this.getOrders().filter(o => o.id !== id);
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(list));
    if (order?.customerId) {
      this.updateCustomerOrderStats(order.customerId);
    }
  }

  private updateCustomerOrderStats(customerId: string): void {
    if (!customerId) return;
    const orders = this.getOrders().filter(o => o.customerId === customerId);
    const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const customers = this.getCustomers();
    const custIndex = customers.findIndex(c => c.id === customerId);
    if (custIndex !== -1) {
      customers[custIndex].totalOrdersCount = orders.length;
      customers[custIndex].totalSpent = totalSpent;
      localStorage.setItem(this.CUSTOMERS_KEY, JSON.stringify(customers));
    }
  }

  // --- FRAMES ---
  getFrameSizes(): FrameSize[] {
    try {
      const data = localStorage.getItem(this.FRAMES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveFrameSize(frame: Partial<FrameSize>): FrameSize {
    const list = this.getFrameSizes();
    if (frame.id) {
      const index = list.findIndex(f => f.id === frame.id);
      if (index !== -1) {
        list[index] = { ...list[index], ...frame } as FrameSize;
        localStorage.setItem(this.FRAMES_KEY, JSON.stringify(list));
        return list[index];
      }
    }
    const newFrame: FrameSize = {
      id: 'f_' + Date.now(),
      name: frame.name || 'New Size',
      width: frame.width || 0,
      height: frame.height || 0,
      unit: frame.unit || 'inch',
      category: frame.category || 'Standard Photo',
      activeOrdersCount: 0
    };
    list.push(newFrame);
    localStorage.setItem(this.FRAMES_KEY, JSON.stringify(list));
    return newFrame;
  }

  deleteFrameSize(id: string): void {
    const list = this.getFrameSizes().filter(f => f.id !== id);
    localStorage.setItem(this.FRAMES_KEY, JSON.stringify(list));
  }

  // --- PHOTOS ---
  getAllPhotos(): { id: string; photoUrl: string; photoName: string; customerName: string; orderId: string; frameSize: string; orientation: string; uploadDate: string }[] {
    const orders = this.getOrders();
    const photos: { id: string; photoUrl: string; photoName: string; customerName: string; orderId: string; frameSize: string; orientation: string; uploadDate: string }[] = [];
    orders.forEach(order => {
      (order.photos || []).forEach(p => {
        photos.push({
          id: p.id || Math.random().toString(),
          photoUrl: p.photoUrl || 'assets/images/sample_frame_1.svg',
          photoName: p.photoName || 'Customer Photo',
          customerName: order.customerName,
          orderId: order.orderNumber,
          frameSize: p.frameSize || order.commonSpecs?.frameSize || '12 × 18 inch',
          orientation: p.orientation || 'Landscape',
          uploadDate: order.orderDate
        });
      });
    });
    return photos;
  }

  // --- SETTINGS ---
  getSettings(): WorkshopSettings {
    try {
      const data = localStorage.getItem(this.SETTINGS_KEY);
      return data ? JSON.parse(data) : {
        workshopName: 'Raigon Arts',
        subtitle: 'Custom Photo Framing & Studio Workshop',
        phone: '+91 7902261255',
        whatsappPhone: '+91 7902261255',
        address: 'Workshop St, Art District, Trivandrum, Kerala 695001',
        currency: '₹',
        adminUsername: 'admin',
        taxRate: 5,
        registeredPhone: '+91 7902261255'
      };
    } catch {
      return {} as WorkshopSettings;
    }
  }

  saveSettings(settings: Partial<WorkshopSettings>): WorkshopSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  }

  // --- NOTIFICATIONS ---
  getNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem(this.NOTIFICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  markAllNotificationsRead(): void {
    const list = this.getNotifications().map(n => ({ ...n, isRead: true }));
    localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(list));
  }

  addNotification(title: string, message: string, type: 'order' | 'customer' | 'alert' | 'system' = 'order'): void {
    const list = this.getNotifications();
    list.unshift({
      id: 'n_' + Date.now(),
      title,
      message,
      time: 'Just now',
      isRead: false,
      type
    });
    localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(list));
  }

  // --- WHATSAPP HELPER ---
  generateWhatsAppUrl(phone: string, text: string): string {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(text);
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }
}
