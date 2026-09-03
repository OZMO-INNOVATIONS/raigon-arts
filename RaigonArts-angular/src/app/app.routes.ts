import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'customers',
    loadComponent: () => import('./pages/customers/customers').then(m => m.Customers)
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders').then(m => m.Orders)
  },
  {
    path: 'photos',
    loadComponent: () => import('./pages/photos/photos').then(m => m.Photos)
  },
  {
    path: 'frames',
    loadComponent: () => import('./pages/frames/frames').then(m => m.Frames)
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/reports').then(m => m.Reports)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then(m => m.Settings)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];