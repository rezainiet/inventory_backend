import mongoose from "mongoose";
// Define the schema for the inventory list model
const InventoryListSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
    dateAdded: {
        type: Date,
        default: Date.now,
    },
    action: {
        type: String,
        enum: ['Added', 'Removed'],
    },
    notes: {
        type: String,
        trim: true,
    },
}, { timestamps: true });

// Create the InventoryList model
const InventoryList = mongoose.model('InventoryList', InventoryListSchema);

export default InventoryList;
