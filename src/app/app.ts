import { Component} from '@angular/core';
import {  RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Sidebar } from './sidebar/sidebar';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [Header,Sidebar,RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(public authService: AuthService) {}
}
