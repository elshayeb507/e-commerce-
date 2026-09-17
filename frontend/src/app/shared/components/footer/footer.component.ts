import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer-dark border-top border-dark border-opacity-50 mt-5 pt-5 pb-4">
      <div class="container">
        <div class="row g-4 mb-4">
          <!-- Col 1: Store info -->
          <div class="col-lg-4 col-md-6">
            <h5 class="text-light fw-bold mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-basket2-fill text-orange"></i> سوق آل حمام
            </h5>
            <p class="footer-text small lh-lg mb-3">
              متجر محلي متخصص في توفير أجود أنواع الخضار والفاكهة البلدية الطازجة، وتوصيلها حتى باب منزلك بأعلى جودة وأفضل الأسعار في مصر.
            </p>
            <div class="d-flex gap-2">
              <span class="badge badge-lime">الدفع عند الاستلام</span>
              <span class="badge badge-orange">توصيل سريع</span>
            </div>
          </div>

          <!-- Col 2: Quick Links -->
          <div class="col-lg-3 col-md-6">
            <h6 class="text-light fw-bold mb-3">روابط سريعة</h6>
            <ul class="list-unstyled footer-text small d-flex flex-column gap-2">
              <li><a routerLink="/" class="text-decoration-none footer-link">الرئيسية</a></li>
              <li><a routerLink="/products" class="text-decoration-none footer-link">جميع المنتجات</a></li>
              <li><a routerLink="/cart" class="text-decoration-none footer-link">سلة التسوق</a></li>
              <li><a routerLink="/admin/login" class="text-decoration-none footer-link">دخول الإدارة</a></li>
            </ul>
          </div>

          <!-- Col 3: Contact & WhatsApp -->
          <div class="col-lg-5 col-md-12">
            <h6 class="text-light fw-bold mb-3">تواصل معنا مباشر</h6>
            <p class="footer-text small mb-3">
              يمكنك التواصل معنا وتأكيد طلبك مباشرة عبر تطبيق الواتساب
            </p>
            <a [href]="whatsappUrl" target="_blank" class="btn btn-outline-success btn-sm rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2">
              <i class="bi bi-whatsapp fs-5"></i>
              <span>محادثة الواتساب المباشرة</span>
            </a>
          </div>
        </div>

        <hr class="border-secondary opacity-25 my-4" />

        <div class="d-flex flex-column flex-md-row align-items-center justify-content-between footer-text small gap-2">
          <span>جميع الحقوق محفوظة © {{ currentYear }} سوق آل حمام</span>
          <span>خدمة التوصيل متوفرة طوال الأسبوع</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-dark {
      background-color: #0b0c0f;
    }
    .footer-text {
      color: #cbd5e1 !important;
      font-size: 0.95rem;
    }
    .text-orange {
      color: #ff5722;
    }
    .footer-link {
      color: #cbd5e1;
      font-weight: 600;
      transition: color 0.2s ease;
    }
    .footer-link:hover {
      color: #ff5722;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  get whatsappUrl(): string {
    return `https://wa.me/${environment.whatsappNumber}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن منتجات متجر الخضار والفاكهة')}`;
  }
}
