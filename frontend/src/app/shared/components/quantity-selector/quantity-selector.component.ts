import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quantity-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quantity-selector-container">
      <div class="preset-pills d-flex flex-wrap gap-1 mb-2">
        <button
          *ngFor="let option of presetOptions"
          type="button"
          class="btn btn-sm pill-btn"
          [class.active]="selectedKg === option.val"
          (click)="selectPreset(option.val)">
          {{ option.label }}
        </button>
      </div>

      <div class="input-group input-group-sm">
        <button
          type="button"
          class="btn btn-outline-secondary step-btn"
          (click)="decrement()">
          <i class="bi bi-dash-lg"></i>
        </button>
        <input
          type="number"
          class="form-control text-center weight-input bg-dark text-light border-secondary"
          [value]="selectedKg"
          (change)="onInputChange($event)"
          step="0.25"
          min="0.25"
          max="50" />
        <span class="input-group-text bg-dark text-muted border-secondary">كجم</span>
        <button
          type="button"
          class="btn btn-outline-secondary step-btn"
          (click)="increment()">
          <i class="bi bi-plus-lg"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .preset-pills {
      justify-content: flex-start;
    }
    .pill-btn {
      background-color: #171922;
      color: #94a3b8;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 3px 8px;
      transition: all 0.2s ease;
    }
    .pill-btn:hover {
      background-color: #222530;
      color: #fff;
    }
    .pill-btn.active {
      background-color: rgba(255, 87, 34, 0.2);
      color: #ff5722;
      border-color: #ff5722;
    }
    .step-btn {
      color: #cbd5e1;
      border-color: rgba(255, 255, 255, 0.15) !important;
    }
    .step-btn:hover {
      background-color: #ff5722;
      color: #fff;
      border-color: #ff5722 !important;
    }
    .weight-input {
      max-width: 75px;
      font-weight: 700;
      font-size: 0.9rem;
    }
  `]
})
export class QuantitySelectorComponent {
  @Input() selectedKg: number = 1;
  @Output() quantityChange = new EventEmitter<number>();

  presetOptions = [
    { label: '¼ كيلو', val: 0.25 },
    { label: '½ كيلو', val: 0.5 },
    { label: '1 كجم', val: 1 },
    { label: '2 كجم', val: 2 },
    { label: '3 كجم', val: 3 },
    { label: '5 كجم', val: 5 }
  ];

  selectPreset(val: number): void {
    this.selectedKg = val;
    this.quantityChange.emit(this.selectedKg);
  }

  increment(): void {
    this.selectedKg = Number((this.selectedKg + 0.25).toFixed(2));
    this.quantityChange.emit(this.selectedKg);
  }

  decrement(): void {
    if (this.selectedKg > 0.25) {
      this.selectedKg = Number((this.selectedKg - 0.25).toFixed(2));
      this.quantityChange.emit(this.selectedKg);
    }
  }

  onInputChange(event: any): void {
    const val = parseFloat(event.target.value);
    if (!isNaN(val) && val >= 0.25) {
      this.selectedKg = Number(val.toFixed(2));
      this.quantityChange.emit(this.selectedKg);
    }
  }
}
