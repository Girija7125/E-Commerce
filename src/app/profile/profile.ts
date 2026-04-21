import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  profileForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email])
  });

  passwordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  profileLoading = false;
  passwordLoading = false;
  showPassword = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const user = this.auth.getUser();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email
      });
    }
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.profileLoading = true;
    const { name, email } = this.profileForm.value;

    this.auth.updateUserProfile(name!, email!).subscribe({
      next: (res) => {
        this.successMessage = 'Profile updated successfully.';
        const updatedUser = {
          ...this.auth.getUser(),
          name: res.user.name,
          email: res.user.email
        };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        this.profileLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Update failed.';
        this.profileLoading = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.passwordLoading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.auth.changePassword(currentPassword!, newPassword!).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.passwordForm.reset();
        this.passwordLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Password change failed.';
        this.passwordLoading = false;
      }
    });
  }
}
