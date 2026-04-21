import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModule, NgbDateStruct, NgbDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Data, PaginatedOrders } from '../services/data';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css']
})
export class Orders implements OnInit {
  @Input() limit: number = 0;
  displayOrders: any[] = [];
  loading      = true;
  error        = '';
  searchQuery  = '';
  allOrders: any[] = [];
  statusFilter = '';
  showForm     = false;

  fromDate: NgbDateStruct | null = null;
  toDate:   NgbDateStruct | null = null;

  editingId: string | null = null;
  orderForm = { orderId: '', customer: '', date: null as NgbDateStruct | null, status: '' };
  showDeleteModal   = false;
  selectedOrderId: string | null = null;

  currentPage  = 1;
  totalPages   = 1;
  totalOrders  = 0;
  readonly pageSize = 5;

  constructor(
    private modalService: NgbModal,
    private dataService: Data,
    public  auth: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    config: NgbDatepickerConfig
  ) { config.navigation = 'select'; }

  ngOnInit(): void { this.loadOrder(); }

  get canAdd():    boolean { return this.auth.canAdd('orders'); }
  get canEdit():   boolean { return this.auth.canEdit('orders'); }
  get canDelete(): boolean { return this.auth.canDelete('orders'); }
  get showActions(): boolean { return this.canEdit || this.canDelete; }

  private formatNgbDate(date: NgbDateStruct | null): string | undefined {
    if (!date) return undefined;
    return `${date.year}-${String(date.month).padStart(2,'0')}-${String(date.day).padStart(2,'0')}`;
  }

  loadOrder(page: number = 1): void {
    this.loading = true; this.currentPage = page;
    this.dataService.getOrders(page, this.pageSize).subscribe({
      next: (res: PaginatedOrders) => {
        const formatted = res.data.map((c: any) => ({ ...c, joined: c.joined ? c.joined.substring(0, 10) : '' }));
        const limited   = this.limit > 0 ? formatted.slice(0, this.limit) : formatted;
        this.allOrders = limited; this.displayOrders = limited;
        this.totalOrders = res.total; this.totalPages = res.totalPages;
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load orders'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  searchOrders(page: number = 1): void {
    const query    = this.searchQuery.trim();
    const status   = this.statusFilter.trim() || undefined;
    const fromDate = this.formatNgbDate(this.fromDate);
    const toDate   = this.formatNgbDate(this.toDate);

    if (!query && !status && !fromDate && !toDate) { this.loadOrder(); return; }

    this.loading = true; this.currentPage = page;
    const request = (query && !status && !fromDate && !toDate)
      ? this.dataService.searchOrders(query)
      : this.dataService.searchOrdersByField(query, '', fromDate, toDate, status, page, this.pageSize);

    request.subscribe({
      next: (res: PaginatedOrders) => {
        const formatted = res.data.map((c: any) => ({ ...c, joined: c.joined ? c.joined.substring(0, 10) : '' }));
        this.displayOrders = formatted; this.allOrders = formatted;
        this.totalOrders = res.total; this.totalPages = res.totalPages;
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.error = 'Search failed'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    (this.searchQuery.trim() || this.statusFilter.trim() || this.fromDate || this.toDate)
      ? this.searchOrders(page) : this.loadOrder(page);
  }

  clearSearch(): void {
    this.searchQuery = ''; this.statusFilter = ''; this.fromDate = null; this.toDate = null;
    this.error = ''; this.currentPage = 1; this.loadOrder();
  }

  openAddForm(content: any): void {
    if (!this.canAdd) return;
    this.editingId = null;
    this.orderForm = { orderId: '', customer: '', date: null, status: '' };
    this.modalService.open(content, { centered: true,size: 'lg', backdrop: 'static' });
  }

  closeForm(): void {
    this.showForm = false; this.editingId = null;
    this.orderForm = { orderId: '', customer: '', date: null, status: '' };
  }

  openEditForm(order: any, content: any): void {
    if (!this.canEdit) return;
    this.editingId = order._id;
    const jsDate = new Date(order.date);
    this.orderForm = {
      orderId: order.orderId, customer: order.customer,
      date: { year: jsDate.getFullYear(), month: jsDate.getMonth() + 1, day: jsDate.getDate() },
      status: order.status
    };
    this.modalService.open(content, { centered: true,size: 'lg', backdrop: 'static' });
  }

  saveOrder(): void {
    if (!this.orderForm.orderId || !this.orderForm.customer || !this.orderForm.status) {
      alert('Please fill in all fields!'); return;
    }
    const payload = { ...this.orderForm, date: this.formatNgbDate(this.orderForm.date) };
    if (this.editingId) {
      this.dataService.updateOrder(this.editingId, payload).subscribe({
        next: () => { alert('Order updated!'); this.closeForm(); this.loadOrder(); },
        error: () => alert('Error updating order!')
      });
    } else {
      this.dataService.addOrder(payload).subscribe({
        next: () => { alert('Order added!'); this.closeForm(); this.loadOrder(); },
        error: () => alert('Error adding order!')
      });
    }
  }

  deleteOrder(id: string): void {
    if (!this.canDelete) return;
    this.selectedOrderId = id; this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.selectedOrderId) return;
    this.dataService.deleteOrder(this.selectedOrderId).subscribe({
      next: () => {
        this.displayOrders = this.displayOrders.filter(o => o._id !== this.selectedOrderId);
        this.showDeleteModal = false; this.selectedOrderId = null;
      },
      error: () => { alert('Error deleting order!'); this.showDeleteModal = false; }
    });
  }

  cancelDelete(): void { this.showDeleteModal = false; this.selectedOrderId = null; }

  goToOrders(): void { this.router.navigate(['/orders']); }
}