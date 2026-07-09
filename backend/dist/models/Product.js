import mongoose, { Schema } from 'mongoose';
const productSchema = new Schema({
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
}, { timestamps: true });
export const Product = mongoose.model('Product', productSchema);
