import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';

export interface QuickSearchResult {
  id: string;
  name: string;
  phone: string;
  city?: string;
  frameSize?: string;
  frameType?: string;
  totalAmount?: number;
  orderStatus: string;
  orderDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  readonly query = signal<string>('');
  readonly results = signal<QuickSearchResult[]>([]);
  readonly isDropdownOpen = signal<boolean>(false);

  private querySubject = new Subject<string>();
  readonly query$ = this.querySubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  setQuery(text: string): void {
    this.query.set(text);
    this.querySubject.next(text);

    const q = text.trim().toLowerCase();
    if (!q) {
      this.results.set([]);
      this.isDropdownOpen.set(false);
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      const customers: any[] = JSON.parse(
        localStorage.getItem('raigon_customers') || '[]'
      );

      const matches = customers.filter(c => {
        return (
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(q)) ||
          (c.id && c.id.toLowerCase().includes(q)) ||
          (c.city && c.city.toLowerCase().includes(q)) ||
          (c.address && c.address.toLowerCase().includes(q)) ||
          (c.frameSize && c.frameSize.toLowerCase().includes(q)) ||
          (c.orderStatus && c.orderStatus.toLowerCase().includes(q))
        );
      });

      this.results.set(matches);
      this.isDropdownOpen.set(true);
    }
  }

  clear(): void {
    this.query.set('');
    this.results.set([]);
    this.isDropdownOpen.set(false);
    this.querySubject.next('');
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }
}
