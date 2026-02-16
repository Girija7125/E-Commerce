import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Products } from './products/products';
import { Customers } from './customers/customers';
import { Orders } from './orders/orders';


export const routes: Routes = [
    {path:'',redirectTo:'/dashboard',pathMatch:'full'},
    {path:'dashboard',loadComponent:()=>import('./dashboard/dashboard').then((c)=>c.Dashboard)},
    {path:'products',loadComponent:()=>import('./products/products').then((c)=>c.Products)},
    {path:'customers',loadComponent:()=>import('./customers/customers').then((c)=>c.Customers)},
    {path:'orders',loadComponent:()=>import('./orders/orders').then((c)=>c.Orders)}
];
