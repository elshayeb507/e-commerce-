import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg sticky-top custom-navbar border-bottom border-dark border-opacity-50">
      <div class="container">
        <!-- Brand Logo & Name -->
        <a class="navbar-brand d-flex align-items-center gap-2" routerLink="/">
          <div class="brand-icon d-flex align-items-center justify-content-center">
            <i class="bi bi-basket2-fill text-white fs-4"></i>
          </div>
          <div class="brand-text">
            <span class="fw-extrabold text-light fs-5 d-block lh-1" >سوق آل حمام</span>
            <small class="text-muted fs-7">طازة لحد باب بيتك </small>
          </div>
        </a>

        <!-- Mobile Action Buttons (Cart + Menu Toggle) -->
        <div class="d-flex align-items-center gap-2 d-lg-none">
          <a routerLink="/cart" class="btn btn-orange position-relative px-3 py-2 btn-sm rounded-pill">
            <i class="bi bi-cart3 me-1 fs-6"></i>
            <span>السلة</span>
            <span *ngIf="(itemCount$ | async) as count" class="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-lime text-dark">
              {{ count }}
            </span>
          </a>

          <button
            class="navbar-toggler border-secondary text-light p-2"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="القائمة">
            <i class="bi bi-list fs-3 text-light"></i>
          </button>
        </div>

        <!-- Desktop Navigation Items -->
        <div class="collapse navbar-collapse" id="navbarContent">
          <ul class="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-3 text-center my-3 my-lg-0">
            <li class="nav-item">
              <a class="nav-link text-light fw-bold" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                الرئيسية
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-light fw-bold" routerLink="/products" routerLinkActive="active">
                المنتجات
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link text-light fw-bold" routerLink="/cart" routerLinkActive="active">
                عربة التسوق
              </a>
            </li>
          </ul>

          <!-- Right Action Buttons -->
          <div class="d-none d-lg-flex align-items-center gap-3">
            <!-- WhatsApp Direct Link -->
            <a [href]="whatsappUrl" target="_blank" class="btn btn-outline-success btn-sm rounded-pill d-flex align-items-center gap-2 px-3 py-2 fw-bold">
              <i class="bi bi-whatsapp fs-5"></i>
              <span>واتساب المتجر</span>
            </a>

            <!-- Cart Button -->
            <a routerLink="/cart" class="btn btn-orange position-relative rounded-pill px-4 py-2 d-flex align-items-center gap-2">
              <i class="bi bi-cart3 fs-5"></i>
              <span class="fw-bold">السلة</span>
              <span *ngIf="(itemCount$ | async) as count" class="badge bg-white text-dark rounded-circle px-2 py-1 fs-7 fw-bold">
                {{ count }}
              </span>
            </a>

            <!-- Admin Link -->
            <a *ngIf="authService.isLoggedIn()" routerLink="/admin/dashboard" class="btn btn-outline-warning btn-sm rounded-pill px-3 py-2">
              <i class="bi bi-speedometer2 me-1"></i> لوحة التحكم
            </a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .custom-navbar {
      background-color: rgba(18, 19, 24, 0.95);
      backdrop-filter: blur(12px);
    }
    .brand-icon {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, #ff5722 0%, #ff7043 100%);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(255, 87, 34, 0.4);
    }
    .nav-link {
      font-size: 1rem;
      transition: color 0.2s ease;
      padding: 6px 12px !important;
      border-radius: 8px;
    }
    .nav-link:hover, .nav-link.active {
      color: #ff5722 !important;
      background-color: rgba(255, 87, 34, 0.1);
    }
    .bg-lime {
      background-color: #a3e635;
      font-weight: 800;
    }
  `]
})
export class NavbarComponent {
  private cartService = inject(CartService);
  public authService = inject(AuthService);

  itemCount$ = this.cartService.itemCount$;

  get whatsappUrl(): string {
    return `https://wa.me/${environment.whatsappNumber}?text=${encodeURIComponent('مرحباً سوق آل حمام، استفسار عن الطلبات المتاحة')}`;
  }
}
