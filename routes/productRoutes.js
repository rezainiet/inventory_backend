import express from 'express';
import {
    addProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from '../controllers/ProductController.js';

const router = express.Router();

// Routes for Product Management
router.post('/add', addProduct); // Add a new product
router.get('/', getAllProducts); // Get all products
router.get('/:id', getProductById); // Get a product by ID
router.put('/:id', updateProduct); // Update a product
router.delete('/:id', deleteProduct); // Delete a product

export default router;
