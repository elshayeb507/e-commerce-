import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Category } from '../../core/models/category.model';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  template: `
    <!-- Hero Section -->
    <section class="hero-section py-5 position-relative overflow-hidden">
      <div class="container py-lg-4">
        <div class="row align-items-center g-4">
          <div class="col-lg-7 text-center text-lg-start">
            <span class="badge badge-orange mb-3 fs-6">
              <i class="bi bi-truck me-1"></i> التوصيل طازج يومياً في مصر
            </span>
            <h1 class="hero-title text-light font-weight-black mb-3 display-4">
              خضار وفاكهة طازة <br>
              <span class="text-orange">لحد باب بيتك!</span> 
            </h1>
            <p class="hero-subtext hero-desc fs-5 mb-4 lh-lg">
              اختر الكمية المناسبة بالجرام أو الكيلو (ربع كيلو، نصف كيلو، 1 كجم وأكثر)، والدفع عند الاستلام بكل سهولة وبدون تعقيد.
            </p>
            <div class="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3">
              <a routerLink="/products" class="btn btn-orange btn-lg px-4 py-3 rounded-pill">
                <i class="bi bi-basket2-fill me-2"></i> تسوق الآن
              </a>
              <a routerLink="/cart" class="btn btn-outline-custom btn-lg px-4 py-3 rounded-pill">
                <i class="bi bi-cart3 me-2"></i> استعرض السلة
              </a>
            </div>
          </div>
          <div class="col-lg-5 text-center">
            <div class="hero-image-wrapper p-3 position-relative">
              <img
                src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop&q=80"
                alt="خضار وفاكهة طازجة"
                class="img-fluid rounded-4 shadow-lg border border-dark border-opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Strengths / Highlights -->
    <section class="py-4 bg-dark bg-opacity-25 border-y border-dark border-opacity-50">
      <div class="container">
        <div class="row g-3 text-center">
          <div class="col-md-4">
            <div class="card card-dark p-3 h-100 d-flex flex-row align-items-center gap-3">
              <div class="feature-icon bg-orange text-white rounded-circle p-3">
                <i class="bi bi-tree-fill fs-3"></i>
              </div>
              <div class="text-start">
                <h6 class="text-light fw-bold mb-1">100% طازجة ومختارة</h6>
                <small class="card-subtext">من المزرعة مباشرة يومياً</small>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card card-dark p-3 h-100 d-flex flex-row align-items-center gap-3">
              <div class="feature-icon bg-lime text-dark rounded-circle p-3">
                <i class="bi bi-speedometer fs-3"></i>
              </div>
              <div class="text-start">
                <h6 class="text-light fw-bold mb-1">توصيل سريع</h6>
                <small class="card-subtext">نصلك خلال ساعات في منزلك</small>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card card-dark p-3 h-100 d-flex flex-row align-items-center gap-3">
              <div class="feature-icon bg-warning text-dark rounded-circle p-3">
                <i class="bi bi-cash-stack fs-3"></i>
              </div>
              <div class="text-start">
                <h6 class="text-light fw-bold mb-1">الدفع عند الاستلام</h6>
                <small class="text-muted">تدفع فقط بعد المعاينة والاستلام</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-5">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h3 class="text-light fw-bold mb-1">التصنيفات الرئيسية</h3>
            <p class="section-desc small mb-0">تصفح المنتجات حسب الفئات المتاحة</p>
          </div>
          <a routerLink="/products" class="btn btn-sm btn-outline-custom rounded-pill">
            عرض الكل <i class="bi bi-arrow-left ms-1"></i>
          </a>
        </div>

        <div *ngIf="loadingCategories" class="text-center py-4">
          <div class="spinner-border text-orange" role="status"></div>
        </div>

        <div *ngIf="!loadingCategories" class="row g-3">
          <div *ngFor="let cat of categories" class="col-6 col-md-4 col-lg-2-4">
            <a [routerLink]="['/products']" [queryParams]="{ category: cat.slug }" class="text-decoration-none">
              <div class="card card-dark category-card text-center p-3 h-100">
                <div class="cat-img-wrapper mb-2 rounded-circle mx-auto overflow-hidden">
                  <img [src]="cat.image" [alt]="cat.name" class="img-fluid cat-img" />
                </div>
                <h6 class="text-light fw-bold mb-0 fs-6">{{ cat.name }}</h6>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="py-5 bg-dark bg-opacity-10">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h3 class="text-light fw-bold mb-1">منتجات مختارة لك</h3>
            <p class="section-desc small mb-0">أجود أنواع الفواكه والخضروات المتوفرة اليوم</p>
          </div>
          <a routerLink="/products" class="btn btn-sm btn-orange rounded-pill">
            جميع المنتجات <i class="bi bi-arrow-left ms-1"></i>
          </a>
        </div>

        <div *ngIf="loadingProducts" class="text-center py-5">
          <div class="spinner-border text-orange" role="status"></div>
        </div>

        <div *ngIf="!loadingProducts && featuredProducts.length === 0" class="alert alert-dark text-center">
          لا توجد منتجات مميزة حالياً
        </div>

        <div *ngIf="!loadingProducts" class="row g-4">
          <div *ngFor="let product of featuredProducts" class="col-12 col-sm-6 col-md-4 col-lg-3">
            <app-product-card [product]="product"></app-product-card>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-title {
      line-height: 1.25;
    }
    .hero-desc {
      color: #e2e8f0 !important;
    }
    .card-subtext, .section-desc {
      color: #cbd5e1 !important;
    }
    .text-orange {
      color: #ff5722;
    }
    .bg-orange {
      background-color: #ff5722;
    }
    .bg-lime {
      background-color: #a3e635;
    }
    .category-card {
      transition: transform 0.25s ease, border-color 0.25s ease;
    }
    .category-card:hover {
      transform: translateY(-4px);
      border-color: #ff5722;
    }
    .cat-img-wrapper {
      width: 70px;
      height: 70px;
    }
    .cat-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    @media (min-width: 992px) {
      .col-lg-2-4 {
        flex: 0 0 auto;
        width: 20%;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];
  featuredProducts: Product[] = [];
  loadingCategories: boolean = true;
  loadingProducts: boolean = true;

  ngOnInit(): void {
    this.fetchCategories();
    this.fetchFeaturedProducts();
  }

  fetchCategories(): void {
    this.loadingCategories = true;
    this.apiService.getCategories().subscribe({
      next: res => {
        this.categories = res?.categories || [];
        this.loadingCategories = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.loadingCategories = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchFeaturedProducts(): void {
    this.loadingProducts = true;
    this.apiService.getProducts({ featured: true }).subscribe({
      next: res => {
        this.featuredProducts = res?.products || [];
        this.loadingProducts = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching featured products:', err);
        this.loadingProducts = false;
        this.cdr.detectChanges();
      }
    });
  }
}
