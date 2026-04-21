import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, Input } from '@angular/core';
import { Data, PaginatedCustomers } from '../services/data';
import { AuthService } from '../services/auth';
import { FormsModule } from '@angular/forms';
import { NgbModule, NgbDateStruct, NgbDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
  @Input() limit: number = 0;
  customers: any[] = [];
  loading = true;
  error = '';
  searchQuery = '';
  allCustomers: any[] = [];
  selectedActive = '';
  showFilter = false;

  fromDate: NgbDateStruct | null = null;
  toDate: NgbDateStruct | null = null;

  showForm = false;
  editingId: string | null = null;
  customerForm: { name: string; email: string; joined: NgbDateStruct | null; active: string } = {
    name: '', email: '', joined: null, active: ''
  };

  showDeleteModal = false;
  selectedCustomerId: string | null = null;
  currentPage = 1;
  totalPages = 1;
  totalCustomers = 0;
  readonly pageSize = 5;

  constructor(
    private dataService: Data,
    private modalService: NgbModal,
    public auth: AuthService,
    private cdr: ChangeDetectorRef,
    config: NgbDatepickerConfig
  ) { config.navigation = 'select'; }

  ngOnInit(): void { this.loadCustomer(); }

  get canAdd(): boolean { return this.auth.canAdd('customers'); }
  get canEdit(): boolean { return this.auth.canEdit('customers'); }
  get canDelete(): boolean { return this.auth.canDelete('customers'); }
  get showActions(): boolean { return this.canEdit || this.canDelete; }

  private formatNgbDate(date: NgbDateStruct | null): string | undefined {
    if (!date) return undefined;
    return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
  }

  loadCustomer(page: number = 1): void {
    this.loading = true; this.currentPage = page;
    this.dataService.getCustomers(page, this.pageSize).subscribe(
      (res: PaginatedCustomers) => {
        const formatted = res.data.map((c: any) => ({ ...c, joined: c.joined ? c.joined.substring(0, 10) : '' }));
        this.customers = this.limit > 0 ? formatted.slice(0, this.limit) : formatted;
        this.allCustomers = this.customers;
        this.totalCustomers = res.total; this.totalPages = res.totalPages;
        this.loading = false; this.cdr.detectChanges();
      },
      () => { this.error = 'Failed to load Customers'; this.loading = false; this.cdr.detectChanges(); }
    );
  }

  applySearchAndFilter(page: number = 1): void {
    const query = this.searchQuery.trim() || undefined;
    const active = this.selectedActive || undefined;
    const fromDate = this.formatNgbDate(this.fromDate);
    const toDate = this.formatNgbDate(this.toDate);

    if (!query && !active && !fromDate && !toDate) { this.loadCustomer(); return; }

    this.error = ''; this.loading = true; this.currentPage = page;
    const request = (query && !active && !fromDate && !toDate)
      ? this.dataService.searchCustomers(query)
      : this.dataService.searchCustomersByField(query, query, '', active, fromDate, toDate, page, this.pageSize);

    request.subscribe({
      next: (res: PaginatedCustomers) => {
        const formatted = res.data.map((c: any) => ({ ...c, joined: c.joined ? c.joined.substring(0, 10) : '' }));
        this.allCustomers = formatted; this.customers = formatted;
        this.totalCustomers = res.total; this.totalPages = res.totalPages;
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Search failed'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    (this.searchQuery.trim() || this.selectedActive || this.fromDate || this.toDate)
      ? this.applySearchAndFilter(page) : this.loadCustomer(page);
  }

  clearSearch(): void {
    this.searchQuery = ''; this.fromDate = null; this.toDate = null;
    this.selectedActive = ''; this.showFilter = false; this.loadCustomer();
  }

  openAddModal(content: any): void {
    if (!this.canAdd) return;
    this.showForm = true;
    this.editingId = null;
    this.customerForm = { name: '', email: '', joined: null, active: '' };
    this.modalService.open(content, { size: 'lg', backdrop: 'static' });
  }

  openEditModal(content: any, customer: any): void {
    if (!this.canEdit) return;
    this.showForm = true;
    this.editingId = customer._id;
    const jsDate = new Date(customer.joined);
    this.customerForm = {
      name: customer.name,
      email: customer.email,
      joined: { year: jsDate.getFullYear(), month: jsDate.getMonth() + 1, day: jsDate.getDate() },
      active: customer.active
    };
    this.modalService.open(content, { size: 'lg', backdrop: 'static' });
  }

  closeForm(): void {
    this.showForm = false; this.editingId = null;
    this.customerForm = { name: '', email: '', joined: null, active: '' };
  }

  saveCustomer(): void {
    if (!this.customerForm.name || !this.customerForm.email || !this.customerForm.joined) {
      alert('Please fill in all fields!'); return;
    }
    const payload = { ...this.customerForm, joined: this.formatNgbDate(this.customerForm.joined) };
    if (this.editingId) {
      this.dataService.updateCustomer(this.editingId, payload).subscribe({
        next: () => { alert('Customer updated!'); this.closeForm(); this.loadCustomer(); },
        error: () => alert('Error updating customer!')
      });
    } else {
      this.dataService.addCustomer(payload).subscribe({
        next: () => { alert('Customer added!'); this.closeForm(); this.loadCustomer(); },
        error: () => alert('Error adding customer!')
      });
    }
  }

  deleteCustomer(id: string): void {
    if (!this.canDelete) return;
    this.selectedCustomerId = id; this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.selectedCustomerId) return;
    this.dataService.deleteCustomer(this.selectedCustomerId).subscribe({
      next: () => {
        this.customers = this.customers.filter(c => c._id !== this.selectedCustomerId);
        this.showDeleteModal = false; this.selectedCustomerId = null;
      },
      error: () => { alert('Error deleting customer!'); this.showDeleteModal = false; }
    });
  }

  cancelDelete(): void { this.showDeleteModal = false; this.selectedCustomerId = null; }
}
