import { Schema, model, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  category: Types.ObjectId;
  image: string;
  pricePerKg: number;
  unit: string;
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    image: { type: String, required: true },
    pricePerKg: { type: Number, required: true, min: 0.1 },
    unit: { type: String, default: 'كجم' },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Product = model<IProduct>('Product', productSchema);
