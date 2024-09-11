import mongoose from "mongoose";

// Define the schema for the supplier model
const SupplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    contactPerson: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email address'],
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        match: [/^\+?[1-9]\d{1,4}?\d{9,15}$/, 'Please enter a valid phone number with country code'],
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    productsSupplied: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product model
    }],
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
    lastOrderDate: {
        type: Date,
    },
}, { timestamps: true });

// Create the Supplier model
const Supplier = mongoose.model('Supplier', SupplierSchema);

export default Supplier;
