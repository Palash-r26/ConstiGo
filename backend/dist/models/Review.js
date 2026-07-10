import mongoose, { Schema } from 'mongoose';
const reviewSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
}, { timestamps: true });
// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
export const Review = mongoose.model('Review', reviewSchema);
