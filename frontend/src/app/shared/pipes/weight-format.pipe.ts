import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'weightFormat',
  standalone: true
})
export class WeightFormatPipe implements PipeTransform {
  transform(kg: number | null | undefined, unit: string = 'كجم'): string {
    if (kg === null || kg === undefined || isNaN(kg)) {
      return `0 ${unit}`;
    }

    if (unit !== 'كجم') {
      return `${kg} ${unit}`;
    }

    if (kg === 0.25) return 'ربع كيلو (250 جرام)';
    if (kg === 0.5) return 'نصف كيلو (500 جرام)';
    if (kg === 0.75) return 'ثلاثة أرباع كيلو (750 جرام)';
    if (kg === 1) return '1 كيلو جرام';
    if (kg === 1.5) return 'كيلو ونصف (1.5 كجم)';
    if (kg === 2) return '2 كيلو جرام';
    if (kg === 2.5) return '2.5 كيلو جرام';
    if (kg === 3) return '3 كيلو جرام';
    if (kg === 5) return '5 كيلو جرام';

    return `${kg} كجم`;
  }
}
