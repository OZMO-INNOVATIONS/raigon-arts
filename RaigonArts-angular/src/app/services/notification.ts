import { Injectable, signal } from '@angular/core';
import { StorageService, NotificationItem } from './storage';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly isOpen = signal<boolean>(false);
  readonly notifications = signal<NotificationItem[]>([]);

  constructor(private storage: StorageService) {
    this.refresh();
  }

  refresh(): void {
    this.notifications.set(this.storage.getNotifications());
  }

  get unreadCount(): number {
    return this.notifications().filter(n => !n.isRead).length;
  }

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  markAllAsRead(): void {
    this.storage.markAllNotificationsRead();
    this.refresh();
  }
}
