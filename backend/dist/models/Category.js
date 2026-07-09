import mongoose, { Schema } from 'mongoose';
const categorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String },
    description: { type: String },
}, { timestamps: true });
export const Category = mongoose.model('Category', categorySchema);
