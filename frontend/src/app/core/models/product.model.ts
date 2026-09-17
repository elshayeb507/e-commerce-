import { Category } from './category.model';

export interface Product {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  category: Category | string;
  image: string;
  pricePerKg: number;
  unit: string;
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}
