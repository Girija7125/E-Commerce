import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeveloperEditModal } from '../developer-edit-modal/developer-edit-modal';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin implements OnInit {
  developers: any[] = [];
  loading = true;

  
  showCreateForm = false;
  createLoading = false;
  createForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  
  sections = ['products', 'orders', 'customers'];
  actions = ['view', 'add', 'edit', 'delete'];
  newDevPermissions: any = {
    products:  { view: false, add: false, edit: false, delete: false },
    orders:    { view: false, add: false, edit: false, delete: false },
    customers: { view: false, add: false, edit: false, delete: false }
  };

  successMessage = '';
  errorMessage = '';

  constructor(
    public auth: AuthService,
    private modalService: NgbModal,
    private cdr:ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDevelopers();
  }

  loadDevelopers(): void {
    this.loading = true;
    this.auth.getDevelopers().subscribe({
      next: (res) => {
        this.developers = res.users;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load developers.';
        this.loading = false;
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.createForm.reset();
    this.newDevPermissions = {
      products:  { view: false, add: false, edit: false, delete: false },
      orders:    { view: false, add: false, edit: false, delete: false },
      customers: { view: false, add: false, edit: false, delete: false }
    };
  }

  createDeveloper(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.createLoading = true;
    const payload = { ...this.createForm.value, permissions: this.newDevPermissions };
    this.auth.createDeveloper(payload).subscribe({
      next: () => {
        this.successMessage = 'Developer created successfully.';
        this.createLoading = false;
        this.showCreateForm = false;
        this.createForm.reset();
        this.loadDevelopers();
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create developer.';
        this.createLoading = false;
      }
    });
  }

  
  editDeveloper(dev: any): void {
    const modalRef = this.modalService.open(DeveloperEditModal, { size: 'lg' });
    modalRef.componentInstance.developer = JSON.parse(JSON.stringify(dev));
    modalRef.result.then(
      (updatedDev) => {
        if (updatedDev) {
          
          const index = this.developers.findIndex(d => d._id === updatedDev._id);
          if (index !== -1) this.developers[index] = updatedDev;
          this.successMessage = 'Developer updated successfully.';
          this.loadDevelopers();
          setTimeout(() => (this.successMessage = ''), 3000);
        }
      },
    );
  }

  deleteDeveloper(devId: string): void {
    if (confirm('Delete this developer permanently?')) {
      this.auth.deleteDeveloper(devId).subscribe({
        next: () => {
          this.successMessage = 'Developer deleted.';
          this.loadDevelopers();
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Delete failed.';
        }
      });
    }
  }

  capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}