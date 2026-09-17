import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  template: `
    <div class="container py-5">
      <!-- Header & Search -->
      <div class="row align-items-center mb-4 g-3">
        <div class="col-md-6">
          <h2 class="text-light fw-bold mb-1">معرض المنتجات </h2>
          <p class="text-muted small mb-0">اختر الكمية المطلوبة بالجرام أو الكيلو وأضفها لسلتك</p>
        </div>
        <div class="col-md-6">
          <div class="input-group input-group-lg search-input-group">
            <span class="input-group-text bg-orange text-white border-0 px-3">
              <i class="bi bi-search fs-5"></i>
            </span>
            <input
              type="text"
              class="form-control form-control-dark border-0 px-3 py-2 text-light"
              placeholder="ابحث عن خضار أو فاكهة (طماطم، موز، بطاطس...)"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()" />
            <button *ngIf="searchQuery" class="btn btn-outline-secondary border-0 text-light px-3" (click)="clearSearch()">
              <i class="bi bi-x-lg"></i>
            </button>
            <button class="btn btn-orange px-4 fw-bold" (click)="fetchProducts()">
              <i class="bi bi-search me-1"></i> بحث
            </button>
          </div>
        </div>
      </div>

      <!-- Categories Filter Tabs -->
      <div class="category-tabs d-flex flex-wrap gap-2 mb-4 pb-2 border-bottom border-dark border-opacity-50">
        <button
          type="button"
          class="btn btn-sm rounded-pill px-3 py-2 tab-btn"
          [class.active]="selectedCategory === ''"
          (click)="filterByCategory('')">
          الكل (جميع المنتجات)
        </button>
        <button
          *ngFor="let cat of categories"
          type="button"
          class="btn btn-sm rounded-pill px-3 py-2 tab-btn"
          [class.active]="selectedCategory === cat.slug"
          (click)="filterByCategory(cat.slug)">
          {{ cat.name }}
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-orange" role="status">
          <span class="visually-hidden">جاري التحميل...</span>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && products.length === 0" class="card card-dark p-5 text-center my-4">
        <i class="bi bi-emoji-frown display-3 text-muted mb-3"></i>
        <h4 class="text-light fw-bold mb-2">عذراً، لم نجد منتجات طازجة تطابق بحثك</h4>
        <p class="text-muted small mb-3">جرب البحث بكلمة أخرى أو اختر تصنيفاً مختلفاً</p>
        <button class="btn btn-orange btn-sm mx-auto rounded-pill px-4" (click)="resetFilters()">
          عرض جميع المنتجات
        </button>
      </div>

      <!-- Products Grid -->
      <div *ngIf="!loading && products.length > 0" class="row g-4">
        <div *ngFor="let product of products" class="col-12 col-sm-6 col-md-4 col-lg-3">
          <app-product-card [product]="product"></app-product-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-input-group {
      border: 1px solid rgba(255, 87, 34, 0.4);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
    }
    .bg-orange {
      background-color: #ff5722;
    }
    .tab-btn {
      background-color: #1a1c23;
      color: #94a3b8;
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .tab-btn:hover {
      background-color: #222530;
      color: #fff;
    }
    .tab-btn.active {
      background-color: #ff5722;
      color: #fff;
      border-color: #ff5722;
    }
    .text-orange {
      color: #ff5722;
    }
  `]
})
export class ProductsComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  products: Product[] = [];
  categories: Category[] = [];
  selectedCategory: string = '';
  searchQuery: string = '';
  loading: boolean = true;

  ngOnInit(): void {
    this.fetchCategories();

    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      this.fetchProducts();
    });
  }

  fetchCategories(): void {
    this.apiService.getCategories().subscribe({
      next: res => {
        this.categories = res?.categories || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.cdr.detectChanges();
      }
    });
  }

  fetchProducts(): void {
    this.loading = true;
    this.apiService
      .getProducts({
        category: this.selectedCategory,
        search: this.searchQuery
      })
      .subscribe({
        next: res => {
          this.products = res?.products || [];
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching products:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  filterByCategory(slug: string): void {
    this.selectedCategory = slug;
    this.fetchProducts();
  }

  onSearchChange(): void {
    this.fetchProducts();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.fetchProducts();
  }

  resetFilters(): void {
    this.selectedCategory = '';
    this.searchQuery = '';
    this.fetchProducts();
  }
}
