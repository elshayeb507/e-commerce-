import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyEgp',
  standalone: true
})
export class CurrencyEgpPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00 ج.م';
    }
    return `${value.toFixed(2)} ج.م`;
  }
}
