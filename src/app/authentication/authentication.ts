import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './authentication.html',
  styleUrl: './authentication.css',
})
export class Authentication implements OnInit {
  @Input() limit: number = 0;

  activeTab: 'login' | 'register' = 'login';
  showForgotPassword = false;
  showResetPassword = false;
  
  showPassword = false;

  loginForm = new FormGroup({
    email:    new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  registerForm = new FormGroup({
    name:            new FormControl('', [Validators.required, Validators.minLength(2)]),
    email:           new FormControl('', [Validators.required, Validators.email]),
    password:        new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  forgotForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  resetForm = new FormGroup({              
    token: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  loginError      = '';
  registerError   = '';
  registerSuccess = '';
  loginLoading    = false;
  registerLoading = false;

  forgotPasswordLoading = false;
  forgotPasswordMessage = '';
  generatedToken = '';                     

  resetPasswordLoading = false;           
  resetPasswordMessage = '';               

  constructor(
    public auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.loginForm.disable();
      this.registerForm.disable();
    }
  }

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.showForgotPassword = false;
    this.showResetPassword = false;
    this.loginError = '';
    this.registerError = '';
    this.registerSuccess = '';
    this.forgotPasswordMessage = '';
    this.resetPasswordMessage = '';
    this.generatedToken = '';
  }

  showForgot(): void {
    this.showForgotPassword = true;
    this.showResetPassword = false;
    this.forgotForm.reset();
    this.forgotPasswordMessage = '';
    this.resetPasswordMessage = '';
    this.generatedToken = '';
  }

  backToLogin(): void {
    this.showForgotPassword = false;
    this.showResetPassword = false;
    this.generatedToken = '';
  }

  onForgotPassword(): void {
  if (this.forgotForm.invalid) {
    this.forgotForm.markAllAsTouched();
    return;
  }
  this.forgotPasswordLoading = true;
  const email = this.forgotForm.value.email!;
  this.auth.forgotPassword(email).subscribe({
    next: (res) => {
      this.forgotPasswordMessage = res.message;
      if (res.resetToken) {
        this.generatedToken = res.resetToken;
        this.forgotPasswordMessage += ' A reset token has been generated.';
      }
      this.forgotPasswordLoading = false;
      this.showForgotPassword = false;      
      this.showResetPassword = true;
      this.cdr.detectChanges();
    },
    error: (err) => {
      this.forgotPasswordMessage = err.error?.message || 'Failed to send reset email.';
      this.forgotPasswordLoading = false;
      this.cdr.detectChanges();
    }
  });
}

  
 onResetPassword(): void {
  if (this.resetForm.invalid) {
    this.resetForm.markAllAsTouched();
    return;
  }
  this.resetPasswordLoading = true;
  const { token, newPassword } = this.resetForm.value;

  this.auth.resetPassword(token!, newPassword!).subscribe({
    next: (res) => {
      this.resetPasswordMessage = res.message;
      this.resetPasswordLoading = false;
      
      this.resetForm.reset();
      this.generatedToken = '';           
      
      setTimeout(() => {
        this.backToLogin();               
        this.activeTab = 'login';        
        this.resetPasswordMessage = ''; 
        this.cdr.detectChanges();
      }, 2000);
      this.cdr.detectChanges();
    },
    error: (err) => {
      this.resetPasswordMessage = err.error?.message || 'Failed to reset password.';
      this.resetPasswordLoading = false;
      this.cdr.detectChanges();
    }
  });
}


togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loginLoading = true;
    const { email, password } = this.loginForm.value;

    this.auth.login(email!, password!).subscribe({
      next: (res: any) => {
        this.auth.setLoggedIn(res.token, res.user);
        this.loginLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loginError = err.error?.message || 'Wrong email or password!';
        this.loginLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    const { password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      this.registerError = 'Passwords do not match.';
      return;
    }

    this.registerLoading = true;
    const { name, email } = this.registerForm.value;

    this.auth.register(name!, email!, password!).subscribe({
      next: () => {
        this.registerSuccess = 'Account created! Please login.';
        this.registerLoading = false;
        this.registerForm.reset();
        setTimeout(() => { this.activeTab = 'login'; this.registerSuccess = ''; }, 1500);
      },
      error: (err) => {
        this.registerError   = err.error?.message || 'Registration failed!';
        this.registerLoading = false;
      }
    });
  }

  onLogout(): void {
    this.auth.logout();
    this.loginForm.enable();
    this.registerForm.enable();
    this.loginForm.reset();
    this.registerForm.reset();
  }
}