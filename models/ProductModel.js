import mongoose from 'mongoose';

const VariantSchema = new mongoose.Schema({
    color: String,
    size: String,
    stock: Number
});

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

    category: {
        type: String,
        required: true,
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
    },
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    productionCost: {
        type: Number,
        required: true,
        min: 0,
    },
    image: {
        type: String,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    colors: [{
        type: String,
        trim: true,
    }],
    sizes: [{
        type: String,
        trim: true,
    }],
    variants: [VariantSchema],
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);
export default Product;