import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { QuantitySelectorComponent } from '../../shared/components/quantity-selector/quantity-selector.component';
import { CurrencyEgpPipe } from '../../shared/pipes/currency-egp.pipe';
import { WeightFormatPipe } from '../../shared/pipes/weight-format.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, QuantitySelectorComponent, CurrencyEgpPipe, WeightFormatPipe],
  template: `
    <div class="container py-5">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 class="text-light fw-bold mb-1">عربة التسوق   </h2>
          <p class="text-muted small mb-0">راجع منتجاتك وأوزانها قبل إتمام الطلب</p>
        </div>
        <button
          *ngIf="(cartItems$ | async)?.length"
          class="btn btn-outline-danger btn-sm rounded-pill px-3"
          (click)="clearCart()">
          <i class="bi bi-trash me-1"></i> تفريغ السلة
        </button>
      </div>

      <!-- Empty Cart State -->
      <div *ngIf="!(cartItems$ | async)?.length" class="card card-dark p-5 text-center my-4">
        <div class="empty-icon-wrapper mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center">
          <i class="bi bi-cart-x display-4 text-orange"></i>
        </div>
        <h4 class="text-light fw-bold mb-2">عربة التسوق فارغة حالياً</h4>
        <p class="text-muted small mb-4">لم تقم بإضافة أي خضروات أو فواكه إلى السلة بعد.</p>
        <div>
          <a routerLink="/products" class="btn btn-orange btn-lg rounded-pill px-5">
            <i class="bi bi-basket2-fill me-2"></i> تصفح المنتجات الآن
          </a>
        </div>
      </div>

      <!-- Cart Content Grid -->
      <div *ngIf="(cartItems$ | async)?.length" class="row g-4">
        <!-- Cart Items List -->
        <div class="col-lg-8">
          <div class="card card-dark p-3">
            <div *ngFor="let item of (cartItems$ | async); let last = last" [class.border-bottom]="!last" class="border-dark border-opacity-50 py-3">
              <div class="row align-items-center g-3">
                <!-- Product Thumbnail -->
                <div class="col-3 col-sm-2 text-center">
                  <img [src]="item.product.image" [alt]="item.product.name" class="img-fluid rounded-3 item-img" />
                </div>

                <!-- Product Title & Unit Price -->
                <div class="col-9 col-sm-4">
                  <h6 class="text-light fw-bold mb-1">{{ item.product.name }}</h6>
                  <div class="text-muted small">
                    سعر الكيلو: <span class="text-light fw-bold">{{ item.product.pricePerKg | currencyEgp }}</span>
                  </div>
                  <div class="text-orange fs-7 fw-bold mt-1">
                    الوزن المحدد: {{ item.quantityKg | weightFormat }}
                  </div>
                </div>

                <!-- Weight Selector -->
                <div class="col-8 col-sm-4">
                  <app-quantity-selector
                    [selectedKg]="item.quantityKg"
                    (quantityChange)="updateQuantity(item.product._id!, $event)">
                  </app-quantity-selector>
                </div>

                <!-- Item Total & Remove -->
                <div class="col-4 col-sm-2 text-end">
                  <div class="price-tag fs-6 mb-1">{{ item.itemTotal | currencyEgp }}</div>
                  <button
                    class="btn btn-link text-danger p-0 border-0 fs-7"
                    (click)="removeItem(item.product._id!)">
                    <i class="bi bi-trash me-1"></i> حذف
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary Card -->
        <div class="col-lg-4">
          <div class="card card-dark p-4 sticky-top" style="top: 90px;">
            <h5 class="text-light fw-bold mb-3 border-bottom border-dark border-opacity-50 pb-2">ملخص الطلب</h5>

            <div class="d-flex justify-content-between text-muted mb-2 fs-6">
              <span>المجموع الفرعي:</span>
              <span class="text-light fw-bold">{{ (subtotal$ | async) | currencyEgp }}</span>
            </div>

            <div class="d-flex justify-content-between text-muted mb-3 fs-6">
              <span>مصاريف التوصيل:</span>
              <span class="text-lime fw-bold">{{ cartService.deliveryFee | currencyEgp }}</span>
            </div>

            <hr class="border-secondary opacity-25 my-3" />

            <div class="d-flex justify-content-between align-items-center mb-4">
              <span class="text-light fw-bold fs-5">الإجمالي الكلي:</span>
              <span class="price-tag fs-3">{{ (total$ | async) | currencyEgp }}</span>
            </div>

            <div class="alert alert-dark border-secondary p-2 mb-4 d-flex align-items-center gap-2">
              <i class="bi bi-shield-check text-success fs-4"></i>
              <div class="fs-7 text-muted">
                طريقة الدفع: <strong class="text-light">الدفع عند الاستلام (Cash on Delivery)</strong>
              </div>
            </div>

            <a routerLink="/checkout" class="btn btn-orange w-100 btn-lg rounded-pill py-3 fw-bold text-center d-block">
              إتمام الطلب الآن <i class="bi bi-arrow-left ms-2"></i>
            </a>

            <a routerLink="/products" class="btn btn-outline-secondary w-100 rounded-pill mt-2 text-center d-block btn-sm">
              متابعة التسوق
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .item-img {
      width: 70px;
      height: 70px;
      object-fit: cover;
    }
    .text-orange {
      color: #ff5722;
    }
    .text-lime {
      color: #a3e635;
    }
    .empty-icon-wrapper {
      width: 100px;
      height: 100px;
      background-color: rgba(255, 87, 34, 0.1);
    }
    .fs-7 {
      font-size: 0.85rem;
    }
  `]
})
export class CartComponent {
  public cartService = inject(CartService);

  cartItems$ = this.cartService.items$;
  subtotal$ = this.cartService.subtotal$;
  total$ = this.cartService.total$;

  updateQuantity(productId: string, kg: number): void {
    this.cartService.updateQuantity(productId, kg);
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    if (confirm('هل أنت متأكد من تفريغ جميع منتجات السلة؟')) {
      this.cartService.clearCart();
    }
  }
}
