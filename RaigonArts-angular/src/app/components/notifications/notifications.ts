import { Component } from '@angular/core';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [],
  template: `
    @if (notifService.isOpen()) {
      <div class="notifications-dropdown" (click)="$event.stopPropagation()">
        <div class="notifications-header">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-bell text-primary"></i>
            <span class="font-bold text-sm">Notifications</span>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 3px 8px;" (click)="notifService.markAllAsRead()">
            Mark All Read
          </button>
        </div>
        <div class="notifications-list">
          @for (item of notifService.notifications(); track item.id) {
            <div class="notification-item" [style.opacity]="item.isRead ? '0.7' : '1'">
              <div style="margin-top: 2px;">
                @if (item.type === 'order') {
                  <i class="fa-solid fa-boxes-packing text-primary"></i>
                } @else if (item.type === 'customer') {
                  <i class="fa-solid fa-user-check text-success"></i>
                } @else {
                  <i class="fa-solid fa-circle-info text-primary"></i>
                }
              </div>
              <div style="flex: 1;">
                <div class="font-semibold text-xs" style="color: var(--text-main);">{{ item.title }}</div>
                <div class="text-xs text-muted" style="margin-top: 2px;">{{ item.message }}</div>
                <div class="text-xs text-subtle" style="margin-top: 4px; font-size: 10px;">{{ item.time }}</div>
              </div>
            </div>
          } @empty {
            <div style="padding: 24px; text-align: center;" class="text-xs text-muted">
              No new notifications
            </div>
          }
        </div>
      </div>
    }
  `
})
export class Notifications {
  constructor(public notifService: NotificationService) {}
}
