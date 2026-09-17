import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';
import { Order, CreateOrderDto } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
 
  getCategories(includeInactive: boolean = false): Observable<{ success: boolean; count: number; categories: Category[] }> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<{ success: boolean; count: number; categories: Category[] }>(`${this.baseUrl}/categories`, { params });
  }

  createCategory(categoryData: Partial<Category>): Observable<{ success: boolean; message: string; category: Category }> {
    return this.http.post<{ success: boolean; message: string; category: Category }>(`${this.baseUrl}/categories`, categoryData);
  }

  updateCategory(id: string, categoryData: Partial<Category>): Observable<{ success: boolean; message: string; category: Category }> {
    return this.http.patch<{ success: boolean; message: string; category: Category }>(`${this.baseUrl}/categories/${id}`, categoryData);
  }

  deleteCategory(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/categories/${id}`);
  }

   
  getProducts(options?: { category?: string; search?: string; featured?: boolean; includeUnavailable?: boolean }): Observable<{ success: boolean; count: number; products: Product[] }> {
    let params = new HttpParams();
    if (options?.category) params = params.set('category', options.category);
    if (options?.search) params = params.set('search', options.search);
    if (options?.featured) params = params.set('featured', 'true');
    if (options?.includeUnavailable) params = params.set('includeUnavailable', 'true');

    return this.http.get<{ success: boolean; count: number; products: Product[] }>(`${this.baseUrl}/products`, { params });
  }

  getProductById(id: string): Observable<{ success: boolean; product: Product }> {
    return this.http.get<{ success: boolean; product: Product }>(`${this.baseUrl}/products/${id}`);
  }

  createProduct(productData: Partial<Product>): Observable<{ success: boolean; message: string; product: Product }> {
    return this.http.post<{ success: boolean; message: string; product: Product }>(`${this.baseUrl}/products`, productData);
  }

  updateProduct(id: string, productData: Partial<Product>): Observable<{ success: boolean; message: string; product: Product }> {
    return this.http.patch<{ success: boolean; message: string; product: Product }>(`${this.baseUrl}/products/${id}`, productData);
  }

  deleteProduct(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/products/${id}`);
  }

  // --- ORDERS ---
  createOrder(orderData: CreateOrderDto): Observable<{ success: boolean; message: string; orderNumber: string; order: Order }> {
    return this.http.post<{ success: boolean; message: string; orderNumber: string; order: Order }>(`${this.baseUrl}/orders`, orderData);
  }

  getOrders(options?: { status?: string; search?: string }): Observable<{ success: boolean; count: number; orders: Order[] }> {
    let params = new HttpParams();
    if (options?.status) params = params.set('status', options.status);
    if (options?.search) params = params.set('search', options.search);

    return this.http.get<{ success: boolean; count: number; orders: Order[] }>(`${this.baseUrl}/orders`, { params });
  }

  getOrderById(id: string): Observable<{ success: boolean; order: Order }> {
    return this.http.get<{ success: boolean; order: Order }>(`${this.baseUrl}/orders/${id}`);
  }

  getOrderByNumber(orderNumber: string): Observable<{ success: boolean; order: Order }> {
    return this.http.get<{ success: boolean; order: Order }>(`${this.baseUrl}/orders/track/${orderNumber}`);
  }

  updateOrderStatus(id: string, statusData: { orderStatus?: string; paymentStatus?: string }): Observable<{ success: boolean; message: string; order: Order }> {
    return this.http.patch<{ success: boolean; message: string; order: Order }>(`${this.baseUrl}/orders/${id}/status`, statusData);
  }

  deleteOrder(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/orders/${id}`);
  }

  
  getDashboardStats(): Observable<{
    success: boolean;
    stats: {
      totalProducts: number;
      availableProducts: number;
      totalCategories: number;
      totalOrders: number;
      pendingOrders: number;
      preparingOrders: number;
      deliveredOrders: number;
      totalSales: number;
    };
    recentOrders: Order[];
  }> {
    return this.http.get<any>(`${this.baseUrl}/admin/dashboard/stats`);
  }
}
