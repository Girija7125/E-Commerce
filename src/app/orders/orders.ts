import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-orders',
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders {

  orders=[
    { id: '#1023', customer: 'John Doe', status: 'Shipped', statusColor: 'success' },
    { id: '#1022', customer: 'Jane Smith', status: 'Pending', statusColor: 'warning' },
    { id: '#1021', customer: 'Mike Lee', status: 'Completed', statusColor: 'info' }
  ];
  viewOrder(): void {
    alert(`Viewing order Clicked `);
  }

}
