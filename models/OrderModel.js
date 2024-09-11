import mongoose from "mongoose";

// Define the schema for the order model
const OrderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    customerPhone: {
        type: String,
        required: true,
    },
    customerEmail: {
        type: String,
        required: false, // Optional if you don't always collect email
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        price: {
            type: Number,
            required: true,
        },
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0, // Amount of discount applied
    },
    tax: {
        type: Number,
        default: 0, // Tax amount
    },
    finalAmount: {
        type: Number,
        required: true,
        // Store final amount = totalAmount - discount + tax
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending',
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'Cash on Delivery'], // Customize as per your options
        required: true,
    },
    fulfillmentStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    shippingAddress: {
        type: String,
        required: true,
    },
    deliveryDate: {
        type: Date,
    },
    trackingNumber: {
        type: String,
        required: false,
    },
    notes: {
        type: String,
        required: false,
    },
}, { timestamps: true });

// Create the Order model
const Order = mongoose.model('Order', OrderSchema);

export default Order;
