import mongoose, { Schema } from 'mongoose';
const orderSchema = new Schema({
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [
        {
            product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            price: { type: Number, required: true },
        },
    ],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], required: true },
        },
    },
    totalPrice: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING',
    },
    paymentMethod: {
        type: String,
        enum: ['CASH', 'RAZORPAY'],
        default: 'CASH',
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
}, { timestamps: true });
export const Order = mongoose.model('Order', orderSchema);
