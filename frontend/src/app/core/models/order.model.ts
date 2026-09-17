export interface OrderItem {
  product?: string;
  productName: string;
  pricePerKg: number;
  quantityKg: number;
  totalPrice: number;
}

export interface Order {
  _id?: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  secondaryPhone?: string;
  governorate?: string;
  city?: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'cash_on_delivery';
  paymentStatus: 'pending' | 'paid';
  orderStatus: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderDto {
  customerName: string;
  phone: string;
  secondaryPhone?: string;
  governorate?: string;
  city?: string;
  address: string;
  notes?: string;
  items: {
    productId: string;
    quantityKg: number;
  }[];
}
