import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-products',
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  products=[
    { id: 1, name: 'Laptop', price: 999, stock: 'In Stock', stockColor: 'text-success' },
    { id: 2, name: 'Headphones', price: 199, stock: 'Out of Stock', stockColor: 'text-danger' },
    { id: 3, name: 'Smartphone', price: 699, stock: 'In Stock', stockColor: 'text-success' }
  ];
viewDetails(): void {
    alert('View Details clicked! 📋');
  }
}
