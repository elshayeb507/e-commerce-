import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { QuantitySelectorComponent } from '../quantity-selector/quantity-selector.component';
import { CurrencyEgpPipe } from '../../pipes/currency-egp.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, QuantitySelectorComponent, CurrencyEgpPipe],
  template: `
    <div class="card card-dark h-100 product-card position-relative overflow-hidden">
      <!-- Badges -->
      <div class="badge-container position-absolute top-0 start-0 p-2 d-flex flex-column gap-1 z-2">
        <span *ngIf="product.isFeatured" class="badge badge-orange">
          <i class="bi bi-star-fill me-1"></i> مميز
        </span>
        <span *ngIf="getCategoryName()" class="badge badge-lime">
          {{ getCategoryName() }}
        </span>
      </div>

      <div class="product-img-wrapper position-relative text-center bg-black bg-opacity-25">
        <img
          [src]="product.image"
          [alt]="product.name"
          class="img-fluid product-img"
          (error)="onImageError($event)" />
        <div *ngIf="!product.isAvailable" class="unavailable-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
          <span class="badge bg-danger fs-6">غير متوفر حالياً</span>
        </div>
      </div>

      <!-- Body -->
      <div class="card-body d-flex flex-column p-3">
        <h5 class="card-title text-light font-weight-bold mb-1 fs-6">{{ product.name }}</h5>
        <p *ngIf="product.description" class="text-muted small text-truncate mb-2" [title]="product.description">
          {{ product.description }}
        </p>

        <!-- Pricing info -->
        <div class="d-flex align-items-baseline justify-content-between my-2">
          <div>
            <span class="text-muted small me-1">السعر:</span>
            <span class="fs-6 font-weight-bold text-light">{{ product.pricePerKg | currencyEgp }}</span>
            <span class="text-muted small"> / {{ product.unit }}</span>
          </div>

          <!-- Total for selected weight -->
          <div class="text-end">
            <span class="text-muted small d-block">الإجمالي:</span>
            <span class="price-tag fs-5">{{ calculatedTotal | currencyEgp }}</span>
          </div>
        </div>

        <!-- Quantity Selector -->
        <div class="mt-auto pt-2">
          <app-quantity-selector
            [selectedKg]="selectedKg"
            (quantityChange)="onQuantityChange($event)">
          </app-quantity-selector>

          <button
            type="button"
            class="btn btn-orange w-100 mt-3 d-flex align-items-center justify-content-center gap-2"
            [disabled]="!product.isAvailable"
            (click)="addToCart()">
            <i class="bi bi-cart-plus-fill fs-5"></i>
            <span>{{ isAdded ? 'تمت الإضافة للسلة ✓' : 'أضف إلى السلة' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      border-radius: 16px;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
    }
    .product-img-wrapper {
      height: 180px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .product-img {
      max-height: 100%;
      width: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .product-card:hover .product-img {
      transform: scale(1.06);
    }
    .unavailable-overlay {
      background-color: rgba(0, 0, 0, 0.7);
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  private cartService = inject(CartService);

  selectedKg: number = 1;
  isAdded: boolean = false;

  get calculatedTotal(): number {
    if (!this.product || !this.product.pricePerKg) return 0;
    return Number((this.selectedKg * this.product.pricePerKg).toFixed(2));
  }

  getCategoryName(): string {
    if (!this.product.category) return '';
    if (typeof this.product.category === 'object') {
      return this.product.category.name;
    }
    return '';
  }

  onQuantityChange(kg: number): void {
    this.selectedKg = kg;
  }

  addToCart(): void {
    if (!this.product.isAvailable) return;

    this.cartService.addToCart(this.product, this.selectedKg);
    this.isAdded = true;

    setTimeout(() => {
      this.isAdded = false;
    }, 1500);
  }

  onImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80';
  }
}
