import { Component, Input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../services/auth';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (password && confirm && password !== confirm) {
    return { mismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-developer-edit-modal',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './developer-edit-modal.html',
  styleUrl: './developer-edit-modal.css',
})
export class DeveloperEditModal {
  @Input() developer: any;

  editForm = new FormGroup(
    {
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.minLength(8)]),
      confirmPassword: new FormControl(''),
    },
    { validators: passwordMatchValidator },
  );

  editPermissions: any = {};
  sections = ['products', 'orders', 'customers'];
  actions = ['view', 'add', 'edit'];
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    public auth: AuthService,
    public activeModal: NgbActiveModal,
  ) {}

  ngOnInit(): void {
    this.editForm.patchValue({
      name: this.developer.name,
      email: this.developer.email,
      password: '',
      confirmPassword: '',
    });
    this.editPermissions = JSON.parse(JSON.stringify(this.developer.permissions));
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  save(): void {
    const password = this.editForm.value.password;
    const confirm = this.editForm.value.confirmPassword;
    if ((password && !confirm) || (!password && confirm)) {
      this.editForm.get('confirmPassword')?.markAsTouched();
      this.editForm.setErrors({ mismatch: true });
      return;
    }

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const updates: any = {
      name: this.editForm.value.name,
      email: this.editForm.value.email,
      permissions: this.editPermissions,
    };
    if (password && password.trim() !== '') {
      updates.password = password;
    }
    this.auth.updateDeveloper(this.developer._id, updates).subscribe({
      next: (res) => {
        this.loading = false;
        this.activeModal.close(res.user);
      },
      error: (err) => {
        this.loading = false;
        alert(err.error?.message || 'Update failed');
      },
    });
  }

  capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
