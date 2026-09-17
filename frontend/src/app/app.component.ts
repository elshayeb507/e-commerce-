import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="d-flex flex-column min-vh-100 bg-primary-dark">
      <app-navbar></app-navbar>
      <main class="flex-grow-1">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .bg-primary-dark {
      background-color: #121318;
      min-height: 100vh;
    }
  `]
})
export class AppComponent {
  title = 'سوق آل حمام';
}
