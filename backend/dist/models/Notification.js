import mongoose, { Schema } from 'mongoose';
const notificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, enum: ['ORDER', 'PROMO', 'SYSTEM'], default: 'SYSTEM' },
    isRead: { type: Boolean, default: false },
    data: { type: Schema.Types.Mixed },
}, { timestamps: true });
notificationSchema.index({ user: 1, createdAt: -1 });
export const Notification = mongoose.model('Notification', notificationSchema);
