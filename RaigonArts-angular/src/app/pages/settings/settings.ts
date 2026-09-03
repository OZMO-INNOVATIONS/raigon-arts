import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StorageService, WorkshopSettings } from '../../services/storage';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings implements OnInit {
  settings: WorkshopSettings = {} as WorkshopSettings;

  constructor(
    private storage: StorageService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.settings = this.storage.getSettings();
  }

  saveSettings(e: Event): void {
    e.preventDefault();
    this.storage.saveSettings(this.settings);
    this.toast.success('Workshop settings saved successfully!');
  }

  backupData(): void {
    const data = {
      customers: this.storage.getCustomers(),
      orders: this.storage.getOrders(),
      frames: this.storage.getFrameSizes(),
      settings: this.storage.getSettings(),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `RaigonArts_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    this.toast.success('Database backup JSON exported.');
  }

  resetDemoData(): void {
    if (confirm('Are you sure you want to restore default demo data? All custom test entries will reset.')) {
      localStorage.removeItem('raigon_customers_v1');
      localStorage.removeItem('raigon_orders_v1');
      localStorage.removeItem('raigon_frames_v1');
      localStorage.removeItem('raigon_settings_v1');
      window.location.reload();
    }
  }
}
