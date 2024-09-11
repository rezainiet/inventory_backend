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
    orderDate: {
        type: Date,
        default: Date.now,
    },
    fulfillmentStatus: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered'],
        default: 'Pending',
    },
    shippingAddress: {
        type: String,
        required: true,
    },
}, { timestamps: true });

// Create the Order model
const Order = mongoose.model('Order', OrderSchema);

export default Order;
