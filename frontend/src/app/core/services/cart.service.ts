import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_KEY = 'egypt_fresh_cart';
  private readonly DELIVERY_FEE = 15; // 15 EGP

  private itemsSubject = new BehaviorSubject<CartItem[]>(this.loadCartFromStorage());
  public items$ = this.itemsSubject.asObservable();

  public itemCount$ = this.items$.pipe(
    map(items => items.length)
  );

  public subtotal$ = this.items$.pipe(
    map(items =>
      items.reduce((sum, item) => sum + (item.quantityKg * item.product.pricePerKg), 0)
    )
  );

  public total$ = this.subtotal$.pipe(
    map(subtotal => (subtotal > 0 ? subtotal + this.DELIVERY_FEE : 0))
  );

  public deliveryFee = this.DELIVERY_FEE;

  addToCart(product: Product, quantityKg: number = 1): void {
    const currentItems = [...this.itemsSubject.value];
    const existingIndex = currentItems.findIndex(i => i.product._id === product._id);

    if (existingIndex > -1) {
      const updatedQty = Number((currentItems[existingIndex].quantityKg + quantityKg).toFixed(2));
      currentItems[existingIndex] = {
        product,
        quantityKg: updatedQty,
        itemTotal: Number((updatedQty * product.pricePerKg).toFixed(2))
      };
    } else {
      currentItems.push({
        product,
        quantityKg: Number(quantityKg.toFixed(2)),
        itemTotal: Number((quantityKg * product.pricePerKg).toFixed(2))
      });
    }

    this.saveCartToStorage(currentItems);
  }

  updateQuantity(productId: string, quantityKg: number): void {
    let currentItems = [...this.itemsSubject.value];
    const index = currentItems.findIndex(i => i.product._id === productId);

    if (index > -1) {
      if (quantityKg <= 0) {
        currentItems = currentItems.filter(i => i.product._id !== productId);
      } else {
        const qty = Number(quantityKg.toFixed(2));
        currentItems[index] = {
          ...currentItems[index],
          quantityKg: qty,
          itemTotal: Number((qty * currentItems[index].product.pricePerKg).toFixed(2))
        };
      }
      this.saveCartToStorage(currentItems);
    }
  }

  removeFromCart(productId: string): void {
    const updated = this.itemsSubject.value.filter(i => i.product._id !== productId);
    this.saveCartToStorage(updated);
  }

  clearCart(): void {
    this.saveCartToStorage([]);
  }

  getCartItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  private saveCartToStorage(items: CartItem[]): void {
    localStorage.setItem(this.CART_KEY, JSON.stringify(items));
    this.itemsSubject.next(items);
  }

  private loadCartFromStorage(): CartItem[] {
    const data = localStorage.getItem(this.CART_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
}
