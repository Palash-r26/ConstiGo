import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  role: 'BUYER' | 'SUPPLIER' | 'ADMIN';
  profileImage?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: Date;
  wishlist: Types.ObjectId[];
  addresses: {
    label?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault?: boolean;
  }[];
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
    profileImage: { type: String },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
    dateOfBirth: { type: Date },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    addresses: [
      {
        label: { type: String, default: 'Home' },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      }
    ],
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
