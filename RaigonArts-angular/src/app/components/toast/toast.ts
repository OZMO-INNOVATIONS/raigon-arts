import { Component } from '@angular/core';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  template: `
    <div id="toastContainer" class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [class]="'toast-' + toast.type" (click)="toastService.dismiss(toast.id)">
          <i [class]="toast.icon"></i>
          <span>{{ toast.message }}</span>
        </div>
      }
    </div>
  `
})
export class Toast {
  constructor(public toastService: ToastService) {}
}
