import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container py-5 d-flex align-items-center justify-content-center min-vh-75">
      <div class="card card-dark p-4 p-md-5 shadow-lg w-100 max-w-450 border-orange">
        <div class="text-center mb-4">
          <div class="admin-icon-wrapper mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center">
            <i class="bi bi-shield-lock-fill display-5 text-orange"></i>
          </div>
          <h3 class="text-light fw-bold mb-1">تسجيل دخول الإدارة</h3>
          <p class="text-muted small">منطقة خاصة بمدير متجر الخضار والفاكهة</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label text-light fw-bold">البريد الإلكتروني</label>
            <input
              type="email"
              class="form-control form-control-dark text-start"
              dir="ltr"
              placeholder="admin@store.com"
              formControlName="email"
              [class.is-invalid]="isFieldInvalid('email')" />
            <div class="invalid-feedback">يرجى إدخال بريد إلكتروني صحيح</div>
          </div>

          <div class="mb-4">
            <label class="form-label text-light fw-bold">كلمة المرور</label>
            <input
              type="password"
              class="form-control form-control-dark text-start"
              dir="ltr"
              placeholder="••••••••"
              formControlName="password"
              [class.is-invalid]="isFieldInvalid('password')" />
            <div class="invalid-feedback">يرجى إدخال كلمة المرور</div>
          </div>

          <div *ngIf="errorMessage" class="alert alert-danger p-3 mb-3 fs-7">
            <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ errorMessage }}
          </div>

          <button
            type="submit"
            class="btn btn-orange w-100 py-3 rounded-pill fw-bold fs-6"
            [disabled]="loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            <span>{{ loading ? 'جاري التحقق...' : 'تسجيل الدخول' }}</span>
          </button>
        </form>

        <div class="mt-4 pt-3 border-top border-dark border-opacity-50 text-center text-muted fs-7">
          بيانات التجربة الافتراضية:<br>
          <span class="text-light font-monospace">admin&#64;store.com / admin123</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .max-w-450 {
      max-width: 450px;
    }
    .min-vh-75 {
      min-height: 75vh;
    }
    .admin-icon-wrapper {
      width: 80px;
      height: 80px;
      background-color: rgba(255, 87, 34, 0.15);
    }
    .border-orange {
      border-color: rgba(255, 87, 34, 0.3) !important;
    }
    .text-orange {
      color: #ff5722;
    }
    .fs-7 {
      font-size: 0.85rem;
    }
  `]
})
export class AdminLoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm!: FormGroup;
  loading: boolean = false;
  errorMessage: string = '';
  returnUrl: string = '/admin/dashboard';

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/dashboard']);
    }

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';

    this.loginForm = this.fb.group({
      email: ['admin@store.com', [Validators.required, Validators.email]],
      password: ['admin123', Validators.required]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.router.navigateByUrl(this.returnUrl);
        }
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'بيانات الدخول غير صحيحة';
      }
    });
  }
}
