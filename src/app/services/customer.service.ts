import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface CustomerPhoto {
  id?: number;
  url: string;
  name?: string;
  customerId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  city: string;
  address?: string;
  pincode?: string;
  altPhone?: string;
  frameSize: string;
  frameType: string;
  quantity: number;
  totalAmount: number;
  advancePaid?: number;
  balanceAmount?: number;
  paymentStatus?: string;
  orderStatus: string;
  orderDate: string;
  deliveryDate?: string;
  material?: string;
  color?: string;
  orientation?: string;
  notes?: string;
  photos?: any[];
}

export const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'RA-1001',
    name: 'Arun Kumar',
    phone: '9876543210',
    altPhone: 'None',
    city: 'Ernakulam',
    address: 'MG Road, Kochi',
    pincode: '682016',
    frameSize: '12 × 18 inch',
    frameType: 'Wooden Frame',
    material: 'Solid Teak Wood',
    color: 'Dark Walnut',
    orientation: 'Portrait',
    quantity: 2,
    notes: 'Matte glass finish with wooden bevelled border.',
    totalAmount: 4500,
    advancePaid: 2000,
    balanceAmount: 2500,
    paymentStatus: 'Partial',
    orderStatus: 'Pending',
    orderDate: 'Aug 27, 2026',
    deliveryDate: 'Sep 02, 2026',
    photos: [
      { url: 'assets/images/sample_frame_1.jpg', name: 'Photo_1.jpg' },
      { url: 'assets/images/sample_frame_2.jpg', name: 'Photo_2.jpg' },
      { url: 'assets/images/sample_frame_1.jpg', name: 'Photo_3.jpg' },
      { url: 'assets/images/sample_frame_2.jpg', name: 'Photo_4.jpg' },
      { url: 'assets/images/sample_frame_1.jpg', name: 'Photo_5.jpg' }
    ]
  },
  {
    id: 'RA-1002',
    name: 'Fathima',
    phone: '9876543211',
    altPhone: 'None',
    city: 'Kochi',
    address: 'Flat 4B, Marine Drive Towers',
    pincode: '682031',
    frameSize: '8 × 12 inch',
    frameType: 'Premium Frame',
    material: 'Gold Filigree Resin',
    color: 'Antique Gold',
    orientation: 'Portrait',
    quantity: 1,
    notes: 'Customer requested double velvet passe-partout matting.',
    totalAmount: 2200,
    advancePaid: 2200,
    balanceAmount: 0,
    paymentStatus: 'Paid',
    orderStatus: 'In Progress',
    orderDate: 'Aug 26, 2026',
    deliveryDate: 'Aug 29, 2026',
    photos: [
      { url: 'assets/images/sample_frame_1.jpg', name: 'Family_Portrait.jpg' },
      { url: 'assets/images/sample_frame_2.jpg', name: 'Landscape.jpg' },
      { url: 'assets/images/sample_frame_1.jpg', name: 'Frame_Preview.jpg' }
    ]
  },
  {
    id: 'RA-1003',
    name: 'Rahul Raj',
    phone: '9876543212',
    altPhone: 'None',
    city: 'Kollam',
    address: 'Near Beach Road, Kadap ..',
    pincode: '691001',
    frameSize: '16 × 20 inch',
    frameType: 'Classic Frame',
    material: 'Natural Pine Wood',
    color: 'Matte Black',
    orientation: 'Landscape',
    quantity: 4,
    notes: 'Standard clear glass with wall mounting brackets.',
    totalAmount: 12000,
    advancePaid: 5000,
    balanceAmount: 7000,
    paymentStatus: 'Partial',
    orderStatus: 'Pending',
    orderDate: 'Aug 25, 2026',
    deliveryDate: 'Sep 05, 2026',
    photos: [
      { url: 'assets/images/sample_frame_1.jpg', name: 'Portrait_1.jpg' },
      { url: 'assets/images/sample_frame_2.jpg', name: 'Portrait_2.jpg' }
    ]
  },
  {
    id: 'RA-1004',
    name: 'Ananya Nair',
    phone: '9876543213',
    altPhone: 'None',
    city: 'Kozhikode',
    address: '12/450, Calicut Beach Av ..',
    pincode: '673001',
    frameSize: '20 × 30 inch',
    frameType: 'Canvas Float',
    material: 'Shadow Box Aluminium',
    color: 'Champagne Gold',
    orientation: 'Portrait',
    quantity: 1,
    notes: 'Premium museum-grade anti-glare glass requested.',
    totalAmount: 6800,
    advancePaid: 6800,
    balanceAmount: 0,
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    orderDate: 'Aug 24, 2026',
    deliveryDate: 'Aug 27, 2026',
    photos: [
      { url: 'assets/images/sample_frame_1.jpg', name: 'Canvas_Art.jpg' },
      { url: 'assets/images/sample_frame_2.jpg', name: 'Canvas_Art_2.jpg' }
    ]
  },
  {
    id: 'RA-1005',
    name: 'Deepak Varma',
    phone: '9876543214',
    altPhone: 'None',
    city: 'Kottayam',
    address: 'Kottayam Central',
    pincode: '686001',
    frameSize: '8 × 10 inch',
    frameType: 'Box Frame',
    material: 'Teak Wood Moulding',
    color: 'Walnut Brown',
    orientation: 'Square',
    quantity: 3,
    notes: '',
    totalAmount: 3600,
    advancePaid: 0,
    balanceAmount: 3600,
    paymentStatus: 'Unpaid',
    orderStatus: 'Cancelled',
    orderDate: 'Aug 25, 2026',
    deliveryDate: 'N/A',
    photos: [
      { url: 'assets/images/sample_frame_1.jpg', name: 'Photo_1.jpg' }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly apiUrl = 'http://localhost:5000/api/customers';
  private http = inject(HttpClient);

  getCustomers(): Observable<Customer[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => {
        if (Array.isArray(res)) {
          return res as Customer[];
        }
        if (res && typeof res === 'object') {
          if (Array.isArray(res.value)) return res.value as Customer[];
          if (Array.isArray(res.$values)) return res.$values as Customer[];
          if (Array.isArray(res.data)) return res.data as Customer[];
        }
        return [];
      }),
      catchError(err => {
        console.warn('CustomerService.getCustomers HTTP request failed:', err);
        return throwError(() => err);
      })
    );
  }

  getCustomer(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  createCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer);
  }

  updateCustomer(id: string, customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, customer);
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
