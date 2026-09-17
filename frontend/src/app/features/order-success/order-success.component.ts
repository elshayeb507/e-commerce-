import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Order } from '../../core/models/order.model';
import { environment } from '../../../environments/environment';
import { CurrencyEgpPipe } from '../../shared/pipes/currency-egp.pipe';
import { WeightFormatPipe } from '../../shared/pipes/weight-format.pipe';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyEgpPipe, WeightFormatPipe],
  template: `
    <div class="container py-5 text-center">
      <div *ngIf="loading" class="py-5">
        <div class="spinner-border text-orange" role="status"></div>
        <p class="text-muted mt-2">جاري جلب تفاصيل الطلب...</p>
      </div>

      <div *ngIf="!loading && order" class="max-w-700 mx-auto">
        <!-- Success Banner -->
        <div class="card card-dark p-4 p-md-5 mb-4 text-center border-success border-opacity-50">
          <div class="success-icon-wrapper mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center">
            <i class="bi bi-check-circle-fill display-3 text-success"></i>
          </div>

          <h2 class="text-light fw-bold mb-2">تم استلام طلبك بنجاح</h2>
          <p class="text-muted fs-6 mb-3">
            شكراً لك على تسوقك من <strong class="text-orange">سوق آل حمام</strong>.<br>
            رقم الطلب الخاص بك هو: <span class="badge badge-orange fs-6 font-monospace">#{{ order.orderNumber }}</span>
          </p>
          <p class="text-muted small mb-4">سوف نتواصل معك في أقرب وقت لتأكيد الطلب وتحديد موعد التوصيل.</p>

          <!-- WhatsApp Click to Chat Button -->
          <a
            [href]="whatsappUrl"
            target="_blank"
            class="btn btn-success btn-lg rounded-pill px-5 py-3 fw-bold d-inline-flex align-items-center gap-2 shadow-lg mb-2 WhatsApp-btn">
            <i class="bi bi-whatsapp fs-3"></i>
            <span>تواصل معنا لتأكيد الطلب عبر واتساب</span>
          </a>
        </div>

        <!-- Receipt Details Card -->
        <div class="card card-dark p-4 text-start mb-4">
          <h5 class="text-light fw-bold mb-3 border-bottom border-dark border-opacity-50 pb-2 d-flex justify-content-between">
            <span>تفاصيل الطلب (الفاتورة)</span>
            <span class="badge bg-secondary opacity-75">الدفع عند الاستلام</span>
          </h5>

          <!-- Customer details -->
          <div class="row g-2 mb-3 text-muted small">
            <div class="col-sm-6">
              <strong>الاسم:</strong> <span class="text-light ms-1">{{ order.customerName }}</span>
            </div>
            <div class="col-sm-6">
              <strong>الهاتف:</strong> <span class="text-light ms-1" dir="ltr">{{ order.phone }}</span>
            </div>
            <div class="col-12">
              <strong>العنوان:</strong> <span class="text-light ms-1">{{ order.governorate }} - {{ order.city }} - {{ order.address }}</span>
            </div>
          </div>

          <!-- Items Table -->
          <div class="table-responsive mb-3">
            <table class="table table-dark table-striped align-middle mb-0">
              <thead>
                <tr class="text-muted small">
                  <th>المنتج</th>
                  <th>الوزن / الكمية</th>
                  <th>السعر / كجم</th>
                  <th class="text-end">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of order.items">
                  <td class="fw-bold text-light">{{ item.productName }}</td>
                  <td>{{ item.quantityKg | weightFormat }}</td>
                  <td>{{ item.pricePerKg | currencyEgp }}</td>
                  <td class="text-end text-lime fw-bold">{{ item.totalPrice | currencyEgp }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Cost summary -->
          <div class="d-flex justify-content-between text-muted small mb-1">
            <span>المجموع الفرعي:</span>
            <span class="text-light fw-bold">{{ order.subtotal | currencyEgp }}</span>
          </div>
          <div class="d-flex justify-content-between text-muted small mb-2">
            <span>مصاريف التوصيل:</span>
            <span class="text-lime fw-bold">{{ order.deliveryFee | currencyEgp }}</span>
          </div>
          <hr class="border-secondary opacity-25 my-2" />
          <div class="d-flex justify-content-between align-items-center">
            <span class="text-light fw-bold fs-5">إجمالي الطلب:</span>
            <span class="price-tag fs-3">{{ order.total | currencyEgp }}</span>
          </div>
        </div>

        <div>
          <a routerLink="/" class="btn btn-outline-secondary rounded-pill px-4">
            العودة للرئيسية
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .max-w-700 {
      max-width: 700px;
    }
    .success-icon-wrapper {
      width: 90px;
      height: 90px;
      background-color: rgba(16, 185, 129, 0.15);
    }
    .text-orange {
      color: #ff5722;
    }
    .text-lime {
      color: #a3e635;
    }
    .WhatsApp-btn {
      background-color: #25D366;
      border: none;
      transition: transform 0.2s ease, background-color 0.2s ease;
    }
    .WhatsApp-btn:hover {
      background-color: #1ebd56;
      transform: scale(1.03);
    }
  `]
})
export class OrderSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  orderNumber: string = '';
  order: Order | null = null;
  loading: boolean = true;

  ngOnInit(): void {
    this.orderNumber = this.route.snapshot.paramMap.get('orderNumber') || '';
    if (this.orderNumber) {
      this.fetchOrder();
    }
  }

  fetchOrder(): void {
    this.loading = true;
    this.apiService.getOrderByNumber(this.orderNumber).subscribe({
      next: res => {
        this.order = res.order;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get whatsappUrl(): string {
    if (!this.order) return '#';

    let itemsText = '';
    this.order.items.forEach(item => {
      itemsText += `• ${item.productName} × ${item.quantityKg} كجم = ${item.totalPrice} ج.م\n`;
    });

    const msg = `مرحباً، أريد تأكيد طلبي رقم #${this.order.orderNumber}

الاسم: ${this.order.customerName}
الهاتف: ${this.order.phone}
العنوان: ${this.order.governorate} - ${this.order.address}

الطلبات:
${itemsText}
المجموع الفرعي: ${this.order.subtotal} ج.م
الشحن: ${this.order.deliveryFee} ج.م
الإجمالي: ${this.order.total} ج.م

طريقة الدفع: الدفع عند الاستلام 💵`;

    return `https://wa.me/${environment.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }
}
