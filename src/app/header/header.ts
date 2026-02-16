import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  modules=[
    {name:'CoreModules',subtitles:'Services & Gaurds',icon:'fa-solid fa-gear fa-2x fs-2'},
    {name:'Shared Module',subtitles:'UI Components',icon:'fa-solid fa-clipboard-list fa-2x fs-2'},
    {name:'Products',subtitles:'Module',icon:'fa-solid fa-box fa-2x fs-3'},
    {name:'Orders',subtitles:'Module',icon:'fa-solid fa-cart-shopping fa-2x fs-2'}
  ]
  isDropdownOpen = false;
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
   @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.dropdown');
    
    if (!clickedInside && this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }
    onProfile(): void {
    console.log('Profile clicked');
    alert('Navigate to Profile page');
    this.isDropdownOpen = false; // Close dropdown
  }
  
  onSettings(): void {
    console.log('Settings clicked');
    alert('Navigate to Settings page');
    this.isDropdownOpen = false;
  }

}
