
// Add Product with SKU generation logic
import Product from '../models/ProductModel.js';
import Counter from '../models/CounterModel.js'; // Import the counter model
import Supplier from '../models/SupplierModel.js';

// Utility function to generate SKU prefix from product name
const generateSkuPrefix = (name) => {
    // Example: use the first 3 letters of the product name (converted to uppercase)
    return name.trim().substring(0, 3).toUpperCase();
};

// Add Product with SKU generation logic based on product name
export const addProduct = async (req, res) => {
    const { name, price, productionCost, stock, category, status, description, image, supplier, colors, sizes } = req.body;

    if (!name || !price || !productionCost || !stock || !category || !supplier) {
        return res.status(400).json({
            message: 'Please provide all required fields.',
            missingFields: {
                name: !name,
                price: !price,
                productionCost: !productionCost,
                stock: !stock,
                category: !category,
                supplier: !supplier
            }
        });
    }

    try {
        const skuPrefix = generateSkuPrefix(name);
        const counter = await Counter.findOneAndUpdate(
            { name: `SKU_${skuPrefix}` },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        const sku = `${skuPrefix}-${counter.seq.toString().padStart(6, '0')}`;

        const product = new Product({
            name,
            price,
            productionCost, // Include production price
            sku,
            stock,
            category,
            status,
            description,
            image,
            supplier,
            colors,
            sizes,
        });

        const savedProduct = await product.save();
        await Supplier.findByIdAndUpdate(supplier, { $push: { productsSupplied: savedProduct._id } }, { new: true });

        res.status(201).json({ message: 'Product added successfully', product: savedProduct });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Error adding product', error });
    }
};



// Get All Products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        // console.log('Products fetched:', products);
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products', error });
    }
};

// Get Product by ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: 'Error fetching product', error });
    }
};

// Update Product
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product updated successfully', product });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product', error });
    }
};

// Delete Product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error deleting product', error });
    }
};
