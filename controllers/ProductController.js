import Product from '../models/ProductModel.js';
import Counter from '../models/CounterModel.js';
import Supplier from '../models/SupplierModel.js';

// Utility function to generate SKU prefix from product name
const generateSkuPrefix = (name) => {
    return name.trim().substring(0, 3).toUpperCase();
};

// Add Product with SKU generation logic and variant support
export const addProduct = async (req, res) => {
    const { name, price, productionCost, category, status, description, image, supplier, variants } = req.body;

    if (!name || !price || !productionCost || !category || !variants || variants.length === 0) {
        return res.status(400).json({
            message: 'Please provide all required fields.',
            missingFields: {
                name: !name,
                price: !price,
                productionCost: !productionCost,
                category: !category,
                variants: !variants || variants.length === 0
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
        console.log(sku)

        // Calculate total stock and ensure the number of stock is a positive integer.
        const totalStock = variants.reduce((sum, variant) => sum + (parseInt(variant.stock) || 0), 0);

        // Extract unique colors and sizes
        const colors = [...new Set(variants.map(v => v.color))];
        const sizes = [...new Set(variants.map(v => v.size))];

        const product = new Product({
            name,
            price,
            productionCost,
            sku,
            stock: totalStock,
            category,
            status,
            description,
            image,
            supplier,
            colors,
            sizes,
            variants
        });

        const savedProduct = await product.save();
        if (supplier) {
            await Supplier.findByIdAndUpdate(supplier, { $push: { productsSupplied: savedProduct._id } }, { new: true });
        }

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
        const { variants, ...otherFields } = req.body;

        if (variants) {
            // Recalculate total stock
            const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);

            // Extract unique colors and sizes
            const colors = [...new Set(variants.map(v => v.color))];
            const sizes = [...new Set(variants.map(v => v.size))];

            otherFields.stock = totalStock;
            otherFields.colors = colors;
            otherFields.sizes = sizes;
            otherFields.variants = variants;
        }

        const product = await Product.findByIdAndUpdate(req.params.id, otherFields, { new: true });
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
        // Remove the product from the supplier's productsSupplied array
        await Supplier.findByIdAndUpdate(product.supplier, { $pull: { productsSupplied: product._id } });
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error deleting product', error });
    }
};

// Get Product Variants
export const getProductVariants = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product.variants);
    } catch (error) {
        console.error('Error fetching product variants:', error);
        res.status(500).json({ message: 'Error fetching product variants', error });
    }
};

// Update Product Variant
export const updateProductVariant = async (req, res) => {
    try {
        const { variantId } = req.params;
        const { color, size, stock } = req.body;

        const product = await Product.findOneAndUpdate(
            { 'variants._id': variantId },
            {
                $set: {
                    'variants.$.color': color,
                    'variants.$.size': size,
                    'variants.$.stock': stock
                }
            },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product or variant not found' });
        }

        // Recalculate total stock
        const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);

        // Update colors and sizes
        const colors = [...new Set(product.variants.map(v => v.color))];
        const sizes = [...new Set(product.variants.map(v => v.size))];

        product.stock = totalStock;
        product.colors = colors;
        product.sizes = sizes;

        await product.save();

        res.status(200).json({ message: 'Product variant updated successfully', product });
    } catch (error) {
        console.error('Error updating product variant:', error);
        res.status(500).json({ message: 'Error updating product variant', error });
    }
};