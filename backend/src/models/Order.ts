import { Schema, model, Document, Types } from 'mongoose';

export interface IOrderItem {
  product: Types.ObjectId;
  productName: string;
  pricePerKg: number;
  quantityKg: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerName: string;
  phone: string;
  secondaryPhone?: string;
  governorate?: string;
  city?: string;
  address: string;
  notes?: string;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'cash_on_delivery';
  paymentStatus: 'pending' | 'paid';
  orderStatus: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  pricePerKg: { type: Number, required: true },
  quantityKg: { type: Number, required: true, min: 0.05 },
  totalPrice: { type: Number, required: true }
});

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    secondaryPhone: { type: String, trim: true, default: '' },
    governorate: { type: String, trim: true, default: 'أسيوط' },
    city: { type: String, trim: true, default: '' },
    address: { type: String, required: true, trim: true },
    notes: { type: String, trim: true, default: '' },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 15 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash_on_delivery'], default: 'cash_on_delivery' },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

export const Order = model<IOrder>('Order', orderSchema);
