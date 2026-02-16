import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-customers',
  imports: [CommonModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers {

  customers=[
    { id: 1, name: 'Alice Brown', email: 'alice@example.com', joined: '02/15/2021' },
    { id: 2, name: 'Bob Wilson', email: 'bob@example.com', joined: '05/22/2020' },
    { id: 3, name: 'Sara Lee', email: 'sara@example.com', joined: '08/10/2019' }
  ]

}
