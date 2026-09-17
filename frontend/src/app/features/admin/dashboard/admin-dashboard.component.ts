import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyEgpPipe],
  template: `
    <div class="container py-5">
      <!-- Admin Header Bar -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h2 class="text-light fw-bold mb-1">لوحة التحكم الرئيسية </h2>
          <p class="text-muted small mb-0">نظرة عامة على منتجات المتجر والطلبات وإحصائيات المبيعات</p>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/admin/products" class="btn btn-outline-custom rounded-pill btn-sm px-3">
            <i class="bi bi-box-seam me-1"></i> إدارة المنتجات
          </a>
          <a routerLink="/admin/categories" class="btn btn-outline-custom rounded-pill btn-sm px-3">
            <i class="bi bi-grid me-1"></i> إدارة التصنيفات
          </a>
          <a routerLink="/admin/orders" class="btn btn-orange rounded-pill btn-sm px-3">
            <i class="bi bi-receipt me-1"></i> إدارة الطلبات
          </a>
          <button class="btn btn-outline-danger rounded-pill btn-sm px-3" (click)="authService.logout()">
            <i class="bi bi-box-arrow-right me-1"></i> خروج
          </button>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-orange" role="status"></div>
      </div>

      <div *ngIf="!loading && statsData">
        <!-- Metric Cards Grid -->
        <div class="row g-3 mb-5">
          <!-- Card 1: Total Sales -->
          <div class="col-sm-6 col-lg-3">
            <div class="card card-dark p-3 h-100 border-start border-4 border-success">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted small d-block mb-1">إجمالي المبيعات</span>
                  <h3 class="text-lime fw-extrabold mb-0 fs-4">{{ statsData.totalSales | currencyEgp }}</h3>
                </div>
                <div class="stat-icon bg-success bg-opacity-15 text-success rounded-3 p-3">
                  <i class="bi bi-cash-coin fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2: Total Orders -->
          <div class="col-sm-6 col-lg-3">
            <div class="card card-dark p-3 h-100 border-start border-4 border-warning">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted small d-block mb-1">إجمالي الطلبات</span>
                  <h3 class="text-light fw-extrabold mb-0 fs-3">{{ statsData.totalOrders }}</h3>
                  <small class="text-warning fs-7">{{ statsData.pendingOrders }} طلبات معلقة</small>
                </div>
                <div class="stat-icon bg-warning bg-opacity-15 text-warning rounded-3 p-3">
                  <i class="bi bi-receipt-cutoff fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 3: Total Products -->
          <div class="col-sm-6 col-lg-3">
            <div class="card card-dark p-3 h-100 border-start border-4 border-primary">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted small d-block mb-1">المنتجات المسجلة</span>
                  <h3 class="text-light fw-extrabold mb-0 fs-3">{{ statsData.totalProducts }}</h3>
                  <small class="text-info fs-7">{{ statsData.availableProducts }} متاح للبيع</small>
                </div>
                <div class="stat-icon bg-primary bg-opacity-15 text-primary rounded-3 p-3">
                  <i class="bi bi-basket3 fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 4: Categories -->
          <div class="col-sm-6 col-lg-3">
            <div class="card card-dark p-3 h-100 border-start border-4 border-info">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted small d-block mb-1">التصنيفات المفعلة</span>
                  <h3 class="text-light fw-extrabold mb-0 fs-3">{{ statsData.totalCategories }}</h3>
                  <small class="text-muted fs-7">فئات المنتجات</small>
                </div>
                <div class="stat-icon bg-info bg-opacity-15 text-info rounded-3 p-3">
                  <i class="bi bi-grid-3x3-gap fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Orders Table -->
        <div class="card card-dark p-4">
          <div class="d-flex align-items-center justify-content-between mb-3 border-bottom border-dark border-opacity-50 pb-2">
            <h5 class="text-light fw-bold mb-0">أحدث الطلبات الواردة </h5>
            <a routerLink="/admin/orders" class="btn btn-sm btn-outline-custom rounded-pill">عرض كل الطلبات</a>
          </div>

          <div *ngIf="recentOrders.length === 0" class="text-muted text-center py-4">
            لا توجد طلبات واردة بعد
          </div>

          <div *ngIf="recentOrders.length > 0" class="table-responsive">
            <table class="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr class="text-muted small">
                  <th>رقم الطلب</th>
                  <th>العميل</th>
                  <th>الهاتف</th>
                  <th>العنوان</th>
                  <th>الإجمالي</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of recentOrders">
                  <td class="font-monospace text-orange fw-bold">#{{ order.orderNumber }}</td>
                  <td class="text-light fw-bold">{{ order.customerName }}</td>
                  <td dir="ltr" class="text-end">{{ order.phone }}</td>
                  <td class="text-muted small">{{ order.governorate }} - {{ order.address }}</td>
                  <td class="text-lime fw-bold">{{ order.total | currencyEgp }}</td>
                  <td>
                    <span [class]="getStatusBadgeClass(order.orderStatus)">
                      {{ getStatusText(order.orderStatus) }}
                    </span>
                  </td>
                  <td class="text-muted small">{{ order.createdAt | date:'shortDate' }}</td>
                </tr>
              </tbody>
            </table>
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
    .stat-icon {
      width: 54px;
      height: 54px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .fs-7 {
      font-size: 0.8rem;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private apiService = inject(ApiService);
  public authService = inject(AuthService);

  statsData: any = null;
  recentOrders: any[] = [];
  loading: boolean = true;

  ngOnInit(): void {
    this.apiService.getDashboardStats().subscribe({
      next: res => {
        this.statsData = res.stats;
        this.recentOrders = res.recentOrders;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
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
