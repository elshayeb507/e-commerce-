import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../core/models/order.model';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';
import { WeightFormatPipe } from '../../../shared/pipes/weight-format.pipe';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CurrencyEgpPipe, WeightFormatPipe],
  template: `
    <div class="container py-5">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h2 class="text-light fw-bold mb-1">إدارة طلبيات المتجر </h2>
          <p class="text-muted small mb-0">متابعة وتحديث حالات طلبات العملاء وتأكيدها</p>
        </div>
        <div>
          <a routerLink="/admin/dashboard" class="btn btn-outline-secondary rounded-pill px-4">
            لوحة التحكم
          </a>
        </div>
      </div>

      <!-- Status Filter Tabs & Search -->
      <div class="card card-dark p-3 mb-4">
        <div class="row align-items-center g-3">
          <div class="col-lg-8">
            <div class="d-flex flex-wrap gap-1">
              <button
                *ngFor="let tab of statusTabs"
                type="button"
                class="btn btn-sm rounded-pill px-3 py-1 tab-btn"
                [class.active]="selectedStatus === tab.key"
                (click)="filterByStatus(tab.key)">
                {{ tab.label }}
              </button>
            </div>
          </div>
          <div class="col-lg-4">
            <input
              type="text"
              class="form-control form-control-dark form-control-sm"
              placeholder="ابحث برقم الطلب أو اسم العميل أو الهاتف..."
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()" />
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-orange" role="status"></div>
      </div>

      <!-- Orders Data Table -->
      <div *ngIf="!loading && orders.length === 0" class="alert alert-dark text-center py-4">
        لا توجد طلبات تطابق الفلتر المختار
      </div>

      <div *ngIf="!loading && orders.length > 0" class="card card-dark p-3">
        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr class="text-muted small">
                <th>رقم الطلب</th>
                <th>العميل</th>
                <th>رقم الهاتف</th>
                <th>المحافظة والمدينة</th>
                <th>عدد المنتجات</th>
                <th>الإجمالي</th>
                <th>حالة الطلب</th>
                <th>التاريخ</th>
                <th class="text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of orders">
                <td class="font-monospace text-orange fw-bold">#{{ order.orderNumber }}</td>
                <td class="fw-bold text-light">{{ order.customerName }}</td>
                <td dir="ltr" class="text-end">{{ order.phone }}</td>
                <td class="text-muted small">{{ order.governorate }} - {{ order.city || 'المركز' }}</td>
                <td>{{ order.items.length }} صنف</td>
                <td class="text-lime fw-bold">{{ order.total | currencyEgp }}</td>
                <td>
                  <span [class]="getStatusBadgeClass(order.orderStatus)">
                    {{ getStatusText(order.orderStatus) }}
                  </span>
                </td>
                <td class="text-muted small">{{ order.createdAt | date:'short' }}</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-info me-1" (click)="openDetailModal(order)">
                    <i class="bi bi-eye"></i> التفاصيل
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="confirmDelete(order)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Order Details Modal -->
      <div *ngIf="selectedOrder && showModal" class="modal d-block modal-dark bg-black bg-opacity-75" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title text-light fw-bold">
                تفاصيل الطلب <span class="text-orange font-monospace">#{{ selectedOrder.orderNumber }}</span>
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
            </div>
            <div class="modal-body">
              <!-- Customer details & WhatsApp -->
              <div class="row g-3 mb-4 p-3 bg-dark bg-opacity-50 rounded-3">
                <div class="col-md-6">
                  <span class="text-muted small d-block">اسم العميل:</span>
                  <strong class="text-light fs-6">{{ selectedOrder.customerName }}</strong>
                </div>
                <div class="col-md-6">
                  <span class="text-muted small d-block">رقم الهاتف:</span>
                  <strong dir="ltr" class="text-light fs-6">{{ selectedOrder.phone }}</strong>
                  <a [href]="getCustomerWhatsAppUrl(selectedOrder)" target="_blank" class="btn btn-sm btn-success rounded-pill ms-2 px-2 py-0 fs-7">
                    <i class="bi bi-whatsapp"></i> مراسلة
                  </a>
                </div>
                <div class="col-12">
                  <span class="text-muted small d-block">العنوان التفصيلي:</span>
                  <span class="text-light">{{ selectedOrder.governorate }} - {{ selectedOrder.city }} - {{ selectedOrder.address }}</span>
                </div>
                <div *ngIf="selectedOrder.notes" class="col-12">
                  <span class="text-muted small d-block">ملاحظات التوصيل:</span>
                  <span class="text-warning small">{{ selectedOrder.notes }}</span>
                </div>
              </div>

              <!-- Status Changer Controls -->
              <div class="card card-dark border-orange p-3 mb-4">
                <div class="row align-items-center g-3">
                  <div class="col-md-6">
                    <label class="form-label text-light fw-bold mb-1">تحديث حالة الطلب:</label>
                    <select class="form-select form-select-dark" [(ngModel)]="newOrderStatus" (change)="updateStatus()">
                      <option value="pending">قيد الانتظار</option>
                      <option value="confirmed">تم التأكيد </option>
                      <option value="preparing">جاري التجهيز </option>
                      <option value="out_for_delivery">خرج للتوصيل </option>
                      <option value="delivered">تم التسليم</option>
                      <option value="cancelled">ملغي </option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label text-light fw-bold mb-1">حالة الدفع (نقدي عند الاستلام):</label>
                    <select class="form-select form-select-dark" [(ngModel)]="newPaymentStatus" (change)="updateStatus()">
                      <option value="pending">لم يتم الدفع بعد (معلق)</option>
                      <option value="paid">تم تحصيل المبلغ (مدفوع)</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Products Table -->
              <h6 class="text-light fw-bold mb-2">قائمة أصناف الطلب:</h6>
              <div class="table-responsive mb-3">
                <table class="table table-dark table-striped align-middle mb-0">
                  <thead>
                    <tr class="text-muted small">
                      <th>الصنف</th>
                      <th>الوزن / الكمية</th>
                      <th>السعر / كجم</th>
                      <th class="text-end">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of selectedOrder.items">
                      <td class="fw-bold text-light">{{ item.productName }}</td>
                      <td>{{ item.quantityKg | weightFormat }}</td>
                      <td>{{ item.pricePerKg | currencyEgp }}</td>
                      <td class="text-end text-lime fw-bold">{{ item.totalPrice | currencyEgp }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Cost breakdown -->
              <div class="d-flex justify-content-between text-muted small mb-1">
                <span>المجموع الفرعي:</span>
                <span class="text-light fw-bold">{{ selectedOrder.subtotal | currencyEgp }}</span>
              </div>
              <div class="d-flex justify-content-between text-muted small mb-2">
                <span>مصاريف التوصيل:</span>
                <span class="text-lime fw-bold">{{ selectedOrder.deliveryFee | currencyEgp }}</span>
              </div>
              <hr class="border-secondary opacity-25 my-2" />
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-light fw-bold fs-5">إجمالي الفاتورة:</span>
                <span class="price-tag fs-3">{{ selectedOrder.total | currencyEgp }}</span>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary rounded-pill px-4" (click)="closeModal()">إغلاق</button>
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
    .border-orange {
      border-color: rgba(255, 87, 34, 0.4) !important;
    }
    .tab-btn {
      background-color: #1a1c23;
      color: #94a3b8;
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-weight: 600;
    }
    .tab-btn.active {
      background-color: #ff5722;
      color: #fff;
      border-color: #ff5722;
    }
    .fs-7 {
      font-size: 0.8rem;
    }
  `]
})
export class AdminOrdersComponent implements OnInit {
  private apiService = inject(ApiService);

  orders: Order[] = [];
  loading: boolean = true;

  selectedStatus: string = 'all';
  searchQuery: string = '';

  statusTabs = [
    { key: 'all', label: 'جميع الطلبات' },
    { key: 'pending', label: 'قيد الانتظار' },
    { key: 'confirmed', label: 'تم التأكيد' },
    { key: 'preparing', label: 'جاري التجهيز' },
    { key: 'out_for_delivery', label: 'خرج للتوصيل' },
    { key: 'delivered', label: 'تم التسليم' },
    { key: 'cancelled', label: 'ملغي' }
  ];

  showModal: boolean = false;
  selectedOrder: Order | null = null;
  newOrderStatus: string = 'pending';
  newPaymentStatus: string = 'pending';

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.loading = true;
    this.apiService
      .getOrders({
        status: this.selectedStatus,
        search: this.searchQuery
      })
      .subscribe({
        next: res => {
          this.orders = res.orders;
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  filterByStatus(statusKey: string): void {
    this.selectedStatus = statusKey;
    this.fetchOrders();
  }

  onSearchChange(): void {
    this.fetchOrders();
  }

  openDetailModal(order: Order): void {
    this.selectedOrder = order;
    this.newOrderStatus = order.orderStatus;
    this.newPaymentStatus = order.paymentStatus;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedOrder = null;
  }

  updateStatus(): void {
    if (!this.selectedOrder) return;

    this.apiService
      .updateOrderStatus(this.selectedOrder._id!, {
        orderStatus: this.newOrderStatus,
        paymentStatus: this.newPaymentStatus
      })
      .subscribe({
        next: res => {
          if (res.success) {
            this.selectedOrder = res.order;
            this.fetchOrders();
          }
        },
        error: err => {
          alert(err.error?.message || 'حدث خطأ عند تحديث الحالة');
        }
      });
  }

  confirmDelete(order: Order): void {
    if (confirm(`هل أنت متأكد من حذف هذا الطلب رقم #${order.orderNumber}؟`)) {
      this.apiService.deleteOrder(order._id!).subscribe({
        next: () => this.fetchOrders(),
        error: err => alert(err.error?.message || 'حدث خطأ عند حذف الطلب')
      });
    }
  }

  getCustomerWhatsAppUrl(order: Order): string {
    const formattedPhone = order.phone.startsWith('01') ? `2${order.phone}` : order.phone;
    const msg = `مرحباً ${order.customerName}، يسعدنا تواصلك من متجر الخضار والفاكهة بخصوص طلبك رقم #${order.orderNumber}`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'badge bg-warning text-dark';
      case 'confirmed': return 'badge bg-info text-dark';
      case 'preparing': return 'badge bg-primary';
      case 'out_for_delivery': return 'badge bg-secondary';
      case 'delivered': return 'badge bg-success';
      case 'cancelled': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'confirmed': return 'تم التأكيد';
      case 'preparing': return 'جاري التجهيز';
      case 'out_for_delivery': return 'خرج للتوصيل';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  }
}
