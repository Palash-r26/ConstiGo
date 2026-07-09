import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  supplier: Types.ObjectId;
  category?: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  unit: string; // e.g., "Bag (50kg)", "Ton", "Piece"
  stockQty: number;
  isAvailable: boolean;
  images: string[];
  grade?: string; // e.g., "Grade A", "High Early Strength"
}

const productSchema = new Schema<IProduct>(
  {
    supplier: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true, default: 'Unit' },
    stockQty: { type: Number, required: true, default: 0 },
    isAvailable: { type: Boolean, default: true },
    images: [{ type: String }],
    grade: { type: String },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', productSchema);
