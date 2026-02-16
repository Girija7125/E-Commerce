import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'fa-solid fa-house fa-2x fs-2' },
    { path: '/products', label: 'Products', icon: 'fa-solid fa-box fa-2x fs-2' },
    { path: '/orders', label: 'Orders', icon: 'fa-solid fa-cart-shopping fa-2x fs-2' },
    { path: '/customers', label: 'Customers', icon: 'fa-solid fa-user fa-2x fs-2' }
  ];
}
