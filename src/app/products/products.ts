import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, Input } from '@angular/core';
import { Data, PaginatedProducts } from '../services/data';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  @Input() limit: number = 0;
  products: any[] = [];
  loading = true;
  error   = '';

  searchQuery   = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedStock = '';

  showForm  = false;
  editingId: string | null = null;
  productForm = { name: '', price: 0, stock: '' };

  showDeleteModal    = false;
  selectedProductId: string | null = null;

  currentPage   = 1;
  totalPages    = 1;
  totalProducts = 0;
  readonly pageSize = 5;

  constructor(
    private dataService: Data,
    public  auth: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void { this.loadProduct(); }

  get canAdd():    boolean { return this.auth.canAdd('products'); }
  get canEdit():   boolean { return this.auth.canEdit('products'); }
  get canDelete(): boolean { return this.auth.canDelete('products'); }
  get showActions(): boolean { return this.canEdit || this.canDelete; }

  loadProduct(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;
    this.dataService.getProducts(page, this.pageSize).subscribe({
      next: (res: PaginatedProducts) => {
        const limited    = this.limit > 0 ? res.data.slice(0, this.limit) : res.data;
        this.products    = limited;
        this.totalProducts = res.total;
        this.totalPages  = res.totalPages;
        this.loading     = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load products'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  searchProducts(page: number = 1): void {
    const query    = this.searchQuery.trim();
    const stock    = this.selectedStock || undefined;
    const minPrice = this.minPrice?.toString() || undefined;
    const maxPrice = this.maxPrice?.toString() || undefined;

    if (!query && !stock && !minPrice && !maxPrice) { this.loadProduct(); return; }

    this.loading = true;
    this.currentPage = page;
    this.dataService.searchProductsByField(query || undefined, undefined, stock, minPrice, maxPrice, page, this.pageSize).subscribe({
      next: (res: PaginatedProducts) => {
        this.products      = res.data;
        this.totalProducts = res.total;
        this.totalPages    = res.totalPages;
        this.loading       = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Search failed'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    if (this.searchQuery.trim() || this.minPrice || this.maxPrice || this.selectedStock) {
      this.searchProducts(page);
    } else {
      this.loadProduct(page);
    }
  }

  resetSearch(): void {
    this.searchQuery = ''; this.minPrice = null; this.maxPrice = null; this.selectedStock = '';
    this.currentPage = 1; this.loadProduct();
  }


  openAddForm(content: any): void {
    if (!this.canAdd) return;
    this.editingId = null;
    this.productForm = { name: '', price: 0, stock: '' };
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

openEditForm(product: any, content: any): void {
    if (!this.canEdit) return;
    this.editingId = product._id;
    this.productForm = { name: product.name, price: product.price, stock: product.stock };
    this.modalService.open(content, { centered: true,size: 'lg', backdrop: 'static' });
  }

  closeForm(): void {
    this.showForm = false; this.editingId = null;
    this.productForm = { name: '', price: 0, stock: '' };
  }

  saveProduct(): void {
    if (!this.productForm.name || !this.productForm.price || !this.productForm.stock) {
      alert('Please fill in all fields!'); return;
    }
    if (this.editingId) {
      this.dataService.updateProduct(this.editingId, this.productForm).subscribe({
        next: () => { alert('Product updated!'); this.closeForm(); this.loadProduct(); },
        error: () => alert('Error updating product!')
      });
    } else {
      this.dataService.addProduct(this.productForm).subscribe({
        next: () => { alert('Product added!'); this.closeForm(); this.loadProduct(); },
        error: () => alert('Error adding product!')
      });
    }
  }

  deleteProduct(id: string): void {
    if (!this.canDelete) return;
    this.selectedProductId = id; this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.selectedProductId) return;
    this.dataService.deleteProduct(this.selectedProductId).subscribe({
      next: () => {
        this.products = this.products.filter(p => p._id !== this.selectedProductId);
        this.showDeleteModal = false; this.selectedProductId = null;
      },
      error: () => { alert('Error deleting product!'); this.showDeleteModal = false; }
    });
  }

  cancelDelete(): void { this.showDeleteModal = false; this.selectedProductId = null; }

  goToProducts(): void { this.router.navigate(['/products']); }
}