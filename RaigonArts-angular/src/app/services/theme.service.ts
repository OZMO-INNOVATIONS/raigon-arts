import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly isDarkMode = signal<boolean>(localStorage.getItem('raigon_theme') === 'dark');

  constructor() {
    this.applyTheme(this.isDarkMode());
  }

  toggleTheme(): void {
    const nextMode = !this.isDarkMode();
    this.isDarkMode.set(nextMode);
    localStorage.setItem('raigon_theme', nextMode ? 'dark' : 'light');
    this.applyTheme(nextMode);
  }

  private applyTheme(isDark: boolean): void {
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  }
}
