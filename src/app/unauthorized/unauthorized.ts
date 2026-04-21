import { Component } from '@angular/core';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  imports: [CommonModule],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css',
})
export class Unauthorized {
  constructor(public auth: AuthService, public router: Router) {}

}
