import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { Data, Theme } from '../services/data';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {
  themeModalOpen = false;

  constructor(public auth: AuthService, private router: Router, private data: Data) {}

  theme: Theme = {
    headerBg: '#34495E',
    headerText: '#FFFFFF',
    sidebarBg: '#2C3E50',
    sidebarText: '#FFFFFF'
  };


  modules = [
    { name: 'Core Modules',  subtitles: 'Services & Guards', icon: 'fa-solid fa-gear fa-2x fs-2' },
    { name: 'Shared Module', subtitles: 'UI Components',     icon: 'fa-solid fa-clipboard-list fa-2x fs-2' },
    { name: 'Products',      subtitles: 'Module',            icon: 'fa-solid fa-box fa-2x fs-3' },
    { name: 'Orders',        subtitles: 'Module',            icon: 'fa-solid fa-cart-shopping fa-2x fs-2' },
  ];

  isDropdownOpen = false;
  

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown') && this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }

  ngOnInit(): void {
  this.loadTheme();
}

loadTheme(): void {
  this.data.getTheme().subscribe((theme) => {
    this.theme = theme;
    this.applyTheme(theme);
  });
}

saveTheme(): void {
  this.data.setTheme(this.theme).subscribe((theme) => {
    this.theme = theme;
    this.applyTheme(theme);
  });
}

private isDarkColor(hex: string): boolean {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

onBgColorChange(): void {
  if (this.isDarkColor(this.theme.headerBg)) {
    this.theme.headerText = '#FFFFFF';
  } else {
    this.theme.headerText = '#000000';
  }
}

onSidebarBgChange(): void {
  if (this.isDarkColor(this.theme.sidebarBg)) {
    this.theme.sidebarText = '#FFFFFF';
  } else {
    this.theme.sidebarText = '#000000';
  }
}

private applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.style.setProperty('--header-bg', theme.headerBg);
  root.style.setProperty('--header-text', theme.headerText);
  root.style.setProperty('--sidebar-bg', theme.sidebarBg);
  root.style.setProperty('--sidebar-text', theme.sidebarText);
}


  onProfile(): void {
    this.router.navigate(['/profile']);
    this.isDropdownOpen = false;
  }

  onSettings(): void {
    alert('Navigate to Settings page');
    this.isDropdownOpen = false;
  }

  openThemeModal(): void {
    this.themeModalOpen = true;
    this.isDropdownOpen = false;
  }

  closeThemeModal(): void {
    this.themeModalOpen = false;
  }

  onLogout(): void {
    this.auth.logout();
    this.isDropdownOpen = false;
  }
}