import { Schema, model, Document } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: 'مدير النظام' },
    role: { type: String, default: 'admin' }
  },
  { timestamps: true }
);

export const Admin = model<IAdmin>('Admin', adminSchema);
