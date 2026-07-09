import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  role: 'BUYER' | 'SUPPLIER' | 'ADMIN';
  location?: {
    type: string;
    coordinates: number[];
  };
  businessInfo?: {
    companyName?: string;
    rating?: number;
    totalReviews?: number;
  };
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for OAuth later, required for normal auth
    role: { type: String, enum: ['BUYER', 'SUPPLIER', 'ADMIN'], default: 'BUYER' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    businessInfo: {
      companyName: { type: String },
      rating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Index for geolocation querying
userSchema.index({ location: '2dsphere' });

export const User = mongoose.model<IUser>('User', userSchema);
