import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', icon?: string): void {
    const id = 'toast_' + Date.now() + Math.random().toString().slice(2, 6);
    
    let defaultIcon = 'fa-solid fa-circle-info';
    if (type === 'success') defaultIcon = 'fa-solid fa-circle-check';
    if (type === 'error') defaultIcon = 'fa-solid fa-triangle-exclamation';
    if (type === 'warning') defaultIcon = 'fa-solid fa-circle-exclamation';

    const newToast: ToastMessage = {
      id,
      message,
      type,
      icon: icon || defaultIcon
    };

    this.toasts.update(current => [...current, newToast]);

    setTimeout(() => {
      this.dismiss(id);
    }, 4000);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
