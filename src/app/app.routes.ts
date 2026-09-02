import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Customers } from './pages/customers/customers';
import { NewOrder} from './pages/new-order/new-order';
import { Orders } from './pages/orders/orders';
import { FrameSizes } from './pages/frame-sizes/frame-sizes';
import { Categories } from './pages/categories/categories';
import { PhotoCollection } from './pages/photo-collection/photo-collection';
import { Reports } from './pages/reports/reports';
import { Settings } from './pages/settings/settings';
import { Login } from './pages/login/login';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: '',
    component: Dashboard,
    canActivate: [authGuard]
  },
   {
    path: 'customers',
    component: Customers,
    canActivate: [authGuard]
  },
   {
    path: 'new-order',
    component: NewOrder,
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    component: Orders,
    canActivate: [authGuard]
  },
  {
    path: 'photos',
    component: PhotoCollection,
    canActivate: [authGuard]
  },
  {
    path: 'frames',
    component: FrameSizes,
    canActivate: [authGuard]
  },
  {
    path: 'categories',
    component: Categories,
    canActivate: [authGuard]
  },
  {
    path: 'reports',
    component: Reports,
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    component: Settings,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];