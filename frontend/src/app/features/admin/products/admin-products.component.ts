import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CurrencyEgpPipe],
  template: `
    <div class="container py-5">
      <!-- Top Bar -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h2 class="text-light fw-bold mb-1">إدارة المنتجات</h2>
          <p class="text-muted small mb-0">إضافة وتعديل وحذف الخضروات والفاكهة وتحديد أسعار الكيلو</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-orange rounded-pill px-4" (click)="openCreateModal()">
            <i class="bi bi-plus-circle-fill me-1"></i> إضافة منتج جديد
          </button>
          <a routerLink="/admin/dashboard" class="btn btn-outline-secondary rounded-pill px-3">
            لوحة التحكم
          </a>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-orange" role="status"></div>
      </div>

      <!-- Products Data Table -->
      <div *ngIf="!loading" class="card card-dark p-3">
        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr class="text-muted small">
                <th>الصورة</th>
                <th>اسم المنتج</th>
                <th>التصنيف</th>
                <th>السعر / كجم</th>
                <th>الحالة</th>
                <th>مميز؟</th>
                <th class="text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of products">
                <td>
                  <img [src]="product.image" [alt]="product.name" class="rounded-3" style="width: 48px; height: 48px; object-fit: cover;" />
                </td>
                <td class="fw-bold text-light">{{ product.name }}</td>
                <td>
                  <span class="badge badge-lime">{{ getCategoryName(product.category) }}</span>
                </td>
                <td class="text-lime fw-bold">{{ product.pricePerKg | currencyEgp }}</td>
                <td>
                  <span [class]="product.isAvailable ? 'badge bg-success' : 'badge bg-danger'">
                    {{ product.isAvailable ? 'متوفر' : 'غير متوفر' }}
                  </span>
                </td>
                <td>
                  <span *ngIf="product.isFeatured" class="badge badge-orange">مميز</span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-info me-1" (click)="openEditModal(product)">
                    <i class="bi bi-pencil-square"></i> تعديل
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="confirmDelete(product)">
                    <i class="bi bi-trash"></i> حذف
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create / Edit Modal -->
      <div *ngIf="showModal" class="modal d-block modal-dark bg-black bg-opacity-75" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title text-light fw-bold">
                {{ isEditMode ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد' }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="productForm" (ngSubmit)="saveProduct()">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label text-light fw-bold">اسم المنتج <span class="text-danger">*</span></label>
                    <input type="text" class="form-control form-control-dark" placeholder="مثال: طماطم بلدي" formControlName="name" />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label text-light fw-bold">التصنيف <span class="text-danger">*</span></label>
                    <select class="form-select form-select-dark" formControlName="category">
                      <option value="">-- اختر التصنيف --</option>
                      <option *ngFor="let cat of categories" [value]="cat._id">{{ cat.name }}</option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label text-light fw-bold">السعر لكل كيلوجرام (ج.م) <span class="text-danger">*</span></label>
                    <input type="number" step="0.5" class="form-control form-control-dark" placeholder="15" formControlName="pricePerKg" />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label text-light fw-bold">الوحدة</label>
                    <input type="text" class="form-control form-control-dark" placeholder="كجم" formControlName="unit" />
                  </div>

                  <div class="col-12">
                    <label class="form-label text-light fw-bold">رابط صورة المنتج (URL) <span class="text-danger">*</span></label>
                    <input type="url" class="form-control form-control-dark" placeholder="https://..." formControlName="image" />
                  </div>

                  <div class="col-12">
                    <label class="form-label text-light fw-bold">الوصف (اختياري)</label>
                    <textarea class="form-control form-control-dark" rows="2" placeholder="وصف قصير للمنتج" formControlName="description"></textarea>
                  </div>

                  <div class="col-md-6">
                    <div class="form-check form-switch mt-2">
                      <input class="form-check-input" type="checkbox" id="isAvailableSwitch" formControlName="isAvailable">
                      <label class="form-check-label text-light me-2" for="isAvailableSwitch">المنتج متوفر للبيع</label>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="form-check form-switch mt-2">
                      <input class="form-check-input" type="checkbox" id="isFeaturedSwitch" formControlName="isFeatured">
                      <label class="form-check-label text-light me-2" for="isFeaturedSwitch">منتج مميز في الواجهة</label>
                    </div>
                  </div>
                </div>

                <div *ngIf="modalError" class="alert alert-danger mt-3 mb-0">
                  {{ modalError }}
                </div>

                <div class="modal-footer px-0 pb-0 mt-4 border-top border-dark border-opacity-50">
                  <button type="button" class="btn btn-outline-secondary rounded-pill px-4" (click)="closeModal()">إلغاء</button>
                  <button type="submit" class="btn btn-orange rounded-pill px-5" [disabled]="saving">
                    <span *ngIf="saving" class="spinner-border spinner-border-sm me-1"></span>
                    <span>حفظ البيانات</span>
                  </button>
                </div>
              </form>
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
  `]
})
export class AdminProductsComponent implements OnInit {
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);

  products: Product[] = [];
  categories: Category[] = [];
  loading: boolean = true;
  saving: boolean = false;

  showModal: boolean = false;
  isEditMode: boolean = false;
  selectedProductId: string | null = null;
  modalError: string = '';

  productForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.fetchData();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      image: ['', Validators.required],
      pricePerKg: [15, [Validators.required, Validators.min(0.1)]],
      unit: ['كجم', Validators.required],
      isAvailable: [true],
      isFeatured: [false]
    });
  }

  fetchData(): void {
    this.loading = true;
    this.apiService.getCategories(true).subscribe({
      next: catRes => {
        this.categories = catRes.categories;
        this.apiService.getProducts({ includeUnavailable: true }).subscribe({
          next: prodRes => {
            this.products = prodRes.products;
            this.loading = false;
          },
          error: () => this.loading = false
        });
      },
      error: () => this.loading = false
    });
  }

  getCategoryName(category: any): string {
    if (!category) return '-';
    if (typeof category === 'object') return category.name;
    const found = this.categories.find(c => c._id === category);
    return found ? found.name : '-';
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedProductId = null;
    this.modalError = '';
    this.productForm.reset({
      name: '',
      description: '',
      category: this.categories.length > 0 ? this.categories[0]._id : '',
      image: '',
      pricePerKg: 20,
      unit: 'كجم',
      isAvailable: true,
      isFeatured: false
    });
    this.showModal = true;
  }

  openEditModal(product: Product): void {
    this.isEditMode = true;
    this.selectedProductId = product._id!;
    this.modalError = '';

    const catId = typeof product.category === 'object' ? product.category._id : product.category;

    this.productForm.patchValue({
      name: product.name,
      description: product.description || '',
      category: catId,
      image: product.image,
      pricePerKg: product.pricePerKg,
      unit: product.unit || 'كجم',
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured
    });

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.modalError = '';

    const val = this.productForm.value;

    if (this.isEditMode && this.selectedProductId) {
      this.apiService.updateProduct(this.selectedProductId, val).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.fetchData();
        },
        error: err => {
          this.saving = false;
          this.modalError = err.error?.message || 'حدث خطأ أثناء تعديل المنتج';
        }
      });
    } else {
      this.apiService.createProduct(val).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.fetchData();
        },
        error: err => {
          this.saving = false;
          this.modalError = err.error?.message || 'حدث خطأ أثناء إضافة المنتج';
        }
      });
    }
  }

  confirmDelete(product: Product): void {
    if (confirm(`هل أنت متأكد من حذف هذا المنتج؟ (${product.name})`)) {
      this.apiService.deleteProduct(product._id!).subscribe({
        next: () => {
          this.fetchData();
        },
        error: err => {
          alert(err.error?.message || 'حدث خطأ عند حذف المنتج');
        }
      });
    }
  }
}
