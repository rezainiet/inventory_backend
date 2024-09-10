import mongoose from 'mongoose'; // Use import if using ES modules

// Define the schema for the product model
const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    sku: {
        type: String,
        required: true,
        unique: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    category: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['In Stock', 'Out of Stock', 'Low Stock'],
        default: 'In Stock',
    },
    description: {
        type: String,
        trim: true,
    },
    image: {
        type: String,
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        // required: true,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
    colors: [{
        type: String,
        trim: true,
    }],
    sizes: [{
        type: String,
        trim: true,
    }],
}, { timestamps: true });

// Export the model using default export
const Product = mongoose.model('Product', ProductSchema);
export default Product;
