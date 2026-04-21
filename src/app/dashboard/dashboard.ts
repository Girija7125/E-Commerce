import { Component } from '@angular/core';
import { Authentication } from '../Authentication/authentication';
import { Products } from '../products/products';
import { Orders } from '../orders/orders';
import { CommonModule } from '@angular/common';
import { Customers } from '../customers/customers';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,Authentication,Products,Orders,Customers],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  
  constructor(public auth: AuthService) {}
}
