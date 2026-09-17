import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container py-5">
      <!-- Top Bar -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h2 class="text-light fw-bold mb-1">إدارة التصنيفات </h2>
          <p class="text-muted small mb-0">إضافة وتعديل وحذف فئات الخضار والفاكهة في المتجر</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-orange rounded-pill px-4" (click)="openCreateModal()">
            <i class="bi bi-plus-circle-fill me-1"></i> إضافة تصنيف جديد
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

      <!-- Categories Data Table -->
      <div *ngIf="!loading" class="card card-dark p-3">
        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr class="text-muted small">
                <th>الصورة</th>
                <th>اسم التصنيف</th>
                <th>المعرف (Slug)</th>
                <th>الوصف</th>
                <th>الحالة</th>
                <th class="text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cat of categories">
                <td>
                  <img [src]="cat.image" [alt]="cat.name" class="rounded-circle" style="width: 44px; height: 44px; object-fit: cover;" />
                </td>
                <td class="fw-bold text-light">{{ cat.name }}</td>
                <td class="font-monospace text-muted small">{{ cat.slug }}</td>
                <td class="text-muted small text-truncate" style="max-width: 250px;">{{ cat.description || '-' }}</td>
                <td>
                  <span [class]="cat.isActive ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ cat.isActive ? 'مفعل' : 'معطل' }}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-info me-1" (click)="openEditModal(cat)">
                    <i class="bi bi-pencil-square"></i> تعديل
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="confirmDelete(cat)">
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
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title text-light fw-bold">
                {{ isEditMode ? 'تعديل التصنيف' : 'إضافة تصنيف جديد' }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()">
                <div class="mb-3">
                  <label class="form-label text-light fw-bold">اسم التصنيف <span class="text-danger">*</span></label>
                  <input type="text" class="form-control form-control-dark" placeholder="مثال: فواكه موسمية" formControlName="name" />
                </div>

                <div class="mb-3">
                  <label class="form-label text-light fw-bold">رابط صورة التصنيف (URL)</label>
                  <input type="url" class="form-control form-control-dark" placeholder="https://..." formControlName="image" />
                </div>

                <div class="mb-3">
                  <label class="form-label text-light fw-bold">وصف قصير (اختياري)</label>
                  <textarea class="form-control form-control-dark" rows="2" placeholder="شرح مختصر للتصنيف" formControlName="description"></textarea>
                </div>

                <div class="form-check form-switch mb-3">
                  <input class="form-check-input" type="checkbox" id="isActiveSwitch" formControlName="isActive">
                  <label class="form-check-label text-light me-2" for="isActiveSwitch">تفعيل التصنيف للعرض</label>
                </div>

                <div *ngIf="modalError" class="alert alert-danger p-2 mb-3 fs-7">
                  {{ modalError }}
                </div>

                <div class="modal-footer px-0 pb-0 border-top border-dark border-opacity-50">
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
export class AdminCategoriesComponent implements OnInit {
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);

  categories: Category[] = [];
  loading: boolean = true;
  saving: boolean = false;

  showModal: boolean = false;
  isEditMode: boolean = false;
  selectedCategoryId: string | null = null;
  modalError: string = '';

  categoryForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.fetchCategories();
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      image: [''],
      description: [''],
      isActive: [true]
    });
  }

  fetchCategories(): void {
    this.loading = true;
    this.apiService.getCategories(true).subscribe({
      next: res => {
        this.categories = res.categories;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedCategoryId = null;
    this.modalError = '';
    this.categoryForm.reset({
      name: '',
      image: '',
      description: '',
      isActive: true
    });
    this.showModal = true;
  }

  openEditModal(cat: Category): void {
    this.isEditMode = true;
    this.selectedCategoryId = cat._id!;
    this.modalError = '';

    this.categoryForm.patchValue({
      name: cat.name,
      image: cat.image || '',
      description: cat.description || '',
      isActive: cat.isActive
    });

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.modalError = '';

    const val = this.categoryForm.value;

    if (this.isEditMode && this.selectedCategoryId) {
      this.apiService.updateCategory(this.selectedCategoryId, val).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.fetchCategories();
        },
        error: err => {
          this.saving = false;
          this.modalError = err.error?.message || 'حدث خطأ أثناء تعديل التصنيف';
        }
      });
    } else {
      this.apiService.createCategory(val).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.fetchCategories();
        },
        error: err => {
          this.saving = false;
          this.modalError = err.error?.message || 'حدث خطأ أثناء إضافة التصنيف';
        }
      });
    }
  }

  confirmDelete(cat: Category): void {
    if (confirm(`هل أنت متأكد من حذف هذا التصنيف؟ (${cat.name})`)) {
      this.apiService.deleteCategory(cat._id!).subscribe({
        next: () => {
          this.fetchCategories();
        },
        error: err => {
          alert(err.error?.message || 'حدث خطأ أثناء حذف التصنيف');
        }
      });
    }
  }
}
