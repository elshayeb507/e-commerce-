import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ApiService } from '../../core/services/api.service';
import { CurrencyEgpPipe } from '../../shared/pipes/currency-egp.pipe';
import { WeightFormatPipe } from '../../shared/pipes/weight-format.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CurrencyEgpPipe, WeightFormatPipe],
  template: `
    <div class="container py-5">
      <div class="mb-4">
        <h2 class="text-light fw-bold mb-1">إتمام الطلب</h2>
        <p class="text-muted small">أدخل بيانات التوصيل لإرسال طلبك فوراً</p>
      </div>

      <div *ngIf="!(cartItems$ | async)?.length" class="alert alert-dark text-center my-4 p-5">
        <h4 class="text-light mb-3">سلتك فارغة</h4>
        <a routerLink="/products" class="btn btn-orange rounded-pill px-4">تصفح المنتجات</a>
      </div>

      <div *ngIf="(cartItems$ | async)?.length" class="row g-4">
        <!-- Delivery Information Form -->
        <div class="col-lg-7">
          <div class="card card-dark p-4">
            <h5 class="text-light fw-bold mb-4 pb-2 border-bottom border-dark border-opacity-50 d-flex align-items-center gap-2">
              <i class="bi bi-person-vcard text-orange fs-4"></i> بياناتك الشخصية وعنوان التوصيل
            </h5>

            <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
              <!-- Customer Name -->
              <div class="mb-3">
                <label class="form-label text-light fw-bold">الاسم بالكامل <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control form-control-dark"
                  placeholder="أدخل اسمك الكريم"
                  formControlName="customerName"
                  [class.is-invalid]="isFieldInvalid('customerName')" />
                <div class="invalid-feedback">يرجى إدخال الاسم بالكامل</div>
              </div>

              <!-- Phone Numbers -->
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label text-light fw-bold">رقم الهاتف (الرئيسي) <span class="text-danger">*</span></label>
                  <input
                    type="tel"
                    class="form-control form-control-dark text-start"
                    dir="ltr"
                    placeholder="01XXXXXXXXX"
                    formControlName="phone"
                    [class.is-invalid]="isFieldInvalid('phone')" />
                  <div class="invalid-feedback">يرجى إدخال رقم هاتف مصري صحيح (11 رقم يبدأ بـ 01)</div>
                </div>

                <div class="col-md-6">
                  <label class="form-label text-light fw-bold">هاتف بديل (اختياري)</label>
                  <input
                    type="tel"
                    class="form-control form-control-dark text-start"
                    dir="ltr"
                    placeholder="رقم للتأكيد الإضافي"
                    formControlName="secondaryPhone" />
                </div>
              </div>

              <!-- Governorate & City -->
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label text-light fw-bold">المحافظة <span class="text-danger">*</span></label>
                  <select class="form-select form-select-dark" formControlName="governorate">
                    <option value="أسوان">أسوان</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label text-light fw-bold">المنطقة / القرية <span class="text-danger">*</span></label>
                  <select
                    class="form-select form-select-dark"
                    formControlName="city"
                    [class.is-invalid]="isFieldInvalid('city')">
                    <option value="">-- اختر المنطقة المتاحة --</option>
                    <option *ngFor="let area of availableAreas" [value]="area">{{ area }}</option>
                  </select>
                  <div class="invalid-feedback">يرجى اختيار المنطقة من القائمة المتاحة</div>
                </div>
              </div>

              <!-- Detailed Address -->
              <div class="mb-3">
                <label class="form-label text-light fw-bold">العنوان بالتفصيل <span class="text-danger">*</span></label>
                <textarea
                  class="form-control form-control-dark"
                  rows="3"
                  placeholder="اسم الشارع، رقم المنزل، علامة مميزة"
                  formControlName="address"
                  [class.is-invalid]="isFieldInvalid('address')"></textarea>
                <div class="invalid-feedback">يرجى كتابة العنوان التفصيلي لتسهيل التوصيل</div>
              </div>

              <!-- Delivery Notes -->
              <div class="mb-4">
                <label class="form-label text-light fw-bold">ملاحظات إضافية (اختياري)</label>
                <input
                  type="text"
                  class="form-control form-control-dark"
                  placeholder="مثال: يرجى الاتصال قبل التوصيل"
                  formControlName="notes" />
              </div>

              <!-- Server Error Alert -->
              <div *ngIf="errorMessage" class="alert alert-danger p-3 mb-3">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ errorMessage }}
              </div>

              <button
                type="submit"
                class="btn btn-orange btn-lg w-100 rounded-pill py-3 fw-bold fs-5 d-flex align-items-center justify-content-center gap-2"
                [disabled]="isSubmitting">
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm"></span>
                <i *ngIf="!isSubmitting" class="bi bi-check-circle-fill"></i>
                <span>{{ isSubmitting ? 'جاري تأكيد الطلب...' : 'تأكيد الطلب' }}</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Order Summary & Payment -->
        <div class="col-lg-5">  
          <div class="card card-dark p-4 sticky-top" style="top: 90px;">
            <h5 class="text-light fw-bold mb-3 border-bottom border-dark border-opacity-50 pb-2 d-flex align-items-center justify-content-between">
              <span><i class="bi bi-cart-check text-orange me-1"></i> ملخص العربة</span>
              <a routerLink="/cart" class="fs-7 text-orange text-decoration-none">تعديل العربة</a>
            </h5>

            <!-- Items List -->
            <div class="items-preview-list mb-3 pe-1 overflow-y-auto" style="max-height: 250px;">
              <div *ngFor="let item of (cartItems$ | async)" class="d-flex align-items-center justify-content-between py-2 border-bottom border-dark border-opacity-25">
                <div class="d-flex align-items-center gap-2">
                  <img [src]="item.product.image" [alt]="item.product.name" class="rounded-2" style="width: 40px; height: 40px; object-fit: cover;" />
                  <div>
                    <h6 class="text-light mb-0 fs-6">{{ item.product.name }}</h6>
                    <small class="text-muted fs-7">الكمية: {{ item.quantityKg | weightFormat }}</small>
                  </div>
                </div>
                <span class="text-lime fw-bold fs-6">{{ item.itemTotal | currencyEgp }}</span>
              </div>
            </div>

            <!-- Price breakdown -->
            <div class="d-flex justify-content-between text-muted mb-2 fs-6">
              <span>المجموع الفرعي:</span>
              <span class="text-light fw-bold">{{ (subtotal$ | async) | currencyEgp }}</span>
            </div>

            <div class="d-flex justify-content-between text-muted mb-3 fs-6">
              <span>مصاريف الشحن:</span>
              <span class="text-lime fw-bold">{{ cartService.deliveryFee | currencyEgp }}</span>
            </div>

            <hr class="border-secondary opacity-25 my-2" />

            <div class="d-flex justify-content-between align-items-center mb-4">
              <span class="text-light fw-bold fs-5">الإجمالي النهائي:</span>
              <span class="price-tag fs-3">{{ (total$ | async) | currencyEgp }}</span>
            </div>

            <!-- Fixed Payment Method -->
            <div class="card bg-dark border-secondary p-3 text-center mb-2">
              <div class="d-flex align-items-center justify-content-center gap-2 text-warning fw-bold fs-6">
                <i class="bi bi-wallet2 fs-5"></i>
                <span>طريقة الدفع: الدفع عند الاستلام</span>
              </div>
              <small class="text-muted mt-1 d-block fs-7">تدفع نقداً للمندوب فور وصول الشحنة وفحصها</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-orange {
      color: #ff5722;
    }
    .text-lime {
      color: #a3e635;
    }
    .fs-7 {
      font-size: 0.85rem;
    }
  `]
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public cartService = inject(CartService);
  private apiService = inject(ApiService);

  cartItems$ = this.cartService.items$;
  subtotal$ = this.cartService.subtotal$;
  total$ = this.cartService.total$;

  governorates = ['أسوان'];
  availableAreas = ['وادي خريت 1', 'وادي خريت 2', 'أرمنا', 'عنيبة'];

  checkoutForm!: FormGroup;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
      secondaryPhone: [''],
      governorate: ['أسوان', Validators.required],
      city: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(3)]],
      notes: ['']
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.isSubmitting));
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const currentCart = this.cartService.getCartItems();
    if (!currentCart || currentCart.length === 0) {
      this.errorMessage = 'السلة فارغة، يرجى إضافة منتجات أولاً';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formVal = this.checkoutForm.value;
    const dto = {
      customerName: formVal.customerName,
      phone: formVal.phone,
      secondaryPhone: formVal.secondaryPhone,
      governorate: formVal.governorate,
      city: formVal.city,
      address: formVal.address,
      notes: formVal.notes,
      items: currentCart.map(item => ({
        productId: item.product._id!,
        quantityKg: item.quantityKg
      }))
    };

    this.apiService.createOrder(dto).subscribe({
      next: res => {
        this.isSubmitting = false;
        if (res.success && res.orderNumber) {
          this.cartService.clearCart();
          this.router.navigate(['/order-success', res.orderNumber]);
        }
      },
      error: err => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'حدث خطأ عند تقديم الطلب، يرجى المحاولة مرة أخرى';
      }
    });
  }
}
