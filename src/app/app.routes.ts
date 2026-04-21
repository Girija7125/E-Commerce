import { Routes } from '@angular/router';
import { Dashboard }      from './dashboard/dashboard';
import { Products }       from './products/products';
import { Customers }      from './customers/customers';
import { Orders }         from './orders/orders';
import { Authentication } from './Authentication/authentication';
import { Unauthorized }   from './unauthorized/unauthorized';
import { Admin }          from './admin/admin';
import { authGuard }      from './guards/auth-guard';
import { roleGuard }      from './guards/role-guard';
import { permissionGuard } from './guards/permission-guard';
import { Profile } from './profile/profile';

export const routes: Routes = [
  { path: '',             redirectTo: '/login',  pathMatch: 'full' },
  { path: 'login',        component: Authentication },
  { path: 'unauthorized', component: Unauthorized },
  { path: 'profile', component: Profile },
  { path: 'dashboard',    component: Dashboard,   canActivate: [authGuard] },
  { path: 'admin',        component: Admin,       canActivate: [roleGuard],      data: { roles: ['admin'] } },
  { path: 'products',     component: Products,    canActivate: [authGuard, permissionGuard], data: { section: 'products' } },
  { path: 'orders',       component: Orders,      canActivate: [authGuard, permissionGuard], data: { section: 'orders' } },
  { path: 'customers',    component: Customers,   canActivate: [authGuard, permissionGuard], data: { section: 'customers' } },
];