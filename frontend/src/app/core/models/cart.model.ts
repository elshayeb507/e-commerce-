import { Product } from './product.model';

export interface CartItem {
  product: Product;
  quantityKg: number; //  0.25, 0.5, 1, 2, 3
  itemTotal: number;  // quantityKg * product.pricePerKg
}
